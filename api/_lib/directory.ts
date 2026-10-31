export const directoryCategories = [
  'community',
  'convention',
  'artist',
  'organization',
  'industry',
  'resource',
] as const

export const directoryRegions = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East & Africa',
] as const

export type DirectoryCursor = {
  created_at: string
  id: string
}

export type DirectoryQuery = {
  q: string | null
  category: (typeof directoryCategories)[number] | null
  region: (typeof directoryRegions)[number] | null
  country: string | null
  limit: number
  cursor: string | null
}

export type DirectoryQueryResult =
  | { ok: true; value: DirectoryQuery }
  | { ok: false; message: string }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const safeSearchPattern = /^[\p{L}\p{N} -]{1,100}$/u

export function parseDirectoryQuery(url: URL): DirectoryQueryResult {
  const rawQuery = url.searchParams.get('q')
  const q = rawQuery?.normalize('NFC').trim() ?? ''
  if (q.length > 100 || (q.length > 0 && !safeSearchPattern.test(q))) {
    return { ok: false, message: 'Search must be 1–100 letters, numbers, spaces or hyphens.' }
  }

  const rawCategory = url.searchParams.get('category')
  if (rawCategory && !directoryCategories.includes(rawCategory as typeof directoryCategories[number])) {
    return { ok: false, message: 'Unsupported listing category.' }
  }

  const rawRegion = url.searchParams.get('region')
  if (rawRegion && !directoryRegions.includes(rawRegion as typeof directoryRegions[number])) {
    return { ok: false, message: 'Unsupported region.' }
  }

  const rawCountry = url.searchParams.get('country')
  const country = rawCountry?.toUpperCase() ?? null
  if (country && !/^[A-Z]{2}$/.test(country)) {
    return { ok: false, message: 'Country must be a two-letter ISO country code.' }
  }

  const rawLimit = url.searchParams.get('limit')
  const limit = rawLimit === null ? 20 : Number(rawLimit)
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return { ok: false, message: 'Limit must be an integer from 1 to 50.' }
  }

  const cursor = url.searchParams.get('cursor')
  if (cursor && cursor.length > 512) {
    return { ok: false, message: 'Cursor is invalid or too large.' }
  }

  return {
    ok: true,
    value: {
      q: q || null,
      category: rawCategory as DirectoryQuery['category'],
      region: rawRegion as DirectoryQuery['region'],
      country,
      limit,
      cursor,
    },
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function base64UrlDecode(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid base64url.')
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function cursorKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function encodeDirectoryCursor(
  cursor: DirectoryCursor,
  secret: string,
): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify({ v: 1, iat: Date.now(), ...cursor }))
  const key = await cursorKey(secret)
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, toArrayBuffer(payload)))
  return `${base64UrlEncode(payload)}.${base64UrlEncode(signature)}`
}

export async function decodeDirectoryCursor(
  token: string,
  secret: string,
): Promise<DirectoryCursor | null> {
  try {
    const [encodedPayload, encodedSignature, extra] = token.split('.')
    if (!encodedPayload || !encodedSignature || extra !== undefined) return null
    const payload = base64UrlDecode(encodedPayload)
    const signature = base64UrlDecode(encodedSignature)
    const key = await cursorKey(secret)
    const valid = await crypto.subtle.verify('HMAC', key, toArrayBuffer(signature), toArrayBuffer(payload))
    if (!valid) return null

    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(payload))
    if (typeof value !== 'object' || value === null) return null
    const record = value as Record<string, unknown>
    if (
      record.v !== 1 ||
      typeof record.iat !== 'number' ||
      !Number.isSafeInteger(record.iat) ||
      record.iat > Date.now() + 5 * 60 * 1000 ||
      Date.now() - record.iat > 24 * 60 * 60 * 1000 ||
      typeof record.created_at !== 'string' ||
      typeof record.id !== 'string' ||
      !uuidPattern.test(record.id) ||
      !Number.isFinite(Date.parse(record.created_at)) ||
      new Date(record.created_at).toISOString() !== record.created_at
    ) return null

    return { created_at: record.created_at, id: record.id }
  } catch {
    return null
  }
}

export export function applyDirectoryFilters(
  endpoint: URL,
  query: DirectoryQuery,
  cursor: DirectoryCursor | null,
): void {
  if (query.category) endpoint.searchParams.set('category', `eq.${query.category}`)
  if (query.region) endpoint.searchParams.set('region', `eq.${query.region}`)
  if (query.country) endpoint.searchParams.set('country_code', `eq.${query.country}`)

  const filters: string[] = []
  if (query.q) filters.push(`or(name.ilike.*${query.q}*,summary.ilike.*${query.q}*)`)
  if (cursor) {
    filters.push(
      `or(created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.gt.${cursor.id}))`,
    )
  }

  if (filters.length === 1) {
    endpoint.searchParams.set('or', filters[0].slice(3, -1))
  } else if (filters.length > 1) {
    endpoint.searchParams.set('and', `(${filters.join(',')})`)
  }
}

function toPublicListing(value: Record<string, unknown>) {
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    category: value.category,
    summary: value.summary,
    region: value.region,
    country_code: value.country_code ?? null,
    website_url: value.website_url,
    source_url: value.source_url,
    is_featured: value.is_featured === true,
    verified_at: value.verified_at ?? null,
    created_at: value.created_at,
  }
}

export function isPublicListingRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const row = value as Record<string, unknown>
  return (
    typeof row.id === 'string' &&
    uuidPattern.test(row.id) &&
    typeof row.name === 'string' &&
    typeof row.slug === 'string' &&
    typeof row.category === 'string' &&
    directoryCategories.includes(row.category as typeof directoryCategories[number]) &&
    typeof row.summary === 'string' &&
    typeof row.region === 'string' &&
    directoryRegions.includes(row.region as typeof directoryRegions[number]) &&
    (row.country_code === null || typeof row.country_code === 'string') &&
    typeof row.website_url === 'string' &&
    typeof row.source_url === 'string' &&
    typeof row.is_featured === 'boolean' &&
    (row.verified_at === null || typeof row.verified_at === 'string') &&
    typeof row.created_at === 'string' &&
    Number.isFinite(Date.parse(row.created_at))
  )
}

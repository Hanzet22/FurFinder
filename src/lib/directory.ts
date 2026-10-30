export type DirectoryCategory =
  | 'community'
  | 'convention'
  | 'artist'
  | 'organization'
  | 'industry'
  | 'resource'

export type DirectoryListing = {
  id: string
  name: string
  slug: string
  category: DirectoryCategory
  summary: string
  region: string
  country_code: string | null
  website_url: string
  source_url: string
  is_featured: boolean
  verified_at: string | null
  created_at: string
}

const categories = new Set<DirectoryCategory>([
  'community',
  'convention',
  'artist',
  'organization',
  'industry',
  'resource',
])
const regions = new Set([
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East & Africa',
])
const fields = new Set([
  'id', 'name', 'slug', 'category', 'summary', 'region', 'country_code',
  'website_url', 'source_url', 'is_featured', 'verified_at', 'created_at',
])
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const countryCode = /^[A-Z]{2}$/
const dateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isDateTime(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = dateTime.exec(value)
  if (!match || Number.isNaN(Date.parse(value))) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && hour <= 23 && minute <= 59 && second <= 59
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.length > 0
      && !url.username && !url.password
  } catch {
    return false
  }
}

function isDirectoryListing(value: unknown): value is DirectoryListing {
  if (!isRecord(value) || Object.keys(value).some((key) => !fields.has(key))) return false
  return (
    Object.keys(value).length === fields.size &&
    typeof value.id === 'string' && uuid.test(value.id) &&
    typeof value.name === 'string' && value.name.trim().length >= 2 && value.name.length <= 120 &&
    typeof value.slug === 'string' && value.slug.length <= 120 && slug.test(value.slug) &&
    typeof value.category === 'string' && categories.has(value.category as DirectoryCategory) &&
    typeof value.summary === 'string' && value.summary.trim().length >= 20 && value.summary.length <= 500 &&
    typeof value.region === 'string' && regions.has(value.region) &&
    (value.country_code === null || (typeof value.country_code === 'string' && countryCode.test(value.country_code))) &&
    isHttpsUrl(value.website_url) &&
    isHttpsUrl(value.source_url) &&
    typeof value.is_featured === 'boolean' &&
    (value.verified_at === null || isDateTime(value.verified_at)) &&
    isDateTime(value.created_at)
  )
}

export async function fetchListings(signal?: AbortSignal): Promise<DirectoryListing[]> {
  const response = await fetch('/api/v1/listings', {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Directory request failed (${response.status}).`)
  }

  const payload: unknown = await response.json()
  if (
    !isRecord(payload) ||
    Object.keys(payload).some((key) => !['ok', 'version', 'data'].includes(key)) ||
    payload.ok !== true ||
    payload.version !== 'v1' ||
    !Array.isArray(payload.data) ||
    payload.data.length > 60 ||
    !payload.data.every(isDirectoryListing)
  ) {
    throw new Error('Directory service returned data outside the public API contract.')
  }

  return payload.data
}

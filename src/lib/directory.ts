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

export type DirectoryPage = {
  data: DirectoryListing[]
  page: {
    next_cursor: string | null
    has_more: boolean
    limit: number
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isDirectoryListing(value: unknown): value is DirectoryListing {
  if (!isRecord(value)) return false

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.category === 'string' &&
    categories.has(value.category as DirectoryCategory) &&
    typeof value.summary === 'string' &&
    typeof value.region === 'string' &&
    regions.has(value.region) &&
    isNullableString(value.country_code) &&
    isHttpsUrl(value.website_url) &&
    isHttpsUrl(value.source_url) &&
    typeof value.is_featured === 'boolean' &&
    isNullableString(value.verified_at) &&
    typeof value.created_at === 'string'
  )
}

function isDirectoryPage(value: unknown): value is DirectoryPage {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    value.data.every(isDirectoryListing) &&
    isRecord(value.page) &&
    (value.page.next_cursor === null || typeof value.page.next_cursor === 'string') &&
    typeof value.page.has_more === 'boolean' &&
    typeof value.page.limit === 'number'
  )
}

export async function fetchListings(
  signal?: AbortSignal,
  cursor: string | null = null,
): Promise<DirectoryPage> {
  const endpoint = new URL('/api/v1/listings', window.location.origin)
  if (cursor) endpoint.searchParams.set('cursor', cursor)

  const response = await fetch(endpoint, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Directory request failed (${response.status}).`)
  }

  const payload: unknown = await response.json()
  if (!isDirectoryPage(payload)) {
    throw new Error('Directory service returned data in an unexpected format.')
  }

  return payload
}

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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

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

export const DIRECTORY_PAGE_SIZE = 60

export async function fetchListings(
  signal?: AbortSignal,
  offset = 0,
): Promise<DirectoryListing[]> {
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Directory service is not configured yet.')
  }

  const endpoint = new URL('/rest/v1/listings', supabaseUrl)
  endpoint.searchParams.set(
    'select',
    'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at',
  )
  endpoint.searchParams.set('status', 'eq.published')
  endpoint.searchParams.set('order', 'is_featured.desc,created_at.desc,id.asc')
  endpoint.searchParams.set('limit', String(DIRECTORY_PAGE_SIZE))
  endpoint.searchParams.set('offset', String(Math.max(0, Math.floor(offset))))

  const response = await fetch(endpoint, {
    signal,
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Directory request failed (${response.status}).`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !payload.every(isDirectoryListing)) {
    throw new Error('Directory service returned data in an unexpected format.')
  }

  return payload
}

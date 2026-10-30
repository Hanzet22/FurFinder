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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export async function fetchListings(): Promise<DirectoryListing[]> {
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Directory service is not configured yet.')
  }

  const endpoint = new URL('/rest/v1/listings', supabaseUrl)
  endpoint.searchParams.set(
    'select',
    'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at',
  )
  endpoint.searchParams.set('status', 'eq.published')
  endpoint.searchParams.set('order', 'is_featured.desc,created_at.desc')
  endpoint.searchParams.set('limit', '60')

  const response = await fetch(endpoint, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Directory request failed (${response.status}).`)
  }

  return (await response.json()) as DirectoryListing[]
}

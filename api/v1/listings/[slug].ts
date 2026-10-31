import {
  isPublicListingRecord,
  parseDirectorySlug,
  toPublicListing,
} from '../../_lib/directory'
import { getSupabaseConfig, json, methodNotAllowed } from '../../_lib/moderation'

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    const segments = new URL(request.url).pathname.split('/').filter(Boolean)
    if (segments.length !== 4 || segments[0] !== 'api' || segments[1] !== 'v1' || segments[2] !== 'listings') {
      return json({ ok: false, message: 'Listing not found.' }, 404)
    }

    let decodedSlug = ''
    try {
      decodedSlug = decodeURIComponent(segments[3])
    } catch {
      return json({ ok: false, message: 'Listing slug is invalid.' }, 400)
    }

    const slug = parseDirectorySlug(decodedSlug)
    if (!slug) return json({ ok: false, message: 'Listing slug is invalid.' }, 400)

    const config = getSupabaseConfig()
    if (!config) {
      return json({ ok: false, message: 'Directory service is not configured.' }, 503)
    }

    const endpoint = new URL('/rest/v1/listings', config.url)
    endpoint.searchParams.set(
      'select',
      'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at',
    )
    endpoint.searchParams.set('status', 'eq.published')
    endpoint.searchParams.set('slug', `eq.${slug}`)
    endpoint.searchParams.set('limit', '1')

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: config.publishableKey,
          Authorization: `Bearer ${config.publishableKey}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(7000),
      })

      if (!response.ok) {
        return json({ ok: false, message: 'Directory data is temporarily unavailable.' }, 502)
      }

      const rows: unknown = await response.json()
      if (!Array.isArray(rows) || !rows.every(isPublicListingRecord)) {
        return json({ ok: false, message: 'Directory data returned an unexpected response.' }, 502)
      }

      if (rows.length === 0) {
        return json({ ok: false, message: 'Listing not found.' }, 404)
      }

      return json({ data: toPublicListing(rows[0]) })
    } catch {
      return json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 503)
    }
  },
}

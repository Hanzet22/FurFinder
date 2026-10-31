import { isPublicListingsResponse } from '../../lib/validate-listings-response'

declare const process: { env: Record<string, string | undefined> }

function json(body: Record<string, unknown>, status = 200, cache = 'no-store'): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

// Use Vercel's documented Web Request/Response fetch-handler export.
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return json({ ok: false, message: 'Method not allowed.' }, 405)

    const rawUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    if (!rawUrl || !key) return json({ ok: false, message: 'Directory service is not configured.' }, 503)

    let base: URL
    try {
      base = new URL(rawUrl)
      if (base.protocol !== 'https:') throw new Error('HTTPS required')
    } catch {
      return json({ ok: false, message: 'Directory service is unavailable.' }, 503)
    }

    const url = new URL('/rest/v1/listings', base)
    url.searchParams.set('select', 'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at')
    url.searchParams.set('status', 'eq.published')
    url.searchParams.set('order', 'is_featured.desc,created_at.desc')
    url.searchParams.set('limit', '60')

    try {
      const response = await fetch(url, {
        headers: {
          apikey: key,
          Authorization: 'Bearer ' + key,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(7000),
      })
      if (!response.ok) return json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 502)

      const data: unknown = await response.json()
      if (!Array.isArray(data)) return json({ ok: false, message: 'Unexpected directory response.' }, 502)

      const payload = { ok: true, version: 'v1', data }
      if (!isPublicListingsResponse(payload)) {
        return json({ ok: false, message: 'Directory returned data outside the public API contract.' }, 502)
      }

      return json(payload, 200, 'public, s-maxage=60, stale-while-revalidate=300')
    } catch {
      return json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 503)
    }
  },
}

import {
  authenticateModerator,
  callAdminRest,
  json,
  methodNotAllowed,
} from '../../_lib/moderation'

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    const access = await authenticateModerator(request)
    if (!access.ok) return access.response

    const endpoint = new URL('/rest/v1/listings', access.config.url)
    endpoint.searchParams.set(
      'select',
      'id,name,slug,category,summary,region,country_code,website_url,source_url,created_at',
    )
    endpoint.searchParams.set('status', 'eq.pending')
    endpoint.searchParams.set('order', 'created_at.asc,id.asc')
    endpoint.searchParams.set('limit', '100')

    try {
      const response = await callAdminRest(
        access.config,
        `${endpoint.pathname}${endpoint.search}`,
        { method: 'GET', headers: { Accept: 'application/json' } },
      )

      if (!response.ok) {
        return json({ ok: false, message: 'Could not load the pending queue.' }, 502)
      }

      const listings: unknown = await response.json()
      if (!Array.isArray(listings)) {
        return json({ ok: false, message: 'The moderation queue returned an unexpected response.' }, 502)
      }

      return json({
        ok: true,
        moderator: access.moderator,
        listings,
      })
    } catch {
      return json({ ok: false, message: 'The moderation queue is temporarily unavailable.' }, 503)
    }
  },
}

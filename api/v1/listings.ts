import {
  decodeDirectoryCursor,
  encodeDirectoryCursor,
  isPublicListingRecord,
  parseDirectoryQuery,
  toPublicListing,
} from '../_lib/directory'
import { getSupabaseConfig, json, methodNotAllowed } from '../_lib/moderation'

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')

    const parsed = parseDirectoryQuery(new URL(request.url))
    if (!parsed.ok) return json({ ok: false, message: parsed.message }, 400)

    const config = getSupabaseConfig()
    if (!config) {
      return json({ ok: false, message: 'Directory service is not configured.' }, 503)
    }

    const { q, category, region, country, limit, cursor: cursorToken } = parsed.value
    let cursor: { created_at: string; id: string } | null = null
    if (cursorToken) {
      cursor = await decodeDirectoryCursor(cursorToken, config.secretKey)
      if (!cursor) return json({ ok: false, message: 'Cursor is invalid or expired.' }, 400)
    }

    const endpoint = new URL('/rest/v1/listings', config.url)
    endpoint.searchParams.set(
      'select',
      'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at',
    )
    endpoint.searchParams.set('status', 'eq.published')
    endpoint.searchParams.set('order', 'created_at.desc,id.asc')
    endpoint.searchParams.set('limit', String(limit + 1))

    if (category) endpoint.searchParams.set('category', `eq.${category}`)
    if (region) endpoint.searchParams.set('region', `eq.${region}`)
    if (country) endpoint.searchParams.set('country_code', `eq.${country}`)
    const filters: string[] = []
    if (q) filters.push(`or(name.ilike.*${q}*,summary.ilike.*${q}*)`)
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

      const hasMore = rows.length > limit
      const pageRows = rows.slice(0, limit)
      const lastRow = pageRows.at(-1)
      const nextCursor = hasMore && lastRow
        ? await encodeDirectoryCursor(
            { created_at: String(lastRow.created_at), id: String(lastRow.id) },
            config.secretKey,
          )
        : null

      return json({
        data: pageRows.map(toPublicListing),
        page: {
          next_cursor: nextCursor,
          has_more: hasMore,
          limit,
        },
      })
    } catch {
      return json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 503)
    }
  },
}

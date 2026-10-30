declare const process: { env: Record<string, string | undefined> }

type ApiRequest = {
  method?: string
}

type ApiResponse = {
  status(code: number): ApiResponse
  setHeader(name: string, value: string): void
  json(body: Record<string, unknown>): void
}

export default async function handler(request: ApiRequest, response: ApiResponse): Promise<void> {
  const json = (body: Record<string, unknown>, status = 200, cache = 'no-store') => {
    response.setHeader('Cache-Control', cache)
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.status(status).json(body)
  }

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    json({ ok: false, message: 'Method not allowed.' }, 405)
    return
  }

  const rawUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!rawUrl || !key) {
    json({ ok: false, message: 'Directory service is not configured.' }, 503)
    return
  }

  let base: URL
  try {
    base = new URL(rawUrl)
    if (base.protocol !== 'https:') throw new Error('HTTPS required')
  } catch {
    json({ ok: false, message: 'Directory service is unavailable.' }, 503)
    return
  }

  const url = new URL('/rest/v1/listings', base)
  url.searchParams.set('select', 'id,name,slug,category,summary,region,country_code,website_url,source_url,is_featured,verified_at,created_at')
  url.searchParams.set('status', 'eq.published')
  url.searchParams.set('order', 'is_featured.desc,created_at.desc')
  url.searchParams.set('limit', '60')

  try {
    const upstream = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(7000),
    })

    if (!upstream.ok) {
      json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 502)
      return
    }

    const data: unknown = await upstream.json()
    if (!Array.isArray(data)) {
      json({ ok: false, message: 'Unexpected directory response.' }, 502)
      return
    }

    json(
      { ok: true, version: 'v1', data },
      200,
      'public, s-maxage=60, stale-while-revalidate=300',
    )
  } catch {
    json({ ok: false, message: 'Directory service is temporarily unavailable.' }, 503)
  }
}

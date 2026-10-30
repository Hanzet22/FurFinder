export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return Response.json(
        { ok: false, message: 'Method not allowed.' },
        { status: 405, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return Response.json(
      { ok: true, service: 'furfinder-api', version: 'v1' },
      {
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      },
    )
  },
}

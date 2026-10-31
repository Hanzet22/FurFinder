import { isJsonContentType, readBoundedBody } from '../../_lib/request'
import {
  authenticateModerator,
  callAdminRest,
  json,
  sameOrigin,
} from '../../_lib/moderation'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      const response = json({ ok: false, message: 'Method not allowed.' }, 405)
      response.headers.set('Allow', 'POST')
      return response
    }
    if (!sameOrigin(request)) {
      return json({ ok: false, message: 'Cross-origin requests are not accepted.' }, 403)
    }

    if (!isJsonContentType(request.headers.get('content-type'))) {
      return json({ ok: false, message: 'Content-Type must be application/json.' }, 415)
    }

    const body = await readBoundedBody(request, 4096)
    if (!body.ok) {
      return json(
        { ok: false, message: body.reason === 'too_large' ? 'Request is too large.' : 'Could not read request body.' },
        body.reason === 'too_large' ? 413 : 400,
      )
    }

    const access = await authenticateModerator(request)
    if (!access.ok) return access.response

    let input: unknown
    try {
      input = JSON.parse(body.text)
    } catch {
      return json({ ok: false, message: 'Invalid JSON request.' }, 400)
    }

    if (!isRecord(input)) return json({ ok: false, message: 'Invalid review request.' }, 400)

    const listingId = typeof input.listing_id === 'string' ? input.listing_id : ''
    const decision = input.decision
    const note = input.note === undefined || input.note === null
      ? null
      : typeof input.note === 'string'
        ? input.note.trim()
        : null

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listingId)) {
      return json({ ok: false, message: 'Invalid listing identifier.' }, 400)
    }
    if (decision !== 'publish' && decision !== 'reject') {
      return json({ ok: false, message: 'Choose publish or reject.' }, 400)
    }
    if (input.note !== undefined && input.note !== null && typeof input.note !== 'string') {
      return json({ ok: false, message: 'Review note must be text.' }, 400)
    }
    if (note !== null && note.length > 500) {
      return json({ ok: false, message: 'Review note must be 500 characters or fewer.' }, 400)
    }

    try {
      const response = await callAdminRest(
        access.config,
        '/rest/v1/rpc/review_listing',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            p_listing_id: listingId,
            p_moderator_id: access.moderator.id,
            p_decision: decision,
            p_note: note,
          }),
        },
      )

      if (!response.ok) {
        const status = response.status === 404 ? 404 : 409
        return json({
          ok: false,
          message: 'This listing could not be reviewed. It may have already been handled or its record may be unavailable.',
        }, status)
      }

      const result: unknown = await response.json()
      return json({ ok: true, result })
    } catch {
      return json({ ok: false, message: 'The review service is temporarily unavailable.' }, 503)
    }
  },
}

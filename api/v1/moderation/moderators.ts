import {
  authenticateModerator,
  callAdminRest,
  json,
  methodNotAllowed,
  sameOrigin,
} from '../../_lib/moderation'
import { readBoundedBody } from '../../_lib/request'

const userIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (!['GET', 'POST', 'PATCH'].includes(request.method)) {
      return methodNotAllowed('GET, POST, PATCH')
    }

    const access = await authenticateModerator(request)
    if (!access.ok) return access.response
    if (access.moderator.role !== 'admin') {
      return json({ ok: false, message: 'Only an admin can manage moderator access.' }, 403)
    }

    if (request.method === 'GET') {
      try {
        const response = await callAdminRest(
          access.config,
          '/rest/v1/moderators?select=user_id,role,active,created_at&order=created_at.asc',
          { method: 'GET', headers: { Accept: 'application/json' } },
        )
        if (!response.ok) {
          return json({ ok: false, message: 'Could not load moderator access.' }, 502)
        }

        const rows: unknown = await response.json()
        if (!Array.isArray(rows)) {
          return json({ ok: false, message: 'Moderator access returned an unexpected response.' }, 502)
        }

        return json({ ok: true, moderators: rows })
      } catch {
        return json({ ok: false, message: 'Moderator access is temporarily unavailable.' }, 503)
      }
    }

    if (!sameOrigin(request)) {
      return json({ ok: false, message: 'Cross-origin requests are not accepted.' }, 403)
    }
    const contentType = (request.headers.get('content-type') ?? '').split(';', 1)[0].trim().toLowerCase()
    if (contentType !== 'application/json') {
      return json({ ok: false, message: 'Content-Type must be application/json.' }, 415)
    }

    const body = await readBoundedBody(request, 1024)
    if (!body.ok) {
      return json(
        { ok: false, message: body.reason === 'too_large' ? 'Request is too large.' : 'Could not read request body.' },
        body.reason === 'too_large' ? 413 : 400,
      )
    }

    let input: unknown
    try {
      input = JSON.parse(body.text)
    } catch {
      return json({ ok: false, message: 'Invalid JSON request.' }, 400)
    }
    if (!isRecord(input) || typeof input.user_id !== 'string' || !userIdPattern.test(input.user_id)) {
      return json({ ok: false, message: 'Enter a valid Supabase Auth user ID.' }, 400)
    }

    const userId = input.user_id

    if (request.method === 'POST') {
      try {
        const existing = await callAdminRest(
          access.config,
          `/rest/v1/moderators?select=user_id&user_id=eq.${userId}&limit=1`,
          { method: 'GET', headers: { Accept: 'application/json' } },
        )
        if (!existing.ok) {
          return json({ ok: false, message: 'Could not check existing moderator access.' }, 502)
        }
        const rows: unknown = await existing.json()
        if (!Array.isArray(rows)) {
          return json({ ok: false, message: 'Moderator access returned an unexpected response.' }, 502)
        }
        if (rows.length > 0) {
          return json({ ok: false, message: 'This user already has a moderator record.' }, 409)
        }

        const created = await callAdminRest(
          access.config,
          '/rest/v1/moderators',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              user_id: userId,
              role: 'reviewer',
              active: true,
            }),
          },
        )
        if (!created.ok) {
          return json({ ok: false, message: 'Could not add this reviewer. Check the user ID and try again.' }, 409)
        }
        return json({ ok: true, message: 'Reviewer access has been added.' }, 201)
      } catch {
        return json({ ok: false, message: 'Could not add reviewer access right now.' }, 503)
      }
    }

    if (typeof input.active !== 'boolean') {
      return json({ ok: false, message: 'Choose whether reviewer access should be active.' }, 400)
    }

    try {
      const updated = await callAdminRest(
        access.config,
        `/rest/v1/moderators?user_id=eq.${userId}&role=eq.reviewer`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ active: input.active }),
        },
      )
      if (!updated.ok) {
        return json({ ok: false, message: 'Could not update reviewer access.' }, 409)
      }

      const rows: unknown = await updated.json()
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ ok: false, message: 'Reviewer not found. Admin access cannot be changed here.' }, 404)
      }

      return json({
        ok: true,
        message: input.active ? 'Reviewer access has been reactivated.' : 'Reviewer access has been deactivated.',
      })
    } catch {
      return json({ ok: false, message: 'Could not update reviewer access right now.' }, 503)
    }
  },
}

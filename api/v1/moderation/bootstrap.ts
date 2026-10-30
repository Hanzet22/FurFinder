import {
  authenticateUser,
  callAdminRest,
  getModeratorCount,
  json,
  sameOrigin,
} from '../../_lib/moderation'

declare const process: {
  env: Record<string, string | undefined>
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return json({ ok: false, message: 'Method not allowed.' }, 405)
    }
    if (!sameOrigin(request)) {
      return json({ ok: false, message: 'Cross-origin requests are not accepted.' }, 403)
    }

    const auth = await authenticateUser(request)
    if (!auth.ok) return auth.response

    const bootstrapEmail = process.env.MODERATOR_BOOTSTRAP_EMAIL?.trim().toLowerCase()
    if (!bootstrapEmail) {
      return json({ ok: false, message: 'First-admin bootstrap is not enabled. Ask the project owner to configure it.' }, 403)
    }

    if (!auth.user.email_confirmed_at) {
      return json({ ok: false, message: 'Verify the email address on this account before first-admin setup.' }, 403)
    }

    if (!auth.user.email || auth.user.email.toLowerCase() !== bootstrapEmail) {
      return json({ ok: false, message: 'This signed-in email is not the configured first-admin account.' }, 403)
    }

    try {
      const count = await getModeratorCount(auth.config)
      if (count === null) {
        return json({ ok: false, message: 'Could not check moderator setup.' }, 502)
      }
      if (count !== 0) {
        return json({ ok: false, message: 'Moderator setup has already been initialized.' }, 409)
      }

      const response = await callAdminRest(
        auth.config,
        '/rest/v1/moderators',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            user_id: auth.user.id,
            role: 'admin',
            active: true,
          }),
        },
      )

      if (!response.ok) {
        return json({ ok: false, message: 'Could not create the first moderator. The setup may already have been claimed.' }, 409)
      }

      return json({
        ok: true,
        message: 'Moderator admin access is enabled for this account. Remove MODERATOR_BOOTSTRAP_EMAIL from Vercel now.',
      }, 201)
    } catch {
      return json({ ok: false, message: 'First-admin setup is temporarily unavailable.' }, 503)
    }
  },
}

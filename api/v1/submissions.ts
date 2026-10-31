import { isJsonContentType, readBoundedBody } from '../_lib/request'
import {
  createPendingListing,
  validateListingSubmission,
} from '../_lib/submission'

declare const process: {
  env: Record<string, string | undefined>
}

function json(body: Record<string, unknown>, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function verifyTurnstile(
  token: string,
  secret: string,
  expectedHostname: string,
): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
  })

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(7000),
    },
  )

  if (!response.ok) return false
  const result: unknown = await response.json()
  return (
    isRecord(result) &&
    result.success === true &&
    result.action === 'listing_submission' &&
    result.hostname === expectedHostname
  )
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      const response = json({ ok: false, message: 'Method not allowed.' }, 405)
      response.headers.set('Allow', 'POST')
      return response
    }

    const requestUrl = new URL(request.url)
    const origin = request.headers.get('origin')
    if (!origin) return json({ ok: false, message: 'Origin is required.' }, 403)

    try {
      if (new URL(origin).origin !== requestUrl.origin) {
        return json({ ok: false, message: 'Cross-origin requests are not accepted.' }, 403)
      }
    } catch {
      return json({ ok: false, message: 'Invalid request origin.' }, 403)
    }

    if (!isJsonContentType(request.headers.get('content-type'))) {
      return json({ ok: false, message: 'Content-Type must be application/json.' }, 415)
    }

    const body = await readBoundedBody(request, 8192)
    if (!body.ok) {
      return json(
        { ok: false, message: body.reason === 'too_large' ? 'Submission is too large.' : 'Could not read submission body.' },
        body.reason === 'too_large' ? 413 : 400,
      )
    }
    const bodyText = body.text

    let input: unknown
    try {
      input = JSON.parse(bodyText)
    } catch {
      return json({ ok: false, message: 'Invalid JSON payload.' }, 400)
    }

    if (
      isRecord(input) &&
      typeof input.company_website === 'string' &&
      input.company_website.trim().length > 0
    ) {
      // Quietly discard automated honeypot submissions.
      return json({ ok: true, message: 'Submission received for review.' }, 202)
    }

    const validation = validateListingSubmission(input)
    if (!validation.ok) {
      return json({ ok: false, message: validation.message }, 400)
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
    const supabaseSecret =
      process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!turnstileSecret || !supabaseUrl || !supabaseSecret) {
      return json(
        { ok: false, message: 'Submission service is not configured yet.' },
        503,
      )
    }

    let databaseUrl: URL
    try {
      databaseUrl = new URL(supabaseUrl)
    } catch {
      return json({ ok: false, message: 'Submission service is unavailable.' }, 503)
    }
    if (databaseUrl.protocol !== 'https:') {
      return json({ ok: false, message: 'Submission service is unavailable.' }, 503)
    }

    try {
      const verified = await verifyTurnstile(
        validation.value.turnstileToken,
        turnstileSecret,
        requestUrl.hostname,
      )
      if (!verified) {
        return json(
          { ok: false, message: 'Verification expired or could not be confirmed. Please try again.' },
          400,
        )
      }

      const listing = createPendingListing(
        validation.value,
        crypto.randomUUID(),
      )
      const insertResponse = await fetch(
        new URL('/rest/v1/listings', databaseUrl),
        {
          method: 'POST',
          headers: {
            apikey: supabaseSecret,
            ...(supabaseSecret.startsWith('sb_secret_')
              ? {}
              : { Authorization: `Bearer ${supabaseSecret}` }),
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(listing),
          signal: AbortSignal.timeout(7000),
        },
      )

      if (!insertResponse.ok) {
        // Keep database details and credentials out of public responses.
        return json(
          { ok: false, message: 'We could not save this submission. Please try again later.' },
          502,
        )
      }

      return json(
        { ok: true, message: 'Thanks! Your listing is now queued for moderator review.' },
        201,
      )
    } catch {
      return json(
        { ok: false, message: 'Submission service is temporarily unavailable.' },
        503,
      )
    }
  },
}

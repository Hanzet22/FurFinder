declare const process: {
  env: Record<string, string | undefined>
}

export type SupabaseConfig = {
  url: URL
  publishableKey: string
  secretKey: string
}

export type AuthenticatedUser = {
  id: string
  email: string | null
  email_confirmed_at?: string | null
}

export type Moderator = {
  id: string
  email: string | null
  role: 'admin' | 'reviewer'
}

export type AuthResult =
  | { ok: true; user: AuthenticatedUser; config: SupabaseConfig }
  | { ok: false; response: Response }

export type ModeratorResult =
  | { ok: true; moderator: Moderator; config: SupabaseConfig }
  | { ok: false; response: Response }

export function json(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export function methodNotAllowed(allow: string): Response {
  return json(
    { ok: false, message: 'Method not allowed.' },
    405,
  )
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    return new URL(origin).origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const rawUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!rawUrl || !publishableKey || !secretKey) return null

  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'https:') return null
    return { url, publishableKey, secretKey }
  } catch {
    return null
  }
}

export function adminHeaders(
  config: SupabaseConfig,
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    apikey: config.secretKey,
    ...(config.secretKey.startsWith('sb_secret_')
      ? {}
      : { Authorization: `Bearer ${config.secretKey}` }),
    ...extra,
  }
}

export async function authenticateUser(request: Request): Promise<AuthResult> {
  const config = getSupabaseConfig()
  if (!config) {
    return {
      ok: false,
      response: json({ ok: false, message: 'Moderation service is not configured.' }, 503),
    }
  }

  const authorization = request.headers.get('authorization') ?? ''
  if (!authorization.startsWith('Bearer ') || authorization.length < 16) {
    return {
      ok: false,
      response: json({ ok: false, message: 'Sign in to continue.' }, 401),
    }
  }

  try {
    const response = await fetch(new URL('/auth/v1/user', config.url), {
      method: 'GET',
      headers: {
        apikey: config.publishableKey,
        Authorization: authorization,
      },
      signal: AbortSignal.timeout(7000),
    })

    if (!response.ok) {
      return {
        ok: false,
        response: json({ ok: false, message: 'Your session is invalid or expired. Sign in again.' }, 401),
      }
    }

    const user: unknown = await response.json()
    if (
      typeof user !== 'object' ||
      user === null ||
      !('id' in user) ||
      typeof user.id !== 'string'
    ) {
      return {
        ok: false,
        response: json({ ok: false, message: 'Could not verify your account.' }, 401),
      }
    }

    const email =
      'email' in user && typeof user.email === 'string'
        ? user.email
        : null
    const emailConfirmedAt =
      'email_confirmed_at' in user && typeof user.email_confirmed_at === 'string'
        ? user.email_confirmed_at
        : null

    return {
      ok: true,
      user: {
        id: user.id,
        email,
        email_confirmed_at: emailConfirmedAt,
      },
      config,
    }
  } catch {
    return {
      ok: false,
      response: json({ ok: false, message: 'Authentication service is unavailable.' }, 503),
    }
  }
}

export async function authenticateModerator(
  request: Request,
): Promise<ModeratorResult> {
  const auth = await authenticateUser(request)
  if (!auth.ok) return auth

  try {
    const endpoint = new URL('/rest/v1/moderators', auth.config.url)
    endpoint.searchParams.set('select', 'role')
    endpoint.searchParams.set('user_id', `eq.${auth.user.id}`)
    endpoint.searchParams.set('active', 'eq.true')
    endpoint.searchParams.set('limit', '1')

    const response = await fetch(endpoint, {
      headers: adminHeaders(auth.config, { Accept: 'application/json' }),
      signal: AbortSignal.timeout(7000),
    })

    if (!response.ok) {
      return {
        ok: false,
        response: json({ ok: false, message: 'Could not verify moderator access.' }, 502),
      }
    }

    const rows: unknown = await response.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        ok: false,
        response: json({ ok: false, code: 'MODERATOR_ACCESS_REQUIRED', message: 'This account is not on the active moderator list.' }, 403),
      }
    }

    const role = rows[0]?.role
    if (role !== 'admin' && role !== 'reviewer') {
      return {
        ok: false,
        response: json({ ok: false, code: 'MODERATOR_ACCESS_REQUIRED', message: 'This account does not have a review role.' }, 403),
      }
    }

    return {
      ok: true,
      moderator: {
        id: auth.user.id,
        email: auth.user.email,
        role,
      },
      config: auth.config,
    }
  } catch {
    return {
      ok: false,
      response: json({ ok: false, message: 'Moderator service is unavailable.' }, 503),
    }
  }
}

export async function getModeratorCount(
  config: SupabaseConfig,
): Promise<number | null> {
  const endpoint = new URL('/rest/v1/moderators', config.url)
  endpoint.searchParams.set('select', 'user_id')
  endpoint.searchParams.set('limit', '1')

  const response = await fetch(endpoint, {
    headers: adminHeaders(config, { Accept: 'application/json' }),
    signal: AbortSignal.timeout(7000),
  })
  if (!response.ok) return null

  const rows: unknown = await response.json()
  return Array.isArray(rows) ? rows.length : null
}

export async function callAdminRest(
  config: SupabaseConfig,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const baseHeaders = adminHeaders(config)
  for (const [key, value] of Object.entries(baseHeaders)) {
    headers.set(key, value)
  }

  return fetch(new URL(path, config.url), {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(7000),
  })
}

const SESSION_STORAGE_KEY = 'furfinder.moderation.session.v1'

export type ModerationSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string | null
  }
}

type AuthPayload = {
  access_token?: unknown
  refresh_token?: unknown
  expires_in?: unknown
  expires_at?: unknown
  user?: unknown
}

function getSupabaseConfig() {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (!rawUrl || !publishableKey) {
    throw new Error('Supabase Auth is not configured for this environment.')
  }

  return {
    url: new URL(rawUrl),
    publishableKey,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toSession(payload: AuthPayload): ModerationSession {
  if (
    typeof payload.access_token !== 'string' ||
    typeof payload.refresh_token !== 'string' ||
    !isRecord(payload.user) ||
    typeof payload.user.id !== 'string'
  ) {
    throw new Error('Authentication returned an incomplete session.')
  }

  const expiresIn =
    typeof payload.expires_in === 'number' && Number.isFinite(payload.expires_in)
      ? payload.expires_in
      : 3600
  const expiresAt =
    typeof payload.expires_at === 'number' && Number.isFinite(payload.expires_at)
      ? payload.expires_at * 1000
      : Date.now() + expiresIn * 1000

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt,
    user: {
      id: payload.user.id,
      email: typeof payload.user.email === 'string' ? payload.user.email : null,
    },
  }
}

function saveSession(session: ModerationSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearModerationSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

export function readModerationSession(): ModerationSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (
      !isRecord(parsed) ||
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.refreshToken !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      !isRecord(parsed.user) ||
      typeof parsed.user.id !== 'string'
    ) {
      clearModerationSession()
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      expiresAt: parsed.expiresAt,
      user: {
        id: parsed.user.id,
        email: typeof parsed.user.email === 'string' ? parsed.user.email : null,
      },
    }
  } catch {
    clearModerationSession()
    return null
  }
}

async function readError(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (
      isRecord(payload) &&
      typeof payload.msg === 'string'
    ) return payload.msg
    if (
      isRecord(payload) &&
      typeof payload.message === 'string'
    ) return payload.message
  } catch {
    // Use the generic status below.
  }
  return `Authentication failed (${response.status}).`
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<ModerationSession> {
  const config = getSupabaseConfig()
  const response = await fetch(
    new URL('/auth/v1/token?grant_type=password', config.url),
    {
      method: 'POST',
      headers: {
        apikey: config.publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
      signal: AbortSignal.timeout(10000),
    },
  )

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  const payload: unknown = await response.json()
  if (!isRecord(payload)) throw new Error('Authentication returned an invalid response.')

  const session = toSession(payload as AuthPayload)
  saveSession(session)
  return session
}

async function refreshSession(
  session: ModerationSession,
): Promise<ModerationSession | null> {
  try {
    const config = getSupabaseConfig()
    const response = await fetch(
      new URL('/auth/v1/token?grant_type=refresh_token', config.url),
      {
        method: 'POST',
        headers: {
          apikey: config.publishableKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: session.refreshToken }),
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      clearModerationSession()
      return null
    }

    const payload: unknown = await response.json()
    if (!isRecord(payload)) {
      clearModerationSession()
      return null
    }

    const refreshed = toSession(payload as AuthPayload)
    saveSession(refreshed)
    return refreshed
  } catch {
    clearModerationSession()
    return null
  }
}

export async function moderationRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  let session = readModerationSession()
  if (!session) throw new Error('Your moderator session has ended. Sign in again.')

  if (session.expiresAt <= Date.now() + 30000) {
    const refreshed = await refreshSession(session)
    if (!refreshed) throw new Error('Your session expired. Sign in again.')
    session = refreshed
  }

  const send = (accessToken: string) => {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(path, {
      ...init,
      headers,
      credentials: 'same-origin',
      signal: init.signal ?? AbortSignal.timeout(12000),
    })
  }

  let response = await send(session.accessToken)
  if (response.status === 401) {
    const refreshed = await refreshSession(session)
    if (refreshed) response = await send(refreshed.accessToken)
  }
  return response
}

export async function signOut(): Promise<void> {
  const session = readModerationSession()
  clearModerationSession()
  if (!session) return

  try {
    const config = getSupabaseConfig()
    await fetch(new URL('/auth/v1/logout', config.url), {
      method: 'POST',
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${session.accessToken}`,
      },
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // The local tab session is already cleared.
  }
}

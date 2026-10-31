import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react'
import {
  clearModerationSession,
  moderationRequest,
  readModerationSession,
  signInWithPassword,
  signOut,
  type ModerationSession,
} from '../lib/moderation-auth'

type Listing = {
  id: string
  name: string
  slug: string
  category: string
  summary: string
  region: string
  country_code: string | null
  website_url: string
  source_url: string
  created_at: string
}

type ModeratorEntry = {
  user_id: string
  role: 'admin' | 'reviewer'
  active: boolean
  created_at: string
}

type QueuePayload = {
  ok?: boolean
  message?: string
  moderator?: {
    id: string
    email: string | null
    role: 'admin' | 'reviewer'
  }
  listings?: Listing[]
}

async function responseMessage(response: Response): Promise<string> {
  try {
    const payload: unknown = await response.json()
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) return payload.message
  } catch {
    // Use fallback below.
  }
  return `Request failed (${response.status}).`
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function ModerationConsole() {
  const [session, setSession] = useState<ModerationSession | null>(() => readModerationSession())
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [moderators, setModerators] = useState<ModeratorEntry[]>([])
  const [newModeratorId, setNewModeratorId] = useState('')
  const [moderatorLoading, setModeratorLoading] = useState(false)
  const [moderatorBusyId, setModeratorBusyId] = useState<string | null>(null)
  const [role, setRole] = useState<'admin' | 'reviewer' | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadModerators = useCallback(async () => {
    setModeratorLoading(true)
    try {
      const response = await moderationRequest('/api/v1/moderation/moderators', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      const payload: unknown = await response.json()
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('moderators' in payload) ||
        !Array.isArray(payload.moderators)
      ) {
        throw new Error('Moderator access returned an unexpected response.')
      }
      setModerators(payload.moderators as ModeratorEntry[])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load moderator access.')
    } finally {
      setModeratorLoading(false)
    }
  }, [])

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setError('')
    setAccessDenied(false)

    try {
      const response = await moderationRequest('/api/v1/moderation/listings', {
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
      if (response.status === 401) {
        clearModerationSession()
        setSession(null)
        setListings([])
        setRole(null)
        throw new Error('Your session expired. Sign in again.')
      }
      if (response.status === 403) {
        setAccessDenied(true)
        setListings([])
        setRole(null)
        return
      }
      if (!response.ok) throw new Error(await responseMessage(response))

      const payload = await response.json() as QueuePayload
      setListings(Array.isArray(payload.listings) ? payload.listings : [])
      setRole(payload.moderator?.role ?? null)
      setSession(readModerationSession())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the review queue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) void loadQueue()
  }, [session?.accessToken, loadQueue])

  useEffect(() => {
    if (role === 'admin') {
      void loadModerators()
    } else {
      setModerators([])
    }
  }, [role, loadModerators])

  async function handleAddReviewer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setModeratorBusyId('add')
    setError('')
    setMessage('')
    try {
      const response = await moderationRequest('/api/v1/moderation/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: newModeratorId.trim() }),
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      setNewModeratorId('')
      setMessage(await responseMessage(response))
      await loadModerators()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add reviewer access.')
    } finally {
      setModeratorBusyId(null)
    }
  }

  async function handleToggleReviewer(moderator: ModeratorEntry) {
    setModeratorBusyId(moderator.user_id)
    setError('')
    setMessage('')
    try {
      const response = await moderationRequest('/api/v1/moderation/moderators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: moderator.user_id,
          active: !moderator.active,
        }),
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      setMessage(await responseMessage(response))
      await loadModerators()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update reviewer access.')
    } finally {
      setModeratorBusyId(null)
    }
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const signedIn = await signInWithPassword(email, password)
      setPassword('')
      setSession(signedIn)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.')
      setLoading(false)
    }
  }

  async function handleBootstrap() {
    setBusyId('bootstrap')
    setError('')
    setMessage('')

    try {
      const response = await moderationRequest('/api/v1/moderation/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!response.ok) throw new Error(await responseMessage(response))
      setMessage(await responseMessage(response))
      setAccessDenied(false)
      await loadQueue()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'First-admin setup failed.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleReview(listing: Listing, decision: 'publish' | 'reject') {
    setBusyId(listing.id)
    setError('')
    setMessage('')

    try {
      const response = await moderationRequest('/api/v1/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          decision,
          note: notes[listing.id] ?? '',
        }),
      })
      if (!response.ok) throw new Error(await responseMessage(response))

      setListings((current) => current.filter((item) => item.id !== listing.id))
      setNotes((current) => {
        const next = { ...current }
        delete next[listing.id]
        return next
      })
      setMessage(
        decision === 'publish'
          ? `“${listing.name}” has been published.`
          : `“${listing.name}” has been rejected.`,
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save the review decision.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleSignOut() {
    await signOut()
    setSession(null)
    setRole(null)
    setListings([])
    setAccessDenied(false)
    setMessage('You are signed out.')
    setError('')
  }

  return (
    <main className="moderation-shell">
      <header className="moderation-header">
        <a className="moderation-brand" href="/" aria-label="Return to FurFinder">
          <span className="moderation-brand-mark"><ShieldCheck size={21} /></span>
          <span>fur<span>finder</span><small>MODERATION DESK</small></span>
        </a>
        {session ? (
          <div className="moderation-account">
            <span>{session.user.email ?? 'Signed-in account'}{role ? ` · ${role}` : ''}</span>
            <button type="button" className="moderation-logout" onClick={() => void handleSignOut()}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        ) : (
          <a className="moderation-back" href="/"><ArrowLeft size={15} /> Back to directory</a>
        )}
      </header>

      <section className="moderation-main">
        <div className="moderation-heading">
          <div className="eyebrow">TRUSTED REVIEW WORKSPACE</div>
          <h1>Moderation desk.</h1>
          <p>Review public listing suggestions, check their sources, and record a clear decision.</p>
        </div>

        {message ? <p className="moderation-message" role="status" aria-live="polite">{message}</p> : null}
        {error ? <p className="moderation-error" role="alert">{error}</p> : null}

        {!session ? (
          <form className="moderation-login" onSubmit={handleSignIn}>
            <div className="moderation-login-icon"><ShieldCheck size={22} /></div>
            <h2>Moderator sign in</h2>
            <p>Use the Supabase Auth account assigned to the FurFinder moderator team.</p>
            <label>
              Email address
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in securely'}
            </button>
            <p className="moderation-footnote">Only active accounts in the server-side moderator allowlist can access the review queue.</p>
          </form>
        ) : accessDenied ? (
          <div className="moderation-empty">
            <ShieldCheck size={28} />
            <h2>Moderator access required</h2>
            <p>Your Supabase Auth session is valid, but this account is not yet in the moderator allowlist.</p>
            <button
              type="button"
              className="button"
              onClick={() => void handleBootstrap()}
              disabled={busyId === 'bootstrap'}
            >
              {busyId === 'bootstrap' ? 'Checking setup…' : 'Set up first admin account'}
            </button>
            <p className="moderation-footnote">This only succeeds when the project owner has configured the matching first-admin email and no moderator exists yet.</p>
          </div>
        ) : (
          <section className="moderation-queue" aria-labelledby="queue-title">
            {role === 'admin' ? (
              <div className="moderator-management" aria-labelledby="moderator-management-title">
                <div className="moderator-management-heading">
                  <div>
                    <span className="moderation-queue-label"><ShieldCheck size={15} /> ADMIN CONTROLS</span>
                    <h2 id="moderator-management-title">Moderator access</h2>
                    <p>Grant or pause reviewer access. The admin role is protected and cannot be changed here.</p>
                  </div>
                  <button type="button" className="moderation-refresh" onClick={() => void loadModerators()} disabled={moderatorLoading}>
                    <RefreshCw size={15} className={moderatorLoading ? 'moderation-spinning' : ''} />
                    Refresh
                  </button>
                </div>
                <form className="moderator-add-form" onSubmit={handleAddReviewer}>
                  <label htmlFor="new-moderator-id">Supabase Auth user ID</label>
                  <div className="moderator-add-controls">
                    <input
                      id="new-moderator-id"
                      value={newModeratorId}
                      onChange={(event) => setNewModeratorId(event.target.value)}
                      placeholder="Paste the user's UUID"
                      autoComplete="off"
                      spellCheck={false}
                      required
                    />
                    <button className="button" type="submit" disabled={moderatorBusyId === 'add' || !newModeratorId.trim()}>
                      <UserPlus size={15} />
                      {moderatorBusyId === 'add' ? 'Adding…' : 'Add reviewer'}
                    </button>
                  </div>
                  <p>Find the UUID in Supabase Dashboard → Authentication → Users. New accounts are added as reviewers, never admins.</p>
                </form>
                {moderatorLoading ? <p className="moderation-status" role="status">Loading moderator access…</p> : null}
                <div className="moderator-access-list">
                  {moderators.map((moderator) => (
                    <div className="moderator-access-row" key={moderator.user_id}>
                      <span className="moderator-access-icon"><UserRound size={16} /></span>
                      <span className="moderator-access-identity">
                        <code>{moderator.user_id}</code>
                        <small>{moderator.role === 'admin' ? 'Administrator' : 'Reviewer'} · {moderator.active ? 'Active' : 'Inactive'}</small>
                      </span>
                      {moderator.role === 'admin' ? (
                        <span className="moderator-protected">Protected admin</span>
                      ) : (
                        <button
                          type="button"
                          className="moderator-toggle"
                          onClick={() => void handleToggleReviewer(moderator)}
                          disabled={moderatorBusyId === moderator.user_id}
                        >
                          {moderatorBusyId === moderator.user_id
                            ? 'Saving…'
                            : moderator.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  ))}
                  {!moderatorLoading && moderators.length === 0 ? (
                    <p className="moderation-status">No moderator accounts are listed.</p>
                  ) : null}
                </div>
              </div>
            ) : null}
            <div className="moderation-queue-heading">
              <div>
                <span className="moderation-queue-label"><Clock3 size={15} /> PENDING REVIEW</span>
                <h2 id="queue-title">Submission queue <span>{listings.length}</span></h2>
              </div>
              <button type="button" className="moderation-refresh" onClick={() => void loadQueue()} disabled={loading}>
                <RefreshCw size={15} className={loading ? 'moderation-spinning' : ''} />
                Refresh
              </button>
            </div>

            {loading ? <p className="moderation-status" role="status">Loading pending listings…</p> : null}
            {!loading && listings.length === 0 ? (
              <div className="moderation-empty">
                <Check size={28} />
                <h3>Queue is clear.</h3>
                <p>There are no pending listing suggestions at the moment.</p>
              </div>
            ) : null}

            <div className="moderation-list">
              {listings.map((listing) => (
                <article className="moderation-card" key={listing.id}>
                  <div className="moderation-card-top">
                    <span className="moderation-category">{listing.category}</span>
                    <span>{listing.region}{listing.country_code ? ` · ${listing.country_code}` : ''}</span>
                    <time dateTime={listing.created_at}>{formatDate(listing.created_at)}</time>
                  </div>
                  <h3>{listing.name}</h3>
                  <p className="moderation-summary">{listing.summary}</p>
                  <div className="moderation-source-links">
                    <a href={listing.website_url} target="_blank" rel="noopener noreferrer">
                      Official website <ExternalLink size={14} />
                    </a>
                    <a href={listing.source_url} target="_blank" rel="noopener noreferrer">
                      Verification source <ExternalLink size={14} />
                    </a>
                  </div>
                  <label className="moderation-note">
                    Review note (optional)
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={notes[listing.id] ?? ''}
                      onChange={(event) => setNotes((current) => ({
                        ...current,
                        [listing.id]: event.target.value,
                      }))}
                      placeholder="Record a short reason or verification note…"
                    />
                  </label>
                  <div className="moderation-actions">
                    <button
                      type="button"
                      className="moderation-reject"
                      onClick={() => void handleReview(listing, 'reject')}
                      disabled={busyId === listing.id}
                    >
                      <X size={15} /> Reject
                    </button>
                    <button
                      type="button"
                      className="moderation-publish"
                      onClick={() => void handleReview(listing, 'publish')}
                      disabled={busyId === listing.id}
                    >
                      <Check size={15} /> Publish listing
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>

      <footer className="moderation-footer">
        <a href="/"><ArrowLeft size={14} /> Return to public directory</a>
        <span>FurFinder · Moderator actions are recorded.</span>
      </footer>
    </main>
  )
}

import { useCallback, useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react'
import { TurnstileWidget } from './TurnstileWidget'

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

const categories = [
  ['community', 'Community'],
  ['convention', 'Convention / event'],
  ['artist', 'Artist / creator'],
  ['organization', 'Organization'],
  ['industry', 'Studio / industry'],
  ['resource', 'Public resource'],
] as const

const regions = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'Latin America',
  'Middle East & Africa',
] as const

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function ListingSubmissionForm() {
  const [token, setToken] = useState('')
  const [challengeVersion, setChallengeVersion] = useState(0)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [message, setMessage] = useState('')

  const handleToken = useCallback((value: string) => {
    setToken(value)
    setMessage('')
  }, [])

  const handleChallengeError = useCallback(() => {
    setToken('')
    setMessage('Verification could not load. Refresh the challenge and try again.')
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || status === 'submitting') return

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? ''),
      category: String(data.get('category') ?? ''),
      summary: String(data.get('summary') ?? ''),
      region: String(data.get('region') ?? ''),
      country_code: String(data.get('country_code') ?? ''),
      website_url: String(data.get('website_url') ?? ''),
      source_url: String(data.get('source_url') ?? ''),
      company_website: String(data.get('company_website') ?? ''),
      turnstileToken: token,
    }

    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/v1/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result: unknown = await response.json()
      const responseMessage =
        typeof result === 'object' &&
        result !== null &&
        'message' in result &&
        typeof result.message === 'string'
          ? result.message
          : 'We could not process this submission.'

      if (!response.ok) throw new Error(responseMessage)

      setStatus('success')
      setMessage(responseMessage)
      form.reset()
      setToken('')
      setChallengeVersion((value) => value + 1)
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'A network error occurred.')
      setToken('')
      setChallengeVersion((value) => value + 1)
    }
  }

  if (status === 'success') {
    return (
      <div className="submission-success" role="status" aria-live="polite">
        <CheckCircle2 size={26} />
        <div>
          <h3>Submission received</h3>
          <p>{message}</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setStatus('idle')
              setMessage('')
            }}
          >
            Suggest another listing
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <div className="submission-form-heading">
        <div className="eyebrow">PUBLIC LISTING SUGGESTION</div>
        <h3>Send a place for review.</h3>
        <p>Only public, official information. Your suggestion stays pending until a moderator reviews it.</p>
      </div>

      <div className="submission-fields">
        <label>
          Listing name
          <input name="name" required minLength={2} maxLength={120} autoComplete="organization" />
        </label>
        <label>
          Category
          <select name="category" required defaultValue="community">
            {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label className="submission-wide">
          Short description
          <textarea name="summary" required minLength={20} maxLength={500} rows={4} />
        </label>
        <label>
          Region
          <select name="region" required defaultValue="Asia-Pacific">
            {regions.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Country code (optional)
          <input name="country_code" maxLength={2} pattern="[A-Za-z]{2}" placeholder="e.g. JP" autoCapitalize="characters" />
        </label>
        <label className="submission-wide">
          Official website (HTTPS)
          <input name="website_url" type="url" inputMode="url" placeholder="https://example.org" required />
        </label>
        <label className="submission-wide">
          Public source for moderator verification (HTTPS)
          <input name="source_url" type="url" inputMode="url" placeholder="https://example.org/about" required />
        </label>
      </div>

      <div className="submission-verification">
        <div>
          <ShieldCheck size={18} />
          <span>Protected submission</span>
        </div>
        {siteKey ? (
          <TurnstileWidget
            key={challengeVersion}
            siteKey={siteKey}
            onToken={handleToken}
            onError={handleChallengeError}
          />
        ) : (
          <p className="submission-config-warning">
            Submission verification is not configured yet. The form will remain disabled until the site key is added.
          </p>
        )}
      </div>

      <label className="submission-honeypot" aria-hidden="true">
        Leave this field empty
        <input name="company_website" tabIndex={-1} autoComplete="off" />
      </label>

      {message ? <p className="submission-message" role="alert">{message}</p> : null}
      <div className="submission-actions">
        <p>We never ask for private addresses or personal phone numbers.</p>
        <button className="button" type="submit" disabled={!siteKey || !token || status === 'submitting'}>
          {status === 'submitting' ? <LoaderCircle className="spinner" size={16} /> : null}
          {status === 'submitting' ? 'Submitting…' : 'Send for review'}
          {status !== 'submitting' ? <ArrowRight size={16} /> : null}
        </button>
      </div>
    </form>
  )
}

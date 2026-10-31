import { useEffect, useMemo, useRef, useState } from 'react'
import { Settings2, ShieldCheck, Sparkles, X } from 'lucide-react'

type Consent = {
  essential: true
  preferences: boolean
  analytics: boolean
  marketing: boolean
  savedAt: string
}

type MotionMode = 'auto' | 'full' | 'reduced' | 'off'
type AccentMode = 'blue' | 'mint' | 'violet'

const CONSENT_KEY = 'furfinder.consent.v1'
const TERMS_KEY = 'furfinder.terms.v1'
const MOTION_KEY = 'furfinder.motion.v1'
const ACCENT_KEY = 'furfinder.accent.v1'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The app remains usable when storage is unavailable.
  }
}

function detectLowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return reduced || nav.connection?.saveData === true || (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4)
}

export function PrivacyControls() {
  const [consent, setConsent] = useState<Consent | null>(() => readStorage<Consent | null>(CONSENT_KEY, null))
  const [cookieOpen, setCookieOpen] = useState(() => readStorage<boolean>(TERMS_KEY, false) && !readStorage<Consent | null>(CONSENT_KEY, null))
  const [termsOpen, setTermsOpen] = useState(() => !readStorage<boolean>(TERMS_KEY, false))
  const [motion, setMotion] = useState<MotionMode>(() => readStorage<MotionMode>(MOTION_KEY, 'auto'))
  const [accent, setAccent] = useState<AccentMode>(() => readStorage<AccentMode>(ACCENT_KEY, 'blue'))
  const termsDialogRef = useRef<HTMLElement>(null)
  const cookieDialogRef = useRef<HTMLElement>(null)
  const [preferences, setPreferences] = useState(() => {
    const saved = readStorage<Consent | null>(CONSENT_KEY, null)
    return { preferences: saved?.preferences ?? false, analytics: saved?.analytics ?? false, marketing: saved?.marketing ?? false }
  })

  useEffect(() => {
    const root = document.documentElement
    const lowPower = detectLowPowerDevice()
    const reducedBySystem = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const effectiveMotion = motion === 'auto' ? (reducedBySystem || lowPower ? 'reduced' : 'full') : motion
    root.dataset.motion = effectiveMotion
    root.dataset.lod = lowPower ? 'low' : motion === 'full' ? 'high' : motion === 'reduced' || motion === 'off' ? 'low' : 'auto'
    root.dataset.accent = accent
    if (consent?.preferences) {
      writeStorage(MOTION_KEY, motion)
      writeStorage(ACCENT_KEY, accent)
    } else {
      try { window.localStorage.removeItem(MOTION_KEY); window.localStorage.removeItem(ACCENT_KEY) } catch { /* storage may be unavailable */ }
    }
  }, [motion, accent, consent?.preferences])

  useEffect(() => {
    const activeDialog = termsOpen ? termsDialogRef.current : cookieOpen ? cookieDialogRef.current : null
    if (!activeDialog) return
    const dialogElement = activeDialog!

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const getFocusable = () => Array.from(dialogElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getAttribute('aria-hidden') !== 'true')

    getFocusable()[0]?.focus()

    function handleDialogKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (termsOpen) setTermsOpen(false)
        else setCookieOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (!focusable.length) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!dialogElement.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleDialogKeydown)
    return () => {
      document.removeEventListener('keydown', handleDialogKeydown)
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [termsOpen, cookieOpen])

  const consentSummary = useMemo(() => consent ? 'Your choices are saved on this device.' : 'Choose which optional storage categories FurFinder may use.', [consent])

  function saveConsent(next: Omit<Consent, 'essential' | 'savedAt'>) {
    const value: Consent = { essential: true, ...next, savedAt: new Date().toISOString() }
    setConsent(value)
    writeStorage(CONSENT_KEY, value)
    setCookieOpen(false)
  }

  function acceptTerms() {
    writeStorage(TERMS_KEY, true)
    setTermsOpen(false)
    if (!consent) setCookieOpen(true)
  }

  return (
    <>
      <div className="privacy-toolbar" role="group" aria-label="Display and privacy settings">
        <button type="button" onClick={() => setMotion((value) => value === 'auto' ? 'full' : value === 'full' ? 'reduced' : value === 'reduced' ? 'off' : 'auto')} aria-label={`Animation mode: ${motion}. Change animation mode`}>
          <Sparkles size={15} /> Motion: {motion}
        </button>
        <label>Color
          <select value={accent} onChange={(event) => setAccent(event.target.value as AccentMode)} aria-label="Accent color">
            <option value="blue">Astro blue</option>
            <option value="mint">Mint</option>
            <option value="violet">Violet</option>
          </select>
        </label>
        <button type="button" onClick={() => setCookieOpen(true)}><Settings2 size={15} /> Privacy settings</button>
      </div>

      {termsOpen && (
        <div className="consent-backdrop" role="presentation">
          <section ref={termsDialogRef} className="consent-dialog terms-dialog" role="dialog" aria-modal="true" aria-labelledby="terms-title">
            <div className="consent-kicker"><ShieldCheck size={16} /> BEFORE YOU EXPLORE</div>
            <h2 id="terms-title">Welcome to FurFinder.</h2>
            <p>FurFinder is a public directory for discovering publicly listed furry communities, conventions, creators, organizations and resources. Listings are reviewed before publication, but FurFinder does not endorse or control external sites and events.</p>
            <ul>
              <li>Use the directory respectfully and follow each organizer's rules and age requirements.</li>
              <li>Do not submit private addresses, personal contact details, or information about someone without permission.</li>
              <li>Respect copyright, trademarks, community guidelines and applicable laws.</li>
              <li>External links lead to third-party services with their own terms and privacy practices.</li>
              <li>Listings may be incomplete, outdated or removed after review.</li>
            </ul>
            <p className="consent-note">Read the <a href="/legal/terms.html" target="_blank" rel="noreferrer">full Terms & Conditions</a> and <a href="/legal/privacy.html" target="_blank" rel="noreferrer">Privacy Notice</a>.</p>
            <div className="consent-actions">
              <button type="button" className="button" onClick={acceptTerms}>I agree and continue</button>
              <button type="button" className="consent-secondary" onClick={() => setTermsOpen(false)}>Not now</button>
            </div>
          </section>
        </div>
      )}

      {cookieOpen && (
        <div className="consent-backdrop consent-backdrop-bottom" role="presentation">
          <section ref={cookieDialogRef} className="consent-dialog cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="cookie-title">
            <button className="consent-close" type="button" aria-label="Close privacy settings" onClick={() => setCookieOpen(false)}><X size={18} /></button>
            <div className="consent-kicker"><ShieldCheck size={16} /> PRIVACY & STORAGE</div>
            <h2 id="cookie-title">Your privacy choices.</h2>
            <p>FurFinder currently uses essential browser storage to remember your consent, terms acknowledgement and display preferences. Optional analytics and marketing trackers are not active. You can keep them off.</p>
            <p className="consent-note">{consentSummary}</p>
            <div className="consent-options">
              <div className="consent-option"><div><b>Essential</b><small>Required for saved consent and basic site preferences. Always on.</small></div><input type="checkbox" checked disabled aria-label="Essential storage always enabled" /></div>
              <label className="consent-option"><div><b>Preferences</b><small>Remember optional display choices on this device.</small></div><input type="checkbox" checked={preferences.preferences} onChange={(e) => setPreferences((p) => ({ ...p, preferences: e.target.checked }))} /></label>
              <label className="consent-option"><div><b>Analytics</b><small>Anonymous usage measurement. Not currently installed.</small></div><input type="checkbox" checked={preferences.analytics} onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))} /></label>
              <label className="consent-option"><div><b>Marketing</b><small>Advertising or cross-site tracking. Not currently installed.</small></div><input type="checkbox" checked={preferences.marketing} onChange={(e) => setPreferences((p) => ({ ...p, marketing: e.target.checked }))} /></label>
            </div>
            <div className="consent-actions consent-actions-wrap">
              <button type="button" className="button" onClick={() => saveConsent(preferences)}>Save choices</button>
              <button type="button" className="consent-secondary" onClick={() => saveConsent({ preferences: false, analytics: false, marketing: false })}>Reject optional</button>
              <button type="button" className="consent-secondary" onClick={() => saveConsent({ preferences: true, analytics: true, marketing: true })}>Accept all optional</button>
            </div>
            <p className="consent-footnote">Essential storage cannot be disabled because it keeps this choice available. Changing optional settings does not enable trackers that are not installed. <a href="/legal/privacy.html" target="_blank" rel="noreferrer">Privacy details</a>.</p>
          </section>
        </div>
      )}

      {!cookieOpen && !termsOpen && (
        <button type="button" className="privacy-reopen" onClick={() => setCookieOpen(true)} aria-label="Open privacy settings"><Settings2 size={16} /> Privacy</button>
      )}
    </>
  )
}

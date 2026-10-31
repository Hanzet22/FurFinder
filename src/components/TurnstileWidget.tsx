import { useEffect, useRef } from 'react'

type TurnstileOptions = {
  sitekey: string
  action: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type Props = {
  siteKey: string
  onToken: (token: string) => void
  onError: () => void
}

export function TurnstileWidget({ siteKey, onToken, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !siteKey) return

    let active = true
    let widgetId: string | undefined
    let script: HTMLScriptElement | null = null

    const render = () => {
      if (!active || !container || !window.turnstile || widgetId) return
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        action: 'listing_submission',
        callback: onToken,
        'expired-callback': () => onToken(''),
        'error-callback': onError,
      })
    }

    if (window.turnstile) {
      render()
    } else {
      script = document.querySelector<HTMLScriptElement>('script[data-furfinder-turnstile]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.dataset.furfinderTurnstile = 'true'
        document.head.append(script)
      }
      script.addEventListener('load', render)
      script.addEventListener('error', onError)
    }

    return () => {
      active = false
      script?.removeEventListener('load', render)
      script?.removeEventListener('error', onError)
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [onError, onToken, siteKey])

  return <div ref={containerRef} className="turnstile-widget" role="group" aria-label="Human verification" />
}

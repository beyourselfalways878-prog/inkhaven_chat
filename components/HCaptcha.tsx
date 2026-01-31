/* eslint-disable no-unused-vars */
'use client'

import { useEffect, useRef, useState } from 'react'

type HCaptchaProps = {
  siteKey: string
  onToken: (token: string) => void
  onError?: (message: string) => void
}

declare global {
  interface Window {
    hcaptcha?: {
      render: (container: HTMLElement | string, options: Record<string, any>) => string
      execute?: (widgetId: string) => void
      remove?: (widgetId: string) => void
      reset?: (widgetId: string) => void
    }
  }
}

const HCAPTCHA_SRC = 'https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit'

export default function HCaptcha({ siteKey, onToken, onError }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const ensureScript = async () => {
      if (typeof window === 'undefined') return

      const existing = document.querySelector(`script[data-hcaptcha="true"]`) as HTMLScriptElement | null
      if (!existing) {
        const script = document.createElement('script')
        script.src = HCAPTCHA_SRC
        script.async = true
        script.defer = true
        script.dataset.hcaptcha = 'true'
        script.onload = () => {
          if (!cancelled) setReady(true)
        }
        script.onerror = () => {
          onError?.('Failed to load hCaptcha script.')
        }
        document.head.appendChild(script)
      } else {
        // If script already present, assume it might already be ready.
        setReady(true)
      }
    }

    void ensureScript()
    return () => {
      cancelled = true
    }
  }, [onError])

  useEffect(() => {
    if (!ready) return
    if (!containerRef.current) return

    const el = containerRef.current

    const tryRender = () => {
      if (!window.hcaptcha?.render) return false
      if (widgetIdRef.current) return true

      try {
        widgetIdRef.current = window.hcaptcha!.render(el, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (typeof token === 'string' && token.length > 0) onToken(token)
          },
          'error-callback': () => {
            onError?.('hCaptcha failed. Please retry.')
          },
          'expired-callback': () => {
            onError?.('hCaptcha expired. Please retry.')
          }
        })
      } catch (err) {
        onError?.('Failed to render hCaptcha.')
        return false
      }

      return true
    }

    const ok = tryRender()
    if (ok) return

    const interval = window.setInterval(() => {
      const done = tryRender()
      if (done) window.clearInterval(interval)
    }, 200)

    return () => {
      window.clearInterval(interval)
      if (widgetIdRef.current && window.hcaptcha?.remove) {
        try {
          window.hcaptcha.remove(widgetIdRef.current)
        } catch {
          // ignore
        }
      }
      widgetIdRef.current = null
    }
  }, [ready, siteKey, onToken, onError])

  return <div ref={containerRef} />
}

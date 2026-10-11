// Counts what visitors do, with PostHog. It records the names of actions only: never text that
// someone typed, and never who they are. The site works the same when this does not load.

import type { PostHog } from 'posthog-js'

/** The project key from PostHog. It is public by design; with no key nothing is loaded or sent. */
const KEY = import.meta.env.VITE_POSTHOG_KEY ?? ''
const HOST = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'

type Properties = Record<string, string | number | boolean>

let client: PostHog | null = null
let started = false
/** events from before the library is ready */
const waiting: [string, Properties | undefined][] = []

function allowed(): boolean {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  return KEY !== '' && !local && navigator.doNotTrack !== '1'
}

/** Which of my links was used. The address itself is not sent. */
function linkKind(href: string): string | null {
  if (href.startsWith('mailto:')) return 'email'
  if (!/^https?:/.test(href)) return null
  const host = new URL(href).hostname.replace(/^www\./, '')
  return host === window.location.hostname ? null : host
}

/** Call one time on each page. The library is fetched after the page is shown. */
export function startAnalytics(): void {
  if (started || !allowed()) return
  started = true

  document.addEventListener('click', (e) => {
    const link = e.target instanceof Element ? e.target.closest('a[href]') : null
    const kind = link && linkKind(link.getAttribute('href') ?? '')
    if (kind) track('link_click', { to: kind })
  })

  const load = () =>
    import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(KEY, {
          api_host: HOST,
          // no cookie and nothing kept in the browser: a visitor is counted for one visit only
          persistence: 'memory',
          person_profiles: 'identified_only',
          // only the events named in the code: no automatic capture of clicks or of typed text, and no recordings
          autocapture: false,
          disable_session_recording: true,
          capture_pageview: true,
          respect_dnt: true,
        })
        client = posthog
        for (const [name, properties] of waiting.splice(0)) posthog.capture(name, properties)
      })
      .catch(() => {
        // blocked or offline: the site does not need it
      })

  if (document.readyState === 'complete') void load()
  else window.addEventListener('load', () => void load(), { once: true })
}

/** Record one action by its name, with a few plain facts about it. */
export function track(name: string, properties?: Properties): void {
  if (!started) return
  if (client) client.capture(name, properties)
  else if (waiting.length < 50) waiting.push([name, properties])
}

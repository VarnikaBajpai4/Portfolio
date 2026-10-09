import { useEffect } from 'react'
import photo from '../assets/chindi.jpg'

const SHOW_MS = 6500

/** A short introduction to the cat, shown when she is double-clicked. It leaves by itself. */
export function ChindiCard({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, SHOW_MS)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <aside className="chindi px-border" role="status" onClick={onClose}>
      <div className="chindi-bar">
        <span className="win-stripes" />
        <strong>Chindi</strong>
        <span className="win-stripes" />
      </div>
      <div className="chindi-body">
        <img className="px-border" src={photo} alt="Chindi, a white and ginger cat in a pink bow tie" width={132} height={132} />
        <div>
          <h3>Meet Chindi.</h3>
          <p>The cat you keep seeing all over this site is real. She is mine.</p>
          <p>If it was not clear by now: I prefer her company to most humans.</p>
        </div>
      </div>
      <span className="chindi-timer" style={{ animationDuration: `${SHOW_MS}ms` }} aria-hidden="true" />
    </aside>
  )
}

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { content } from '../content'
import { useAddSticky } from '../shell/stickies'

const CORNER = 30
const SETTLE_MS = 460

export function NotePad() {
  const pages = content.notes
  const addSticky = useAddSticky()
  const [page, setPage] = useState(0)
  const [peel, setPeel] = useState(CORNER)
  const [settling, setSettling] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const next = (page + 1) % pages.length

  const fullPeel = () => {
    const el = rootRef.current
    return el ? Math.min(el.clientWidth, el.clientHeight) : CORNER
  }

  const turnPage = () => {
    setPage(next)
    setPeel(CORNER)
  }

  const settle = (to: number, then?: () => void) => {
    setSettling(true)
    setPeel(to)
    window.setTimeout(() => {
      setSettling(false)
      then?.()
    }, SETTLE_MS)
  }

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
  }

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    // the corner sits bottom-left, so pulling right or up peels the page
    const pull = Math.max(e.clientX - d.x, d.y - e.clientY)
    if (Math.abs(pull) > 4) d.moved = true
    setPeel(Math.min(Math.max(CORNER + pull, CORNER), fullPeel()))
  }

  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (!d.moved) return settle(fullPeel(), turnPage)

    const box = rootRef.current?.getBoundingClientRect()
    const outside =
      box && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)
    if (outside && addSticky) {
      // pulled right off the pad: it becomes a sticky note on the desktop
      addSticky(pages[page], e.clientX, e.clientY)
      turnPage()
    } else if (peel > fullPeel() / 2) {
      settle(fullPeel(), turnPage)
    } else {
      settle(CORNER)
    }
  }

  const sheetCut = `polygon(0 0, 100% 0, 100% 100%, ${peel}px 100%, 0 calc(100% - ${peel}px))`

  return (
    <div className={`notepad${settling ? ' is-settling' : ''}`} ref={rootRef}>
      <p className="notepad-text notepad-under" aria-hidden="true">
        {pages[next]}
      </p>
      <div className="notepad-sheet" style={{ clipPath: sheetCut }}>
        <p className="notepad-text" aria-live="polite">
          {pages[page]}
        </p>
        <span className="notepad-page">{page + 1}</span>
      </div>
      <button
        type="button"
        className="notepad-corner"
        style={{ width: peel, height: peel }}
        aria-label="Next page"
        title="Click to turn. Drag to peel. Pull it off the pad to keep it."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          drag.current = null
          settle(CORNER)
        }}
        onClick={(e) => {
          // keyboard activation; pointer clicks are handled above
          if (e.detail === 0) settle(fullPeel(), turnPage)
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="notepad-fold" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0.5" stopColor="#d9d9d9" />
              <stop offset="0.62" stopColor="#ffffff" />
              <stop offset="1" stopColor="#f4f4f4" />
            </linearGradient>
          </defs>
          <polygon className="notepad-flap" points="0,0 100,0 100,100" fill="url(#notepad-fold)" />
        </svg>
      </button>
    </div>
  )
}

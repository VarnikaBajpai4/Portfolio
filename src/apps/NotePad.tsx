import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { content } from '../content'
import type { Note } from '../content'
import { prefersReducedMotion } from '../motion'
import { useAddSticky } from '../shell/stickies'
import { foldCorner, fullyTurned } from './fold'
import type { Pt } from './fold'

/** how far the resting dog-ear is folded in */
const REST = 26
const TURN_MS = 620
const RETURN_MS = 380

/** The pad opens on a list of its pages, and ends on a page for the visitor to write on. */
const INDEX = 0
const FIRST_NOTE = 1

function NotePage({ note }: { note: Note }) {
  return (
    <>
      <h3 className="note-title">
        {note.title}
        {note.tag && <span className="note-tag">{note.tag}</span>}
      </h3>
      <ul className="note-lines">
        {note.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {note.tools && (
        <ul className="note-tools">
          {note.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      )}
    </>
  )
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const points = (poly: Pt[]) => poly.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

export function NotePad() {
  const notes = content.notes
  /** the index, each note, then the visitor's own page */
  const count = notes.length + 2
  const [draft, setDraft] = useState('')
  const addSticky = useAddSticky()
  const gradientId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 300, h: 150 })
  const [page, setPage] = useState(0)
  /** where the corner is right now; null means resting as a dog-ear */
  const [corner, setCorner] = useState<Pt | null>(null)
  const drag = useRef<{ moved: boolean } | null>(null)
  const frame = useRef(0)
  const next = (page + 1) % count

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const rest = { x: REST, y: size.h - REST }
  const at = corner ?? rest
  const fold = foldCorner(size.w, size.h, at)

  const turning = useRef(false)

  const turnPage = () => {
    turning.current = false
    setPage((p) => (p + 1) % count)
    setCorner(null)
  }

  const glide = (from: Pt, to: Pt, ms: number, then: () => void) => {
    cancelAnimationFrame(frame.current)
    if (prefersReducedMotion()) return then()
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / ms, 1)
      const k = ease(t)
      setCorner({ x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k })
      if (t < 1) frame.current = requestAnimationFrame(step)
      else then()
    }
    frame.current = requestAnimationFrame(step)
  }

  const finishTurn = (from: Pt) => {
    turning.current = true
    glide(from, fullyTurned(size.w, size.h), TURN_MS, turnPage)
  }

  const local = (e: PointerEvent): Pt => {
    const box = rootRef.current!.getBoundingClientRect()
    return { x: e.clientX - box.left, y: e.clientY - box.top }
  }

  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    cancelAnimationFrame(frame.current)
    // a page that is still turning lands at once, so quick clicks never lose a turn
    if (turning.current) turnPage()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { moved: false }
  }

  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return
    const p = local(e)
    if (Math.hypot(p.x - rest.x, p.y - rest.y) > 5) drag.current.moved = true
    if (drag.current.moved) setCorner(p)
  }

  const onUp = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (!d.moved) return finishTurn(rest)

    const p = local(e)
    const outside = p.x < 0 || p.y < 0 || p.x > size.w || p.y > size.h
    if (outside && addSticky) {
      // pulled right off the pad: the page becomes a sticky note on the desktop
      addSticky(textOf(page), e.clientX, e.clientY)
      if (page === count - 1) setDraft('')
      turnPage()
    } else if (Math.hypot(p.x, p.y - size.h) > 0.55 * Math.hypot(size.w, size.h)) {
      finishTurn(p)
    } else {
      glide(p, rest, RETURN_MS, () => setCorner(null))
    }
  }

  /** What a page says, as plain text, for the sticky note it becomes when torn off. */
  const textOf = (index: number): string => {
    if (index === INDEX) return ['What I built, exactly', ...notes.map((n) => `· ${n.title}`)].join('\n')
    if (index === count - 1) return draft.trim() || "A note from Varnika's pad."
    const note = notes[index - FIRST_NOTE]
    return [note.title, ...note.lines.map((l) => `· ${l}`)].join('\n')
  }

  const body = (index: number, live: boolean) => {
    if (index === INDEX) {
      return (
        <>
          <h3 className="note-title">What I built, exactly</h3>
          <ol className="note-index">
            {notes.map((note, i) => (
              <li key={note.title}>
                <button type="button" tabIndex={live ? 0 : -1} onClick={() => setPage(i + FIRST_NOTE)}>
                  {note.title}
                </button>
              </li>
            ))}
            <li>
              <button type="button" tabIndex={live ? 0 : -1} onClick={() => setPage(count - 1)}>
                A page for you
              </button>
            </li>
          </ol>
        </>
      )
    }
    if (index === count - 1) {
      return (
        <>
          <h3 className="note-title">Your page</h3>
          <textarea
            className="note-write"
            aria-label="Write a note"
            placeholder="Write here. Then pull the corner off the pad to take it with you."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            tabIndex={live ? 0 : -1}
            readOnly={!live}
          />
        </>
      )
    }
    return <NotePage note={notes[index - FIRST_NOTE]} />
  }

  return (
    <div className="notepad" ref={rootRef}>
      <div className="notepad-page-body notepad-under" aria-hidden="true">
        {body(next, false)}
      </div>
      <div
        className="notepad-sheet"
        style={{ clipPath: `polygon(${fold.sheet.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(', ')})` }}
      >
        <div className="notepad-page-body" aria-live="polite">
          {body(page, true)}
        </div>
        <span className="notepad-page">
          {page + 1} / {count}
        </span>
      </div>
      <svg className="notepad-fold" width={size.w} height={size.h} aria-hidden="true">
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={fold.crease.x}
            y1={fold.crease.y}
            x2={fold.tip.x}
            y2={fold.tip.y}
          >
            <stop offset="0" stopColor="#c9c9c9" />
            <stop offset="0.18" stopColor="#f2f2f2" />
            <stop offset="0.5" stopColor="#ffffff" />
            <stop offset="1" stopColor="#ededed" />
          </linearGradient>
        </defs>
        {fold.flap.length > 2 && <polygon className="notepad-flap" points={points(fold.flap)} fill={`url(#${gradientId})`} />}
      </svg>
      <button
        type="button"
        className="notepad-corner"
        aria-label="Next page"
        title="Click to turn. Drag to peel. Pull it off the pad to keep it."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          drag.current = null
          setCorner(null)
        }}
        onClick={(e) => {
          // keyboard activation; pointer clicks are handled above
          if (e.detail === 0) finishTurn(rest)
        }}
      />
    </div>
  )
}

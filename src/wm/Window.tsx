import { useEffect, useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { Bounds, Win } from './reducer'
import { useWM } from './store'
import './Window.css'

interface Props {
  win: Win
  title: string
  /** CSS colour of the window body */
  fill?: string
  bounds: Bounds
  children: ReactNode
}

interface Gesture {
  mode: 'move' | 'resize'
  startX: number
  startY: number
  x: number
  y: number
  w: number
  h: number
}

export function Window({ win, title, fill = 'var(--paper)', bounds, children }: Props) {
  const { dispatch, topId } = useWM()
  const gesture = useRef<Gesture | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const { id, rect } = win

  // A window opened by the visitor takes focus, so keyboard users land inside it.
  // Windows that are open at page load leave focus alone.
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) rootRef.current?.focus()
  }, [])

  const begin = (mode: Gesture['mode']) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    gesture.current = { mode, startX: e.clientX, startY: e.clientY, ...rect }
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (g.mode === 'move') dispatch({ type: 'move', id, x: g.x + dx, y: g.y + dy, bounds })
    else dispatch({ type: 'resize', id, w: g.w + dx, h: g.h + dy, bounds })
  }

  const end = () => {
    gesture.current = null
  }

  return (
    <section
      ref={rootRef}
      tabIndex={-1}
      role="dialog"
      aria-label={title}
      className={`win${topId === id ? ' win-top' : ''}`}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: win.z }}
      onPointerDownCapture={() => dispatch({ type: 'focus', id })}
    >
      <div
        className="win-title"
        onPointerDown={begin('move')}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <button
          type="button"
          className="win-box"
          aria-label={`Close ${title}`}
          onClick={() => dispatch({ type: 'close', id })}
        />
        <span className="win-stripes" />
        <span className="win-name">{title}</span>
        <span className="win-stripes" />
        <button
          type="button"
          className="win-box win-zoom"
          aria-label={`Zoom ${title}`}
          onClick={() => dispatch({ type: 'zoom', id, bounds })}
        />
      </div>
      <div className="win-body" style={{ background: fill }}>
        {children}
      </div>
      <div
        className="win-grip"
        onPointerDown={begin('resize')}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
      />
    </section>
  )
}

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

export interface StickyNote {
  id: number
  text: string
  x: number
  y: number
  wide?: boolean
}

export function Sticky({ note, onRemove }: { note: StickyNote; onRemove: () => void }) {
  const [pos, setPos] = useState({ x: note.x, y: note.y })
  const grab = useRef<{ dx: number; dy: number } | null>(null)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    grab.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (grab.current) setPos({ x: e.clientX - grab.current.dx, y: e.clientY - grab.current.dy })
  }
  const onUp = () => {
    grab.current = null
  }

  return (
    <div
      className={`sticky px-border${note.wide ? ' sticky-wide' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <button type="button" className="sticky-x" aria-label="Remove note" onClick={onRemove}>
        ×
      </button>
      <p>{note.text}</p>
    </div>
  )
}

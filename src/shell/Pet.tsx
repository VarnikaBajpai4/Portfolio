import { useEffect, useRef, useState } from 'react'
import { Chindi } from '../icons/Chindi'
import type { ChindiPose } from '../icons/Chindi'
import { prefersReducedMotion } from '../motion'
import type { AppId, Bounds, Win } from '../wm/reducer'
import { PET_EVENT } from './events'
import type { PetRequest } from './events'

const BOX_W = 44
const BOX_H = 32
const TICK_MS = 120
const STEP = 4
const FALL = 16
const BUBBLE_MS = 2600
const BUBBLE_MS_PER_LETTER = 70

const LINES = [
  'Mrrp.',
  'Chindi. Senior Keyboard Sitter.',
  'I pressed deploy once. With my paw.',
  'Feed me, then we talk.',
  'Purr review: approved.',
  'She codes. I supervise.',
]

type Perch = AppId | 'ground'
type Mode = 'sit' | 'walk' | 'sleep' | 'fall' | 'hop'

interface Sim {
  x: number
  y: number
  perch: Perch
  mode: Mode
  dir: 1 | -1
  targetX: number
  wait: number
  frame: boolean
  perchKey: string
}

interface Span {
  y: number
  x0: number
  x1: number
}

function spanOf(perch: Perch, windows: Win[], bounds: Bounds, areaH: number): Span | null {
  if (perch === 'ground') {
    // the strip left of the dock
    return { y: areaH - BOX_H - 4, x0: 12, x1: Math.max(12, bounds.w / 2 - 260) }
  }
  const win = windows.find((w) => w.id === perch)
  if (!win || win.rect.y < BOX_H) return null
  return { y: win.rect.y - BOX_H + 2, x0: win.rect.x + 4, x1: win.rect.x + win.rect.w - BOX_W - 4 }
}

function keyOf(perch: Perch, windows: Win[]): string {
  const win = windows.find((w) => w.id === perch)
  return win ? `${win.rect.x},${win.rect.y},${win.rect.w}` : ''
}

function between(lo: number, hi: number) {
  return lo + Math.random() * Math.max(0, hi - lo)
}

interface Props {
  windows: Win[]
  bounds: Bounds
  /** full height of the desktop area, dock zone included */
  areaH: number
}

function startSim(windows: Win[], bounds: Bounds, areaH: number): Sim {
  const ground = spanOf('ground', windows, bounds, areaH)!
  return {
    x: ground.x0 + 20,
    y: ground.y,
    perch: 'ground',
    mode: 'sit',
    dir: 1,
    targetX: 0,
    wait: 25,
    frame: false,
    perchKey: '',
  }
}

export function Pet({ windows, bounds, areaH }: Props) {
  const world = useRef({ windows, bounds, areaH })
  // the simulation mutates `sim`; `view` is the copy React draws
  const sim = useRef<Sim | null>(null)
  const [view, setView] = useState(() => startSim(windows, bounds, areaH))
  const [bubble, setBubble] = useState<string | null>(null)
  const bubbleTimer = useRef(0)

  useEffect(() => {
    world.current = { windows, bounds, areaH }
  })

  const say = (text: string) => {
    window.clearTimeout(bubbleTimer.current)
    setBubble(text)
    bubbleTimer.current = window.setTimeout(() => setBubble(null), BUBBLE_MS + text.length * BUBBLE_MS_PER_LETTER)
  }

  useEffect(() => {
    const state = () => {
      const { windows, bounds, areaH } = world.current
      return (sim.current ??= startSim(windows, bounds, areaH))
    }
    const draw = () => setView({ ...state() })

    const hopTo = (perch: Perch) => {
      const s = state()
      const { windows, bounds, areaH } = world.current
      const span = spanOf(perch, windows, bounds, areaH)
      if (!span) return false
      const x = between(span.x0, span.x1)
      Object.assign(s, {
        perch,
        mode: 'hop',
        dir: x >= s.x ? 1 : -1,
        x,
        y: span.y,
        wait: 5,
        perchKey: keyOf(perch, windows),
      })
      return true
    }

    const onRequest = (e: Event) => {
      const detail = (e as CustomEvent<PetRequest>).detail
      if (detail.goto) hopTo(detail.goto)
      if (detail.say) say(detail.say)
      draw()
    }
    window.addEventListener(PET_EVENT, onRequest)

    if (prefersReducedMotion()) return () => window.removeEventListener(PET_EVENT, onRequest)

    const tick = () => {
      const s = state()
      const { windows, bounds, areaH } = world.current
      const ground = spanOf('ground', windows, bounds, areaH)!

      if (s.mode === 'fall') {
        s.y = Math.min(s.y + FALL, ground.y)
        if (s.y >= ground.y) {
          Object.assign(s, { perch: 'ground', mode: 'sit', wait: 12, perchKey: '' })
          s.x = Math.min(Math.max(s.x, 4), bounds.w - BOX_W - 4)
        }
      } else if (s.perch !== 'ground' && keyOf(s.perch, windows) !== s.perchKey) {
        // the window under her moved, resized or closed
        s.mode = 'fall'
      } else if (s.mode === 'walk') {
        s.x += s.dir * STEP
        s.frame = !s.frame
        if ((s.dir === 1 && s.x >= s.targetX) || (s.dir === -1 && s.x <= s.targetX)) {
          Object.assign(s, { mode: 'sit', wait: between(18, 45) })
        }
      } else if (--s.wait <= 0) {
        const span = spanOf(s.perch, windows, bounds, areaH) ?? ground
        const roll = Math.random()
        if (s.mode === 'hop' || roll < 0.2) {
          Object.assign(s, { mode: 'sit', wait: between(15, 40) })
        } else if (roll < 0.55) {
          const targetX = between(span.x0, span.x1)
          Object.assign(s, { mode: 'walk', targetX, dir: targetX >= s.x ? 1 : -1 })
        } else if (roll < 0.85) {
          const options: Perch[] = ['ground', ...windows.map((w) => w.id)]
          const choice = options.filter((p) => p !== s.perch)[Math.floor(Math.random() * (options.length - 1))]
          if (!choice || !hopTo(choice)) s.wait = 10
        } else {
          Object.assign(s, { mode: 'sleep', wait: between(50, 90) })
        }
      }
      draw()
    }

    const timer = window.setInterval(tick, TICK_MS)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener(PET_EVENT, onRequest)
    }
  }, [])

  const s = view
  const pose: ChindiPose =
    s.mode === 'sleep' ? 'sleep' : s.mode === 'walk' || s.mode === 'hop' ? (s.frame ? 'walkA' : 'walkB') : 'sit'

  return (
    <div
      className={`pet pet-${s.mode}`}
      style={{ transform: `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px)` }}
    >
      {bubble && (
        <span className="pet-bubble px-border" role="status">
          {bubble}
        </span>
      )}
      <button
        type="button"
        className="pet-cat"
        aria-label="Chindi the cat"
        onClick={() => say(LINES[Math.floor(Math.random() * LINES.length)])}
      >
        <span className={s.dir === -1 && pose !== 'sit' ? 'pet-flip' : undefined}>
          <Chindi pose={pose} />
        </span>
        {s.mode === 'sleep' && (
          <span className="pet-zzz" aria-hidden="true">
            z z
          </span>
        )}
      </button>
    </div>
  )
}

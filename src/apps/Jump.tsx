import { useEffect, useRef, useState } from 'react'
import { Chindi } from '../icons/Chindi'
import { Person } from '../icons/Family'
import { FAMILY_IDS, PERSON_H, PERSON_W, familyLabel } from '../icons/people'
import type { FamilyId } from '../icons/people'
import { readStored, writeStored } from '../storage'
import './jump.css'

const BEST_KEY = 'vb.jump'
const SCALE = 3
/** the walking Chindi, in screen pixels */
const CAT_W = 22 * SCALE
const CAT_X = 36
const MAN_W = PERSON_W * SCALE
const MAN_H = PERSON_H * SCALE
/** how far a box is made smaller for the hit test, so that a near miss is a miss */
const SLACK = 9

const JUMP = 590
const GRAVITY = 1750
const START_SPEED = 230
const TOP_SPEED = 430

interface Runner {
  id: FamilyId
  /** left edge in px; off the track when it is not running */
  x: number
  on: boolean
  passed: boolean
}

/** A jump game: Chindi runs, my family comes the other way, and she must jump over each of them. */
export function Jump() {
  const [state, setState] = useState<'ready' | 'running' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(readStored(BEST_KEY)) || 0)
  const [hit, setHit] = useState<FamilyId | null>(null)
  const [step, setStep] = useState(false)

  const trackRef = useRef<HTMLDivElement>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const peopleRef = useRef<Partial<Record<FamilyId, HTMLDivElement | null>>>({})
  const game = useRef({
    y: 0,
    vy: 0,
    speed: START_SPEED,
    gap: 0,
    score: 0,
    runners: FAMILY_IDS.map((id): Runner => ({ id, x: -MAN_W, on: false, passed: false })),
  })

  const start = () => {
    const g = game.current
    g.y = 0
    g.vy = 0
    g.speed = START_SPEED
    g.gap = 260
    g.score = 0
    for (const runner of g.runners) runner.on = false
    setScore(0)
    setHit(null)
    setState('running')
  }

  /** One control for all of it: start, jump, and start again. */
  const act = () => {
    const g = game.current
    if (state !== 'running') start()
    else if (g.y === 0) g.vy = JUMP
  }
  const actRef = useRef(act)
  useEffect(() => {
    actRef.current = act
  })

  // Space and the up arrow work when this window is the active one and the focus is not on the button itself
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'ArrowUp') return
      const frame = trackRef.current?.closest('[data-win]')
      const focus = document.activeElement
      if (!frame || !frame.contains(focus) || focus instanceof HTMLButtonElement) return
      e.preventDefault()
      actRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // the legs move while she runs
  useEffect(() => {
    if (state !== 'running') return
    const timer = window.setInterval(() => setStep((s) => !s), 110)
    return () => window.clearInterval(timer)
  }, [state])

  useEffect(() => {
    if (state !== 'running') return
    const g = game.current
    let frame = 0
    let last = performance.now()

    const place = () => {
      if (catRef.current) catRef.current.style.transform = `translateY(${-g.y}px)`
      for (const runner of g.runners) {
        const el = peopleRef.current[runner.id]
        if (el) el.style.transform = `translateX(${runner.on ? runner.x : -MAN_W * 2}px)`
      }
    }

    const tick = (now: number) => {
      // a long frame, for example after the tab was hidden, must not throw her through a person
      const dt = Math.min((now - last) / 1000, 0.034)
      last = now
      const width = trackRef.current?.clientWidth ?? 480

      g.vy -= GRAVITY * dt
      g.y = Math.max(0, g.y + g.vy * dt)
      if (g.y === 0) g.vy = 0

      // the next person comes in when the last one is far enough along
      g.gap -= g.speed * dt
      if (g.gap <= 0) {
        const waiting = g.runners.filter((runner) => !runner.on)
        if (waiting.length) {
          const next = waiting[Math.floor(Math.random() * waiting.length)]
          next.on = true
          next.passed = false
          next.x = width
        }
        g.gap = g.speed * (0.95 + Math.random() * 0.75)
      }

      let bumped: FamilyId | null = null
      for (const runner of g.runners) {
        if (!runner.on) continue
        runner.x -= g.speed * dt
        if (runner.x < -MAN_W) runner.on = false
        const overlapX = runner.x + SLACK < CAT_X + CAT_W - SLACK && runner.x + MAN_W - SLACK > CAT_X + SLACK
        if (overlapX && g.y < MAN_H - SLACK) bumped = runner.id
        if (!runner.passed && runner.x + MAN_W < CAT_X) {
          runner.passed = true
          g.score += 1
          g.speed = Math.min(TOP_SPEED, g.speed + 9)
          setScore(g.score)
        }
      }

      place()
      if (bumped) {
        setHit(bumped)
        setState('over')
        setBest((old) => {
          const top = Math.max(old, g.score)
          writeStored(BEST_KEY, String(top))
          return top
        })
        return
      }
      frame = requestAnimationFrame(tick)
    }

    place()
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [state])

  const message =
    state === 'ready'
      ? 'Press space or tap to start. Jump over my family.'
      : state === 'over' && hit
        ? `Chindi ran into ${familyLabel(hit)}. Press space or tap to try again.`
        : ''

  return (
    <div className="jump" data-state={state}>
      <p className="jump-score">
        <span>
          Jumped <strong>{score}</strong>
        </span>
        <span>
          Best <strong>{best}</strong>
        </span>
      </p>
      <button type="button" className="jump-track" onClick={act} aria-label="Jump">
        <div className="jump-world" ref={trackRef}>
          <div className="jump-cat" ref={catRef} style={{ left: CAT_X }}>
            <Chindi pose={state === 'running' && step ? 'walkB' : 'walkA'} scale={SCALE} />
          </div>
          {FAMILY_IDS.map((id) => (
            <div
              key={id}
              className="jump-person"
              ref={(el) => {
                peopleRef.current[id] = el
              }}
              style={{ transform: `translateX(${-MAN_W * 2}px)` }}
            >
              <Person who={id} scale={SCALE} />
            </div>
          ))}
        </div>
      </button>
      <p className="jump-message" role="status">
        {message}
      </p>
    </div>
  )
}

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { content } from '../content'
import type { Job } from '../content'
import { prefersReducedMotion } from '../motion'
import { CardStack } from './CardStack'
import { JobMachine } from './work/machines'
import './work.css'

// oldest first, so the disk box reads left to right in time
const JOBS = content.work.filter((job) => job.start).sort((a, b) => a.start!.localeCompare(b.start!))
const CURRENT = JOBS.find((job) => !job.end) ?? JOBS[JOBS.length - 1]
const READ_MS = 750
// the scene is drawn for a window body of this size, and grows with a larger window
const DESIGN_W = 768
const DESIGN_H = 500

function Floppy({ label, tone }: { label: string; tone: number }) {
  return (
    <span className={`floppy floppy-${tone % 3}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path className="floppy-body" d="M1 1H34L39 6V39H1Z" />
        <rect className="floppy-shutter" x="10" y="1" width="19" height="12" />
        <rect className="floppy-hole" x="22" y="3" width="4" height="8" />
        <rect className="floppy-label" x="5" y="18" width="30" height="21" />
      </svg>
      <span className="floppy-text">{label}</span>
    </span>
  )
}

const MONTHS = [...'JFMAMJJASOND']
// the largest type on the printout, as a multiple of the normal size
const MAX_TYPE = 1.5

/** Months since year 0, from YYYY-MM. */
function monthCount(yearMonth: string): number {
  const [year, month] = yearMonth.split('-').map(Number)
  return year * 12 + month - 1
}

/** One job on continuous printer paper. The lines print one after the other. */
function Printout({ job, now }: { job: Job; now: number }) {
  const first = monthCount(job.start!)
  const last = job.end ? monthCount(job.end) : now
  const january = Math.floor(first / 12) * 12
  let n = 0
  const line = () => ({ '--n': n++ }) as CSSProperties
  const paperRef = useRef<HTMLElement>(null)

  // A short job prints in larger type, so that each sheet is about as long as the Mac column.
  useLayoutEffect(() => {
    const paper = paperRef.current
    const scene = paper?.closest('.work')
    const column = scene?.querySelector('.work-left')
    if (!paper || !scene || !column) return
    const fit = () => {
      // one column on a narrow screen: the paper has all the height it needs
      const sideBySide = paper.getBoundingClientRect().top < column.getBoundingClientRect().bottom - 1
      let low = 1
      let high = sideBySide ? MAX_TYPE : 1
      for (let i = 0; i < 6 && high > low; i++) {
        const mid = (low + high) / 2
        paper.style.setProperty('--fit', String(mid))
        if (paper.offsetHeight <= column.clientHeight) low = mid
        else high = mid
      }
      paper.style.setProperty('--fit', String(low))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])

  return (
    <article className="work-paper work-detail" aria-live="polite" ref={paperRef}>
      <h3 style={line()}>{job.org}</h3>
      <p className="work-role" style={line()}>
        {job.role}
      </p>
      <p className="work-period" style={line()}>
        {job.period}
      </p>
      {/* the months of that year, with the months of this job filled */}
      <p className="work-months" style={line()} aria-hidden="true">
        {MONTHS.map((letter, i) => (
          <span key={i} className={january + i >= first && january + i <= last ? 'is-on' : ''}>
            {letter}
          </span>
        ))}
        <b>{Math.floor(first / 12)}</b>
      </p>
      <ul className="work-points">
        {job.points.map((point) => (
          <li key={point} style={line()}>
            {point}
          </li>
        ))}
      </ul>
      {job.tools && (
        <ul className="work-tools" aria-label="Tools" style={line()}>
          {job.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      )}
      <p className="work-end" style={line()} aria-hidden="true">
        end of disk
      </p>
    </article>
  )
}

/** Each job is a floppy disk. Put one in the drive and the Mac shows the work. */
export function Work() {
  const [loadedId, setLoadedId] = useState<string | null>(CURRENT.id)
  const [reading, setReading] = useState(false)
  const [over, setOver] = useState(false)
  const macRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLSpanElement>(null)
  const drag = useRef<{ x: number; y: number; dx: number; dy: number; moved: boolean } | null>(null)
  const skipClick = useRef(false)
  const readTimer = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // in a larger window the Mac, the disks and the paper all become larger
  useEffect(() => {
    const frame = rootRef.current?.parentElement
    if (!frame) return
    const fit = () => {
      const next = Math.min(frame.clientHeight / DESIGN_H, frame.clientWidth / DESIGN_W)
      setScale(Math.max(1, Math.round(next * 100) / 100))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])
  // the current month, read once when the window opens
  const [now] = useState(() => {
    const today = new Date()
    return today.getFullYear() * 12 + today.getMonth()
  })

  useEffect(() => () => window.clearTimeout(readTimer.current), [])

  const loaded = JOBS.find((job) => job.id === loadedId)

  /** The disk flies into the slot, then the drive reads it. */
  const insert = async (job: Job, disk: HTMLElement, dx = 0, dy = 0) => {
    const slot = slotRef.current
    const still = prefersReducedMotion()
    if (slot && !still) {
      const from = disk.getBoundingClientRect()
      const to = slot.getBoundingClientRect()
      // the rectangles are in screen pixels, and the transform is in the pixels of the scaled scene
      const x = dx + (to.left + to.width / 2 - (from.left + from.width / 2)) / scale
      const y = dy + (to.top + to.height / 2 - (from.top + from.height / 2)) / scale
      await disk
        .animate([{ transform: `translate(${x}px, ${y}px) scale(0.5, 0.12)`, opacity: 0.6 }], {
          duration: 300,
          easing: 'ease-in',
        })
        .finished.catch(() => {})
    }
    setLoadedId(job.id)
    if (still) return
    setReading(true)
    window.clearTimeout(readTimer.current)
    readTimer.current = window.setTimeout(() => setReading(false), READ_MS)
  }

  const eject = () => {
    window.clearTimeout(readTimer.current)
    setReading(false)
    setLoadedId(null)
  }

  const overMac = (e: PointerEvent) => {
    const mac = macRef.current?.getBoundingClientRect()
    return !!mac && e.clientX > mac.left && e.clientX < mac.right && e.clientY > mac.top && e.clientY < mac.bottom
  }

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    skipClick.current = false
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, dx: 0, dy: 0, moved: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    d.dx = (e.clientX - d.x) / scale
    d.dy = (e.clientY - d.y) / scale
    // a small move is still a click
    if (!d.moved && Math.hypot(d.dx, d.dy) * scale < 5) return
    d.moved = true
    e.currentTarget.classList.add('is-dragging')
    e.currentTarget.style.transform = `translate(${d.dx}px, ${d.dy}px) rotate(-4deg)`
    setOver(overMac(e))
  }

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>, job: Job) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    // the click that follows a drag must not insert the disk
    skipClick.current = true
    setOver(false)
    const disk = e.currentTarget
    disk.classList.remove('is-dragging')
    if (overMac(e)) {
      void insert(job, disk, d.dx, d.dy)
    } else {
      disk.style.transform = ''
    }
  }

  const disks = (
    <ol className="work-box" aria-label="Disk box">
      {JOBS.map((job, i) => (
        <li key={job.id} className="work-bay">
          {job.id === loadedId ? (
            <span className="work-gone">in the drive</span>
          ) : (
            <button
              type="button"
              className="work-disk"
              aria-label={`Insert disk: ${job.org}, ${job.role}, ${job.period}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => onPointerUp(e, job)}
              onPointerCancel={(e) => onPointerUp(e, job)}
              onClick={(e) => {
                if (skipClick.current) return
                void insert(job, e.currentTarget)
              }}
            >
              <Floppy label={job.disk ?? job.org} tone={i} />
            </button>
          )}
          <span className="work-year">{job.end ? job.start!.slice(0, 4) : 'now'}</span>
        </li>
      ))}
    </ol>
  )

  return (
    <div className="work" ref={rootRef} style={{ zoom: scale }}>
      <div className="work-left">
        <div className={`work-mac${over ? ' is-over' : ''}`} ref={macRef}>
          <div className="work-screen">
            {!loaded && (
              <div className="work-idle">
                <span className="work-ask" aria-hidden="true">
                  <Floppy label="?" tone={3} />
                </span>
                <p>No disk in the drive.</p>
              </div>
            )}
            {loaded && reading && (
              <div className="work-idle" role="status">
                <p>Reading “{loaded.disk}”</p>
                <span className="work-progress" aria-hidden="true" />
              </div>
            )}
            {loaded && !reading && <JobMachine key={loaded.id} id={loaded.id} />}
          </div>
          <div className="work-chin">
            <span className={`work-led${reading ? ' is-busy' : loaded ? ' is-on' : ''}`} aria-hidden="true" />
            <span className="work-slot" ref={slotRef} aria-hidden="true" />
            <button type="button" className="btn work-eject" onClick={eject} disabled={!loaded}>
              Eject
            </button>
          </div>
        </div>
        <p className="work-hint">Drag a disk into the drive, or click it.</p>
        {disks}
      </div>

      {/* the printer: it prints the job that is on the disk */}
      <div className="work-printer">
        <span className="work-feed" aria-hidden="true" />
        {loaded && !reading ? (
          <Printout key={loaded.id} job={loaded} now={now} />
        ) : (
          <div className="work-paper work-paper-blank">
            <p>{loaded ? 'Printing…' : 'Put a disk in the drive and the job prints here.'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function Community() {
  return <CardStack jobs={content.community} />
}

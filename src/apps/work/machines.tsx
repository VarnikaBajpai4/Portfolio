import { useEffect, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { prefersReducedMotion } from '../../motion'

/** Counts 0..count-1 again and again. With reduced motion it stays on the last step. */
function useStep(count: number, ms: number): number {
  const [step, setStep] = useState(() => (prefersReducedMotion() ? count - 1 : 0))
  useEffect(() => {
    if (prefersReducedMotion()) return
    const timer = window.setInterval(() => setStep((s) => (s + 1) % count), ms)
    return () => window.clearInterval(timer)
  }, [count, ms])
  return step
}

const RAW_ROWS = [
  ['"12,400 "', 'north', 'NULL'],
  ['9800', 'NORTH ', '14'],
  ['"7,150"', 'south', '9'],
  ['n/a', 'South', '21'],
]
const CLEAN_ROWS = [
  ['12400', 'north', '0'],
  ['9800', 'north', '14'],
  ['7150', 'south', '9'],
  ['0', 'south', '21'],
]
const BAR_HEIGHTS = [86, 68, 50, 30]

/** G-Square: messy rows are cleaned one by one, then the chart draws itself. */
function DataToDashboard() {
  const step = useStep(11, 620)
  return (
    <div className="mach-data" aria-hidden="true">
      <ul className="mach-rows">
        {RAW_ROWS.map((row, i) => {
          const clean = step > i
          return (
            <li key={i} className={clean ? 'is-clean' : ''}>
              {(clean ? CLEAN_ROWS[i] : row).map((cell, c) => (
                <span key={c}>{cell}</span>
              ))}
            </li>
          )
        })}
      </ul>
      <span className="mach-arrow">→</span>
      <div className="mach-bars">
        {BAR_HEIGHTS.map((height, i) => (
          <span key={i} style={{ height: step > i + 4 ? `${height}%` : '4%' }} />
        ))}
      </div>
    </div>
  )
}

const BINS = ['script', 'product', 'environment']
const LOGS = [
  { text: 'TimeoutError: element not found', bin: 0 },
  { text: 'AssertionError: expected 200, got 500', bin: 1 },
  { text: 'ConnectionRefused: service is down', bin: 2 },
  { text: 'StaleElement: locator is out of date', bin: 0 },
  { text: 'AssertionError: total is not correct', bin: 1 },
  { text: 'DNS lookup failed for test host', bin: 2 },
  { text: 'NoSuchElement: the id was renamed', bin: 0 },
]

/** Barclays internship: a classifier reads each failed test log and puts it in a bin. */
function LogSorter() {
  // two steps for each log (read, then sort), and a short stop at the end
  const step = useStep(LOGS.length * 2 + 3, 560)
  const done = step >= LOGS.length * 2
  const index = Math.min(Math.floor(step / 2), LOGS.length - 1)
  const sorted = done || step % 2 === 1
  const log = LOGS[index]
  const counts = BINS.map((_, bin) => LOGS.filter((l, i) => l.bin === bin && (i < index || (i === index && sorted))).length)
  return (
    <div className="mach-logs" aria-hidden="true">
      <div className="mach-log">
        <code key={index}>{done ? 'All logs sorted.' : log.text}</code>
        <span className={`mach-verdict${sorted && !done ? ' is-on' : ''}`}>{BINS[log.bin]}</span>
      </div>
      <div className="mach-bins">
        {BINS.map((name, bin) => (
          <div key={name} className={`mach-bin${sorted && !done && log.bin === bin ? ' is-hit' : ''}`}>
            <div className="mach-stack">
              {Array.from({ length: counts[bin] }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <b>{name}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

/** [x, y, index of the parent] in the order of a depth-first walk */
const TREE: [number, number, number][] = [
  [100, 12, -1],
  [50, 44, 0],
  [20, 80, 1],
  [50, 80, 1],
  [80, 80, 1],
  [150, 44, 0],
  [125, 80, 5],
  [175, 80, 5],
]
const LEAVES = TREE.map((_, i) => i).filter((i) => !TREE.some((node) => node[2] === i))
const LEAF_HEIGHTS = [70, 100, 45, 85, 60]

/** LyondellBasell: walk the test tree from parent to child, and feed each test to the dashboard. */
function TreeWalk() {
  const step = useStep(TREE.length + 4, 520)
  const visited = Math.min(step + 1, TREE.length)
  const found = LEAVES.filter((i) => i < visited).length
  return (
    <div className="mach-tree" aria-hidden="true">
      <svg viewBox="0 0 200 92">
        {TREE.map(([x, y, parent], i) =>
          parent < 0 ? null : (
            <line key={i} x1={TREE[parent][0]} y1={TREE[parent][1]} x2={x} y2={y} className={i < visited ? 'is-on' : ''} />
          ),
        )}
        {TREE.map(([x, y], i) => (
          <rect
            key={i}
            x={x - 7}
            y={y - 7}
            width="14"
            height="14"
            className={`${i < visited ? 'is-on' : ''}${i === visited - 1 && visited < TREE.length ? ' is-head' : ''}`}
          />
        ))}
      </svg>
      <div className="mach-dash">
        <span>
          <b>{found}</b> / {LEAVES.length} tests
        </span>
        <div className="mach-bars">
          {LEAVES.map((leaf, i) => (
            <span key={leaf} style={{ height: leaf < visited ? `${LEAF_HEIGHTS[i]}%` : '4%' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const SECTORS = 48
const WRITTEN = 17

/** The current job: a disk that is not full yet. */
function StillWriting() {
  return (
    <div className="mach-sectors" aria-hidden="true">
      {Array.from({ length: SECTORS }, (_, i) => (
        <span
          key={i}
          className={i < WRITTEN ? 'is-written' : i === WRITTEN ? 'is-head' : ''}
          style={{ '--n': i } as CSSProperties}
        />
      ))}
    </div>
  )
}

const MACHINES: Record<string, { caption: string; Machine: ComponentType }> = {
  gsquare: { caption: 'Raw data in. Dashboard out.', Machine: DataToDashboard },
  'barclays-intern': { caption: 'A classifier sorts failed test logs by cause.', Machine: LogSorter },
  lyb: { caption: 'Walk the test tree. Feed the dashboard.', Machine: TreeWalk },
  barclays: { caption: 'This disk is still being written.', Machine: StillWriting },
}

/** The small working model of one job, by job id. */
export function JobMachine({ id, tone }: { id: string; tone: number }) {
  const entry = MACHINES[id]
  if (!entry) return null
  return (
    <figure className={`work-machine work-machine-${tone % 3}`}>
      <entry.Machine />
      <figcaption>{entry.caption}</figcaption>
    </figure>
  )
}

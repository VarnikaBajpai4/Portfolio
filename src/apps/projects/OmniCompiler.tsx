import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../content'
import { prefersReducedMotion } from '../../motion'
import { ARRAY, COMPLEXITY, COPY, EDGES, GRAPH, LANGUAGES, SUGGESTED, TARGET, TRACE } from './omniData'
import type { Language } from './omniData'
import './omni.css'
import { Showcase } from './Showcase'

const GLYPHS = '{}[]()<>=+-*/;:#&|!?01'
const MORPH_FRAMES = 9
const PLAY_MS = 750

/** The code as it is drawn right now: while a translation plays, lines are part noise. */
function useMorph(language: Language): string[] {
  const target = language.lines.map((l) => l.text)
  const [frame, setFrame] = useState(MORPH_FRAMES)
  const [shown, setShown] = useState(language.id)
  if (shown !== language.id) {
    setShown(language.id)
    setFrame(prefersReducedMotion() ? MORPH_FRAMES : 0)
  }

  useEffect(() => {
    if (frame >= MORPH_FRAMES) return
    const timer = window.setTimeout(() => setFrame((f) => f + 1), 38)
    return () => window.clearTimeout(timer)
  }, [frame])

  if (frame >= MORPH_FRAMES) return target
  return target.map((text, row) => {
    // each line settles from left to right, a little later than the line above it
    const settled = Math.floor((text.length * Math.max(0, frame - row * 0.25)) / (MORPH_FRAMES - 3))
    return [...text]
      .map((ch, i) => (i < settled || ch === ' ' || ch === '\t' ? ch : GLYPHS[(i * 7 + row * 3 + frame * 5) % GLYPHS.length]))
      .join('')
  })
}

export function OmniCompiler({ project, onBack }: { project: Project; onBack: () => void }) {
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const language = LANGUAGES.find((l) => l.id === languageId)!
  const code = useMorph(language)
  const step = TRACE[stepIndex]
  const done = stepIndex === TRACE.length - 1
  const visited = new Set(TRACE.slice(0, stepIndex + 1).map((s) => s.node))
  const eventsRef = useRef<HTMLOListElement>(null)

  // What the debugger would send for each stop, with line numbers of the language on screen.
  const lineOf = (node: string) => language.lines.findIndex((l) => l.node === node) + 1
  const events = TRACE.slice(0, stepIndex + 1).map((s) => `{"event":"stopped","line":${lineOf(s.node)}}`)
  if (done) events.push(`{"event":"terminated","result":${step.mid}}`)

  useEffect(() => {
    const el = eventsRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [stepIndex])

  // while playing, take the next step after a pause; the run stops by itself at the last step
  const running = playing && !done
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setStepIndex((i) => i + 1), PLAY_MS)
    return () => window.clearTimeout(timer)
  }, [running, stepIndex])

  return (
    <Showcase project={project} copy={COPY} theme="show-omni" onBack={onBack}>
      <div className="omni-ide px-border">
        <div className="omni-bar">
          <div className="omni-tabs" role="tablist" aria-label="Language">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={l.id === languageId}
                className="omni-tab"
                onClick={() => setLanguageId(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="omni-buttons">
            <span className="omni-count">
              step {stepIndex + 1} of {TRACE.length}
            </span>
            <button type="button" onClick={() => setStepIndex((i) => i + 1)} disabled={done || running}>
              Step
            </button>
            <button type="button" onClick={() => setPlaying(!running)} disabled={done}>
              {running ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaying(false)
                setStepIndex(0)
              }}
              disabled={stepIndex === 0}
            >
              Restart
            </button>
          </div>
        </div>

        <section className="omni-code" aria-label="Code">
          <ol className="omni-lines">
            {language.lines.map((l, i) => (
              <li
                key={i}
                className={l.node === step.node ? 'is-current' : undefined}
                aria-current={l.node === step.node ? 'step' : undefined}
              >
                <span className="omni-gutter" aria-hidden="true">
                  {l.node && SUGGESTED.includes(l.node) ? '✦' : ''}
                </span>
                <code>{code[i]}</code>
              </li>
            ))}
          </ol>
          <p className="omni-codefoot">
            <span>✦ suggested breakpoint</span>
            <span>debugger: {language.debugger}</span>
          </p>
        </section>

        <section className="omni-graph" aria-label="Control-flow graph">
          <h4>Control flow</h4>
          <svg viewBox="0 0 300 350" role="img" aria-label={`Control-flow graph. Now at: ${step.node}`}>
            {EDGES.map((edge) => (
              <path key={edge.d} d={edge.d} className={edge.back ? 'omni-edge is-back' : 'omni-edge'} />
            ))}
            {GRAPH.map((node) => (
              <g
                key={node.id}
                className={`omni-node${node.test ? ' is-test' : ''}${visited.has(node.id) ? ' is-visited' : ''}${
                  node.id === step.node ? ' is-current' : ''
                }`}
              >
                <rect x={node.x - 42} y={node.y - 15} width={84} height={30} rx={node.test ? 15 : 3} />
                <text x={node.x} y={node.y + 4}>
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
          <p className="omni-caption">cyclomatic complexity {COMPLEXITY}</p>
        </section>

        <section className="omni-debug" aria-label="Debugger">
          <h4>Searching for {TARGET}</h4>
          <ol className="omni-array" aria-label="The array being searched">
            {ARRAY.map((value, i) => {
              const inRange = i >= step.lo && i <= step.hi
              const marks = [i === step.lo && 'lo', i === step.mid && 'mid', i === step.hi && 'hi'].filter(Boolean)
              return (
                <li
                  key={value}
                  className={`${inRange ? 'in-range' : ''}${i === step.mid ? ' is-mid' : ''}${
                    done && i === step.mid ? ' is-found' : ''
                  }`}
                >
                  <span className="omni-cell">{value}</span>
                  <span className="omni-marks">{marks.join(' ')}</span>
                </li>
              )
            })}
          </ol>
          <p className={`omni-note${done ? ' is-done' : ''}`} role="status">
            {step.note}
          </p>
          <h4>Debugger events</h4>
          <ol className="omni-events" ref={eventsRef} aria-label="Debugger events">
            {events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ol>
        </section>
      </div>
    </Showcase>
  )
}

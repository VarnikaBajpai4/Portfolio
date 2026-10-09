import { useEffect, useRef, useState } from 'react'
import type { Project } from '../../content'
import { prefersReducedMotion } from '../../motion'
import { useWindowControls } from '../../wm/store'
import { ARRAY, COMPLEXITY, EDGES, GRAPH, LANGUAGES, PIPELINE, SUGGESTED, TARGET, TRACE } from './omniData'
import type { Language } from './omniData'
import './omni.css'

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
  const controls = useWindowControls()
  const grew = useRef(false)
  const [languageId, setLanguageId] = useState(LANGUAGES[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [stage, setStage] = useState(0)

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

  // The showcase needs room: make the window large while it is open, and put it back after.
  useEffect(() => {
    if (controls && !controls.zoomed && !grew.current) {
      grew.current = true
      controls.toggleZoom()
    }
    // only on the way in
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => setStepIndex((i) => i + 1), PLAY_MS)
    return () => window.clearTimeout(timer)
  }, [playing, done, stepIndex])

  const back = () => {
    if (grew.current && controls?.zoomed) controls.toggleZoom()
    onBack()
  }

  return (
    <article className="omni">
      <header className="omni-head">
        <div>
          <h2>{project.name}</h2>
          <p className="omni-tagline">Run, debug, translate and analyse code in five languages, from one editor.</p>
        </div>
        <p className="omni-stamp" aria-label="Paper under review">
          Paper under review
        </p>
        <div className="omni-actions">
          <a className="btn" href={project.repo} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
          <button type="button" className="btn" onClick={back}>
            Back to Projects
          </button>
        </div>
      </header>

      <div className="omni-ide px-border">
        {/* ----- code ----- */}
        <section className="omni-code" aria-label="Code">
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

        {/* ----- control-flow graph ----- */}
        <section className="omni-graph" aria-label="Control-flow graph">
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
          <p className="omni-badge">cyclomatic complexity {COMPLEXITY}</p>
        </section>

        {/* ----- debugger ----- */}
        <section className="omni-debug" aria-label="Debugger">
          <div className="omni-buttons">
            <button type="button" className="btn" onClick={() => setStepIndex((i) => i + 1)} disabled={done || playing}>
              Step
            </button>
            <button type="button" className="btn" onClick={() => setPlaying((p) => !p)} disabled={done}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setPlaying(false)
                setStepIndex(0)
              }}
              disabled={stepIndex === 0}
            >
              Restart
            </button>
          </div>

          <p className="omni-call">
            binary_search(arr, <strong>{TARGET}</strong>)
          </p>
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

          <dl className="omni-vars">
            <dt>lo</dt>
            <dd>{step.lo}</dd>
            <dt>hi</dt>
            <dd>{step.hi}</dd>
            <dt>mid</dt>
            <dd>{step.mid ?? '-'}</dd>
          </dl>
          <p className={`omni-note${done ? ' is-done' : ''}`} role="status">
            {step.note}
          </p>
          <ol className="omni-events" ref={eventsRef} aria-label="Debugger events">
            {events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ol>
          <p className="omni-count">
            step {stepIndex + 1} of {TRACE.length}
          </p>
        </section>
      </div>

      {/* ----- how it works ----- */}
      <section className="omni-pipeline" aria-label="How it works">
        <ol>
          {PIPELINE.map((item, i) => (
            <li key={item.name}>
              <button
                type="button"
                className="omni-stage"
                aria-pressed={i === stage}
                onClick={() => setStage(i)}
                onPointerEnter={() => setStage(i)}
                onFocus={() => setStage(i)}
              >
                <span className="omni-stage-n">{i + 1}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ol>
        <p className="omni-stage-text" role="status">
          {PIPELINE[stage].text}
        </p>
      </section>
    </article>
  )
}

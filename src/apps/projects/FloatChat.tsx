import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../../content'
import { PixelGrid } from '../../icons/PixelGrid'
import { prefersReducedMotion } from '../../motion'
import './float.css'
import { COAST, COPY, FLOATS, MONTHS, QUESTIONS, SALINITY, STAGES, TEMPERATURE } from './floatData'
import type { Question, View } from './floatData'
import { Showcase } from './Showcase'

const STAGE_MS = 520

function LineChart() {
  const low = 25
  const high = 31
  const x = (i: number) => 34 + i * 22
  const y = (t: number) => 118 - ((t - low) / (high - low)) * 100
  const path = TEMPERATURE.map((t, i) => `${i ? 'L' : 'M'}${x(i)} ${y(t).toFixed(1)}`).join(' ')
  return (
    <svg className="float-chart" viewBox="0 0 300 150" role="img" aria-label="Monthly sea temperature, January to December">
      {[26, 28, 30].map((t) => (
        <g key={t}>
          <line x1="30" x2="290" y1={y(t)} y2={y(t)} className="float-grid" />
          <text x="24" y={y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}
      {[...MONTHS].map((month, i) => (
        <text key={i} x={x(i)} y="140" textAnchor="middle">
          {month}
        </text>
      ))}
      <path d={path} pathLength={1} className="float-line" />
      {TEMPERATURE.map((t, i) => (
        <rect key={i} x={x(i) - 3} y={y(t) - 3} width="6" height="6" className="float-dot" style={{ '--n': i } as CSSProperties} />
      ))}
    </svg>
  )
}

function FloatMap() {
  return (
    <div className="float-map" role="img" aria-label="Map of float positions around India">
      <PixelGrid rows={COAST} legend={{ L: '#e9d8a6' }} size={264} />
      {FLOATS.map(([left, top], i) => (
        <span key={i} className="float-pin" style={{ left: `${left}%`, top: `${top}%`, '--n': i } as CSSProperties} />
      ))}
    </div>
  )
}

const SHADES = ['#d7ecff', '#9fcdf5', '#5aa2e0', '#2f6fb8', '#173f7a']

function HeatMap() {
  const all = SALINITY.flat()
  const min = Math.min(...all)
  const span = Math.max(...all) - min
  return (
    <div className="float-heat" role="img" aria-label="Salinity grid: fresher in the north, saltier in the south">
      <div className="float-cells">
        {SALINITY.flatMap((row, r) =>
          row.map((value, c) => (
            <span
              key={`${r}-${c}`}
              style={
                {
                  background: SHADES[Math.min(4, Math.floor(((value - min) / span) * 5))],
                  '--n': r + c,
                } as CSSProperties
              }
            />
          )),
        )}
      </div>
      <p className="float-legend">
        <span>31 PSU</span>
        {SHADES.map((shade) => (
          <i key={shade} style={{ background: shade }} />
        ))}
        <span>35 PSU</span>
      </p>
    </div>
  )
}

const VIEWS: Record<View, () => React.JSX.Element> = { line: LineChart, map: FloatMap, heat: HeatMap }

export function FloatChat({ project, onBack }: { project: Project; onBack: () => void }) {
  const [question, setQuestion] = useState<Question | null>(null)
  /** how many stages the question has passed */
  const [reached, setReached] = useState(0)

  // a refused question stops at the gatekeeper
  const last = question?.verdict === 'proceed' ? STAGES.length : 1
  const answered = question !== null && reached >= last

  useEffect(() => {
    if (!question || reached >= last) return
    const timer = window.setTimeout(() => setReached((n) => n + 1), STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [question, reached, last])

  const ask = (next: Question) => {
    setQuestion(next)
    setReached(prefersReducedMotion() ? STAGES.length : 0)
  }

  const detail = (stage: number): string | undefined => {
    if (!question) return undefined
    return [
      question.verdict,
      'schema and notes from Chroma',
      question.tool,
      question.sql,
      'figure returned to the chat',
    ][stage]
  }

  const View = question?.view ? VIEWS[question.view] : null

  return (
    <Showcase project={project} copy={COPY} theme="show-float" onBack={onBack}>
      <div className="float-demo px-border">
        {/* ----- the chat ----- */}
        <section className="float-chat" aria-label="Chat">
          <div className="float-thread" aria-live="polite">
            <p className="float-bot">Ask me about temperature, salinity, oxygen, or where the floats are.</p>
            {question && <p className="float-user">{question.ask}</p>}
            {question && !answered && <p className="float-bot float-thinking">Working</p>}
            {question && answered && (
              <div className="float-bot float-answer" key={question.id}>
                <p>{question.answer}</p>
                {View && <View />}
              </div>
            )}
          </div>
          <div className="float-asks">
            {QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                className="float-ask"
                aria-pressed={q.id === question?.id}
                onClick={() => ask(q)}
              >
                {q.ask}
              </button>
            ))}
          </div>
          <div className="float-sea" aria-hidden="true" />
        </section>

        {/* ----- what happened to the question ----- */}
        <section className="float-trace" aria-label="What happens to the question">
          <h4>What happens to the question</h4>
          <ol>
            {STAGES.map((stage, i) => {
              const refused = question?.verdict === 'irrelevant'
              const state = !question || i >= reached ? (i === reached && question && !answered ? 'now' : 'todo') : 'done'
              const stopped = refused && i === 0 && reached > 0
              return (
                <li key={stage} className={`is-${stopped ? 'stopped' : refused && i > 0 ? 'todo' : state}`}>
                  <span className="float-stage">{stage}</span>
                  {question && i < reached && !(refused && i > 0) && <code>{detail(i)}</code>}
                </li>
              )
            })}
          </ol>
          <p className="float-foot">
            {question?.verdict === 'irrelevant' && answered
              ? 'Off-topic questions stop at the gatekeeper. No tool is called.'
              : 'Every answer is built from a tool call you can see.'}
          </p>
        </section>
      </div>
    </Showcase>
  )
}

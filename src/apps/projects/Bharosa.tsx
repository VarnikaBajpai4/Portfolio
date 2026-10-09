import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../../content'
import { Sticker } from '../../icons/Sticker'
import { prefersReducedMotion } from '../../motion'
import './bharosa.css'
import { Showcase } from './Showcase'
import type { ShowcaseCopy } from './Showcase'

const COPY: ShowcaseCopy = {
  tagline: 'A bank branch queue that listens, checks who you are, and serves the most urgent case first.',
  stamp: '2nd runner-up',
  overview: [
    'In a bank branch, everyone takes a token and waits in the same line, whatever they need. UBI Bharosa replaces the token with a smart ticket.',
    'A customer states the problem by text, voice or video. Whisper transcribes it, a classifier sends it to the right department, face and voice checks confirm the customer, and a priority model decides the place in the queue. The customer is then served live or given an appointment, and a second model suggests loans that fit them.',
  ],
  meta: '2nd runner-up among 500+ teams, Union Bank of India Idea Hackathon (national level). Team Debug Dynasty.',
  stack: [
    { layer: 'Interface', parts: ['React', 'Vite', 'Tailwind CSS'] },
    { layer: 'Server', parts: ['Node.js', 'Express', 'PostgreSQL', 'JWT'] },
    { layer: 'ML service', parts: ['Python', 'FastAPI', 'Whisper', 'DeepFace'] },
    { layer: 'Models', parts: ['ArcFace', 'XGBoost', 'Random Forest'] },
  ],
  steps: [
    { name: 'Raise', text: 'The customer describes the problem by text, audio or video.' },
    { name: 'Hear', text: 'Whisper turns speech into text.' },
    { name: 'Route', text: 'A keyword classifier picks the department.' },
    { name: 'Verify', text: 'ArcFace face embeddings and a voice check confirm identity.' },
    { name: 'Rank', text: 'An XGBoost model scores priority and orders the queue.' },
    { name: 'Suggest', text: 'A Random Forest recommends the five loans that fit best.' },
  ],
  demoTitle: 'Raise a ticket',
  demoHint: 'Send a request and watch where it lands in the queue. A recorded example with illustrative scores.',
}

interface Ticket {
  id: string
  said: string
  department: string
  score: number
}

const WAITING: Ticket[] = [
  { id: 'A-101', said: 'Renew my fixed deposit.', department: 'Deposits', score: 74 },
  { id: 'A-102', said: 'Am I eligible for a car loan?', department: 'Loans', score: 55 },
  { id: 'A-103', said: 'What is the interest on savings?', department: 'Deposits', score: 31 },
]

const REQUESTS: Ticket[] = [
  { id: 'A-104', said: 'My loan instalment was taken twice this month.', department: 'Loans', score: 91 },
  { id: 'A-105', said: 'Can I get a home loan on my salary?', department: 'Loans', score: 62 },
  { id: 'A-106', said: 'I want to open a recurring deposit.', department: 'Deposits', score: 24 },
]

const STAGES = ['Heard', 'Routed', 'Verified', 'Ranked']
const STAGE_MS = 480
const byScore = (a: Ticket, b: Ticket) => b.score - a.score

export function Bharosa({ project, onBack }: { project: Project; onBack: () => void }) {
  const [queue, setQueue] = useState(WAITING)
  const [incoming, setIncoming] = useState<Ticket | null>(null)
  const [stage, setStage] = useState(0)
  const [newest, setNewest] = useState<string | null>(null)
  const [served, setServed] = useState<Ticket | null>(null)
  const [raised, setRaised] = useState<string[]>([])

  // a request passes each check, then takes its place in the queue
  useEffect(() => {
    if (!incoming) return
    const timer = window.setTimeout(() => {
      if (stage < STAGES.length) {
        setStage(stage + 1)
        return
      }
      setQueue((q) => [...q, incoming].sort(byScore))
      setNewest(incoming.id)
      setIncoming(null)
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [incoming, stage])

  const raise = (ticket: Ticket) => {
    setRaised((list) => [...list, ticket.id])
    setIncoming(ticket)
    setStage(prefersReducedMotion() ? STAGES.length : 0)
  }

  const serve = () => {
    setServed(queue[0])
    setQueue((q) => q.slice(1))
  }

  const reset = () => {
    setQueue(WAITING)
    setIncoming(null)
    setNewest(null)
    setServed(null)
    setRaised([])
  }

  // a request can be raised once, until the demo is reset
  const used = (id: string) => raised.includes(id)

  const details = incoming ? [`"${incoming.said}"`, incoming.department, 'face match', `score ${incoming.score}`] : []

  return (
    <Showcase project={project} copy={COPY} theme="show-bharosa" onBack={onBack}>
      <div className="show-demo">
        <section className="show-pane" aria-label="Raise a request">
          <h4>At the kiosk</h4>
          <div className="bh-requests">
            {REQUESTS.map((request) => (
              <button
                key={request.id}
                type="button"
                className="bh-request"
                disabled={incoming !== null || used(request.id)}
                onClick={() => raise(request)}
              >
                <Sticker name="mic" size={24} fill="var(--c4)" />
                {request.said}
              </button>
            ))}
          </div>

          <h4>What the system does</h4>
          <ol className="bh-stages">
            {STAGES.map((name, i) => (
              <li key={name} className={incoming && i < stage ? 'is-done' : incoming && i === stage ? 'is-now' : undefined}>
                <strong>{name}</strong>
                <span>{incoming && i < stage ? details[i] : ' '}</span>
              </li>
            ))}
          </ol>
          <p className="show-note">
            {served ? `Now serving ${served.id}: ${served.said}` : 'A higher score is served sooner, whenever the ticket arrived.'}
          </p>
        </section>

        <section className="show-pane show-pane-tint" aria-label="Queue">
          <div className="bh-queue-head">
            <h4>The queue</h4>
            <div>
              <button type="button" className="btn" onClick={serve} disabled={queue.length === 0 || incoming !== null}>
                Serve next
              </button>
              <button type="button" className="btn" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
          <ol className="bh-queue">
            {queue.map((ticket, i) => (
              <li key={ticket.id} className={`bh-ticket px-border${ticket.id === newest ? ' is-new' : ''}`}>
                <span className="bh-place">{i + 1}</span>
                <span className="bh-body">
                  <strong>{ticket.id}</strong>
                  <span className="bh-dept">{ticket.department}</span>
                  <span className="bh-said">{ticket.said}</span>
                </span>
                <span className="bh-score" style={{ '--level': `${ticket.score}%` } as CSSProperties}>
                  <i />
                  {ticket.score}
                </span>
              </li>
            ))}
            {queue.length === 0 && <li className="bh-empty">The queue is empty.</li>}
          </ol>
        </section>
      </div>
    </Showcase>
  )
}

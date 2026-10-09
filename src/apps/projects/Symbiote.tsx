import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../../content'
import { Showcase } from './Showcase'
import type { ShowcaseCopy } from './Showcase'
import './symbiote.css'

const COPY: ShowcaseCopy = {
  tagline: 'Finds the hackathon teammate who is strong where you are weak.',
  overview: [
    'Hackathon teams are usually made of friends, so three frontend developers end up together with nobody to build the server. Symbiote forms teams from what people can do.',
    'It reads your resume with Gemini, studies your GitHub activity, and asks a short set of questions about how you work with others. A scoring algorithm then rates every possible pairing, rewarding teams that cover each other and penalising lopsided ones. Requests, chat and team updates are live.',
  ],
  meta: 'Built with Pratham. Scores update in real time over sockets.',
  stack: [
    { layer: 'Interface', parts: ['React', 'Vite', 'Tailwind CSS', 'Socket.io client'] },
    { layer: 'Server', parts: ['Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT'] },
    { layer: 'ML service', parts: ['Python', 'FastAPI', 'aiohttp'] },
    { layer: 'Signals', parts: ['Gemini', 'GitHub API', 'EQ assessment'] },
  ],
  steps: [
    { name: 'Resume', text: 'Gemini extracts skills and weighs frontend against backend.' },
    { name: 'GitHub', text: 'Repositories, languages and recent activity are scored.' },
    { name: 'EQ', text: 'Six traits: teamwork, pressure, problem solving, adaptability, temperament, leadership.' },
    { name: 'Score', text: 'Frontend 37.5%, backend 37.5%, EQ 25%.' },
    { name: 'Penalise', text: 'Lopsided or mismatched pairs lose points.' },
    { name: 'Team up', text: 'Requests, chat and roles, live over sockets.' },
  ],
  demoTitle: 'Find a teammate',
  demoHint: 'You are strong at frontend. Pick someone and see how the pair scores. A simplified version of the real scorer.',
}

type Skills = [frontend: number, backend: number, eq: number]

const LABELS = ['Frontend', 'Backend', 'EQ']
const WEIGHTS = [0.375, 0.375, 0.25]
const YOU: Skills = [84, 32, 70]

const CANDIDATES: { id: string; name: string; note: string; skills: Skills }[] = [
  { id: 'twin', name: 'The frontend twin', note: 'Same strengths as you.', skills: [88, 28, 74] },
  { id: 'backend', name: 'The backend specialist', note: 'Strong where you are weak.', skills: [30, 92, 68] },
  { id: 'allround', name: 'The all-rounder', note: 'Good at everything, great at nothing.', skills: [66, 68, 72] },
  { id: 'beginner', name: 'The beginner', note: 'Keen, still learning.', skills: [38, 30, 86] },
]

/** Average each skill across the pair, weigh them, then take points off for an uneven team. */
function match(a: Skills, b: Skills) {
  const team = a.map((value, i) => (value + b[i]) / 2)
  const weighted = team.reduce((sum, value, i) => sum + value * WEIGHTS[i], 0)
  const mean = (team[0] + team[1] + team[2]) / 3
  const spread = Math.sqrt(team.reduce((sum, value) => sum + (value - mean) ** 2, 0) / 3)
  const penalty = spread * 0.6
  return { team, weighted, penalty, score: Math.round(weighted - penalty) }
}

function Bars({ skills, tone }: { skills: number[]; tone?: string }) {
  return (
    <dl className="sy-bars">
      {skills.map((value, i) => (
        <div key={LABELS[i]}>
          <dt>{LABELS[i]}</dt>
          <dd style={{ '--level': `${value}%`, '--tone': tone } as CSSProperties}>
            <i />
            <span>{Math.round(value)}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function Symbiote({ project, onBack }: { project: Project; onBack: () => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [tried, setTried] = useState<string[]>([])
  const candidate = CANDIDATES.find((c) => c.id === picked)
  const result = candidate ? match(YOU, candidate.skills) : null
  const best = Math.max(...CANDIDATES.map((c) => match(YOU, c.skills).score))

  const pick = (id: string) => {
    setPicked(id)
    setTried((list) => (list.includes(id) ? list : [...list, id]))
  }

  return (
    <Showcase project={project} copy={COPY} theme="show-symbiote" onBack={onBack}>
      <div className="show-demo">
        <section className="show-pane" aria-label="Candidates">
          <h4>Who do you team up with?</h4>
          <div className="sy-people">
            {CANDIDATES.map((c) => {
              const score = match(YOU, c.skills).score
              return (
                <button
                  key={c.id}
                  type="button"
                  className="sy-person px-border"
                  aria-pressed={c.id === picked}
                  onClick={() => pick(c.id)}
                >
                  <span className="sy-name">
                    <strong>{c.name}</strong>
                    {tried.includes(c.id) && (
                      <span className={`sy-chip${score === best ? ' is-best' : ''}`}>
                        {score}
                        {score === best ? ' best' : ''}
                      </span>
                    )}
                  </span>
                  <span className="sy-note">{c.note}</span>
                  <Bars skills={c.skills} tone="var(--c1)" />
                </button>
              )
            })}
          </div>
        </section>

        <section className="show-pane show-pane-tint" aria-label="Match score" aria-live="polite">
          <h4>You</h4>
          <Bars skills={YOU} tone="var(--c4)" />

          <div className={`sy-link${result ? ' is-joined' : ''}`} aria-hidden="true" />

          <h4>{candidate ? `You + ${candidate.name.toLowerCase()}` : 'The team'}</h4>
          {result ? (
            <>
              <Bars skills={result.team} tone="var(--c2)" />
              <p className="sy-sum">
                <span>weighted {result.weighted.toFixed(1)}</span>
                <span>uneven team -{result.penalty.toFixed(1)}</span>
              </p>
              <p className="sy-score" key={picked}>
                {result.score}
                <small>match score</small>
              </p>
            </>
          ) : (
            <p className="show-note">Pick a candidate on the left.</p>
          )}
          <p className="show-note">
            {tried.length === CANDIDATES.length
              ? 'The twin scores lowest: together you still cannot build a server.'
              : 'Try all four. The highest score is not the person most like you.'}
          </p>
        </section>
      </div>
    </Showcase>
  )
}

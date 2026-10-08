import { useState } from 'react'
import type { Job } from '../content'

export function CardStack({ jobs }: { jobs: Job[] }) {
  const [index, setIndex] = useState(0)
  const job = jobs[index]
  const go = (step: number) => setIndex((i) => Math.min(Math.max(i + step, 0), jobs.length - 1))

  return (
    <div
      className="stack app-pad"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1)
        if (e.key === 'ArrowRight') go(1)
      }}
    >
      <article className="card px-border px-shadow" aria-live="polite">
        <p className="card-period">{job.period}</p>
        <h2>{job.org}</h2>
        <p className="card-role">{job.role}</p>
        <ul className="read bullets">
          {job.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>
      <div className="pager">
        <button type="button" className="btn" disabled={index === 0} onClick={() => go(-1)}>
          Previous
        </button>
        <span>
          Card {index + 1} of {jobs.length}
        </span>
        <button type="button" className="btn" disabled={index === jobs.length - 1} onClick={() => go(1)}>
          Next
        </button>
      </div>
    </div>
  )
}

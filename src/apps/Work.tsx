import { useState } from 'react'
import type { CSSProperties } from 'react'
import { content } from '../content'
import type { Job } from '../content'
import { CardStack } from './CardStack'
import './work.css'

const FIRST_YEAR = 2024

/** Months since January of the first year. */
function monthIndex(yearMonth: string): number {
  const [year, month] = yearMonth.split('-').map(Number)
  return (year - FIRST_YEAR) * 12 + month - 1
}

/** A chart of where I have worked and when: one row per employer, one bar per role. */
export function Work() {
  // the current month, read once when the window opens
  const [now] = useState(() => {
    const today = new Date()
    return (today.getFullYear() - FIRST_YEAR) * 12 + today.getMonth()
  })
  const jobs = content.work.filter((job) => job.start)
  // the chart ends with the current year
  const months = (Math.floor(now / 12) + 1) * 12
  const years = Array.from({ length: months / 12 }, (_, i) => FIRST_YEAR + i)

  // oldest first, so the arrow keys follow time
  const inOrder = [...jobs].sort((a, b) => monthIndex(a.start!) - monthIndex(b.start!))
  const employers = [...new Set(inOrder.map((job) => job.org))]
  const [selectedId, setSelectedId] = useState(jobs[0].id)
  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0]

  const span = (job: Job) => {
    const start = monthIndex(job.start!)
    const end = job.end ? monthIndex(job.end) : now
    return { start, end, left: (start / months) * 100, width: ((end - start + 1) / months) * 100 }
  }

  const step = (by: number) => {
    const i = inOrder.findIndex((job) => job.id === selectedId)
    setSelectedId(inOrder[Math.min(Math.max(i + by, 0), inOrder.length - 1)].id)
  }

  return (
    <div className="work">
      <header className="work-head">
        <h2>Work</h2>
        <p>
          {jobs.length} roles since {FIRST_YEAR}. One of them became the job.
        </p>
      </header>

      <div
        className="work-chart px-border"
        role="group"
        aria-label="Timeline of roles"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') step(-1)
          if (e.key === 'ArrowRight') step(1)
        }}
      >
        <div className="work-row work-years" aria-hidden="true">
          <span />
          <div className="work-track">
            {years.map((year, i) => (
              <span key={year} className="work-year" style={{ left: `${(i / years.length) * 100}%` }}>
                {year}
              </span>
            ))}
          </div>
        </div>

        {employers.map((org, row) => {
          const roles = inOrder.filter((job) => job.org === org)
          return (
            <div key={org} className="work-row">
              <span className="work-org">{org}</span>
              <div className="work-track" style={{ '--years': years.length } as CSSProperties}>
                {/* a second role at the same employer is joined to the first: the internship led to the job */}
                {roles.slice(1).map((job, i) => {
                  const from = span(roles[i])
                  const to = span(job)
                  return (
                    <span
                      key={job.id}
                      className="work-link"
                      style={{ left: `${from.left + from.width}%`, width: `${to.left - from.left - from.width}%` }}
                      aria-hidden="true"
                    >
                      offer
                    </span>
                  )
                })}
                {roles.map((job, i) => {
                  const { left, width } = span(job)
                  return (
                    <button
                      key={job.id}
                      type="button"
                      className={`work-bar work-bar-${row % 3}${job.end ? '' : ' is-current'}`}
                      style={{ left: `${left}%`, width: `${width}%`, '--n': row + i } as CSSProperties}
                      aria-pressed={job.id === selectedId}
                      aria-label={`${job.org}, ${job.role}, ${job.period}`}
                      onClick={() => setSelectedId(job.id)}
                    />
                  )
                })}
                <span className="work-now" style={{ left: `${((now + 1) / months) * 100}%` }} aria-hidden="true" />
              </div>
            </div>
          )
        })}
      </div>

      <article className="work-detail px-border" key={selected.id} aria-live="polite">
        <header>
          <h3>{selected.org}</h3>
          <span className="work-period">{selected.period}</span>
        </header>
        <p className="work-role">{selected.role}</p>
        <ul className="read bullets">
          {selected.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {selected.tools && (
          <ul className="chips" aria-label="Tools">
            {selected.tools.map((tool) => (
              <li key={tool} className="chip">
                {tool}
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  )
}

export function Community() {
  return <CardStack jobs={content.community} />
}

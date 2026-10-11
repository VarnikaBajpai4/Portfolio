import type { ReactNode } from 'react'
import { content } from '../content'
import type { Job } from '../content'
import { HOME_URL } from '../shell/links'

function external(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

/** The label of a link as a reader of a printed page needs it: the address, not the word "Email". */
function shown(href: string) {
  return href.replace(/^mailto:|^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="sv-section" aria-labelledby={`sv-${id}`}>
      <h2 id={`sv-${id}`}>{title}</h2>
      <div className="sv-body">{children}</div>
    </section>
  )
}

function Jobs({ jobs }: { jobs: Job[] }) {
  return (
    <>
      {jobs.map((job) => (
        <article key={job.id} className="sv-entry">
          <header className="sv-entry-head">
            <h3>
              {job.role} <span className="sv-org">· {job.org}</span>
            </h3>
            <span className="sv-when">{job.period}</span>
          </header>
          <ul>
            {job.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {job.tools && <p className="sv-stack">{job.tools.join(', ')}</p>}
        </article>
      ))}
    </>
  )
}

/** The plain page: the same facts as the desktop, as a document to read or print. */
export function StandardView() {
  const { identity, languages, tools, work, community, projects, achievements, links } = content
  const medal = achievements.find((a) => a.id === 'silver-medal')
  return (
    <div className="sv">
      <nav className="sv-bar" aria-label="Page">
        <a href={HOME_URL}>Back to desktop</a>
        <button type="button" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </nav>

      <div className="sv-page">
        <header className="sv-header">
          <h1>{identity.name}</h1>
          <p className="sv-role">{identity.role}</p>
          <p className="sv-summary">{identity.summary}</p>
          <ul className="sv-links" aria-label="Links">
            {links.map((link) => (
              <li key={link.label}>
                <span>{link.label}</span>
                <a href={link.href} {...external(link.href)}>
                  {shown(link.href)}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <main>
          <Section id="experience" title="Experience">
            <Jobs jobs={work} />
          </Section>

          <Section id="education" title="Education">
            <article className="sv-entry">
              <p>{identity.education}</p>
              {medal && (
                <ul>
                  <li>
                    {medal.title}. {medal.detail}
                  </li>
                  {medal.tally && (
                    <li>
                      {medal.tally.label}: {medal.tally.values[0]}.
                    </li>
                  )}
                </ul>
              )}
            </article>
          </Section>

          <Section id="projects" title="Projects">
            {projects.map((project) => (
              <article key={project.id} className="sv-entry">
                <header className="sv-entry-head">
                  <h3>{project.name}</h3>
                  <a className="sv-when" href={project.repo} {...external(project.repo)}>
                    {shown(project.repo)}
                  </a>
                </header>
                <p>{project.summary}</p>
                {(project.award || project.note) && (
                  <p>{[project.award, project.note].filter(Boolean).join(' ')}</p>
                )}
                <p className="sv-stack">{project.stack.join(', ')}</p>
              </article>
            ))}
          </Section>

          <Section id="skills" title="Skills">
            <dl className="sv-skills">
              <dt>Languages</dt>
              <dd>{languages.join(', ')}</dd>
              <dt>Tools and areas</dt>
              <dd>{tools.join(', ')}</dd>
            </dl>
          </Section>

          <Section id="achievements" title="Achievements">
            <ul>
              {achievements
                .filter((a) => a !== medal)
                .map((a) => (
                  <li key={a.id}>
                    <strong>{a.title}.</strong> {a.detail}
                  </li>
                ))}
            </ul>
          </Section>

          <Section id="community" title="Community">
            <Jobs jobs={community} />
          </Section>
        </main>
      </div>
    </div>
  )
}

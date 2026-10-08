import { Fragment } from 'react'
import { content } from '../content'
import type { Job } from '../content'
import { Portrait } from '../icons/Portrait'
import { HOME_URL } from '../shell/links'

function external(href: string) {
  return href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

function Jobs({ jobs }: { jobs: Job[] }) {
  return (
    <div className="sv-list">
      {jobs.map((job) => (
        <article key={job.id} className="sv-entry">
          <header className="sv-entry-head">
            <h3>{job.org}</h3>
            <span>{job.period}</span>
          </header>
          <p className="sv-role">{job.role}</p>
          <ul className="bullets">
            {job.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

export function StandardView() {
  const { identity, skills, tools, work, community, projects, achievements, readMe, links } = content
  return (
    <div className="sv checker">
      <div className="sv-page px-border px-shadow">
        <header className="sv-header">
          <div className="sv-face px-border">
            <Portrait size={96} detailed />
          </div>
          <div className="sv-id">
            <h1>{identity.name}</h1>
            <p className="sv-role">{identity.role}</p>
            <p>{identity.tagline}</p>
            <nav className="sv-links" aria-label="Links">
              {links.map((link) => (
                <a key={link.label} className="btn" href={link.href} {...external(link.href)}>
                  {link.label}
                </a>
              ))}
              <a className="btn sv-back" href={HOME_URL}>
                Back to desktop
              </a>
            </nav>
          </div>
        </header>

        <main>
          <section aria-labelledby="sv-about">
            <h2 id="sv-about">About</h2>
            {readMe.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>{identity.education}. Silver medal, rank 2 in the batch, CGPA 9.66.</p>
          </section>

          <section aria-labelledby="sv-skills">
            <h2 id="sv-skills">Skills</h2>
            <div className="bars sv-bars">
              {skills.map((skill) => (
                <Fragment key={skill.name}>
                  <span>{skill.name}</span>
                  <span className="bar">
                    <span className="bar-fill dither" style={{ width: `${skill.level * 10}%` }} />
                  </span>
                  <span>{skill.level}/10</span>
                </Fragment>
              ))}
            </div>
            <ul className="chips" aria-label="Tools">
              {tools.map((tool) => (
                <li key={tool} className="chip">
                  {tool}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sv-experience">
            <h2 id="sv-experience">Experience</h2>
            <Jobs jobs={work} />
          </section>

          <section aria-labelledby="sv-projects">
            <h2 id="sv-projects">Projects</h2>
            <div className="sv-list">
              {projects.map((project) => (
                <article key={project.id} className="sv-entry">
                  <header className="sv-entry-head">
                    <h3>{project.name}</h3>
                    <a href={project.repo} {...external(project.repo)}>
                      GitHub
                    </a>
                  </header>
                  <p>{project.summary}</p>
                  {project.award && <p className="sv-award">★ {project.award}</p>}
                  {project.note && <p>{project.note}</p>}
                  <ul className="chips" aria-label="Tech stack">
                    {project.stack.map((tech) => (
                      <li key={tech} className="chip">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="sv-achievements">
            <h2 id="sv-achievements">Achievements</h2>
            <ul className="bullets">
              {achievements.map((a) => (
                <li key={a.id}>
                  <strong>{a.title}.</strong> {a.detail}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sv-community">
            <h2 id="sv-community">Community</h2>
            <Jobs jobs={community} />
          </section>

          <section aria-labelledby="sv-contact">
            <h2 id="sv-contact">Contact</h2>
            <p>
              Email me at <a href={`mailto:${identity.email}`}>{identity.email}</a>.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

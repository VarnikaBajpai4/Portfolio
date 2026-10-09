import { content } from '../content'

export function Resume() {
  const { identity, languages, tools, work, projects, achievements, resumePdf } = content
  return (
    <article className="doc app-pad">
      <header className="doc-head">
        <div>
          <h2>{identity.name}</h2>
          <p>{identity.role}</p>
        </div>
        {resumePdf ? (
          <a className="btn" href={`${import.meta.env.BASE_URL}${resumePdf}`} download>
            Download PDF
          </a>
        ) : (
          <button type="button" className="btn" disabled>
            PDF coming soon
          </button>
        )}
      </header>

      <h3>Education</h3>
      <p className="read">{identity.education}. Silver medal, rank 2 in the batch, CGPA 9.66.</p>

      <h3>Skills</h3>
      <p className="read">{[...languages, ...tools].join(' · ')}</p>

      <h3>Experience</h3>
      {work.map((job) => (
        <section key={job.id} className="doc-entry">
          <p className="doc-line">
            <strong>
              {job.org}, {job.role}
            </strong>
            <span>{job.period}</span>
          </p>
          <ul className="read bullets">
            {job.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      ))}

      <h3>Projects</h3>
      {projects.map((project) => (
        <p key={project.id} className="read doc-entry">
          <strong>{project.name}.</strong> {project.summary}
        </p>
      ))}

      <h3>Achievements</h3>
      <ul className="read bullets">
        {achievements.map((a) => (
          <li key={a.id}>
            <strong>{a.title}.</strong> {a.detail}
          </li>
        ))}
      </ul>
    </article>
  )
}

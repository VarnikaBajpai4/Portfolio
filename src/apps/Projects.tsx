import { useState } from 'react'
import { content } from '../content'
import { Icon } from '../icons/Icon'
import { OmniCompiler } from './projects/OmniCompiler'
import { ProjectFolder } from './projects/ProjectFolder'

export function Projects({ param }: { param?: string }) {
  const [selected, setSelected] = useState<string | null>(param ?? null)
  const [seenParam, setSeenParam] = useState(param)
  if (param !== seenParam) {
    setSeenParam(param)
    setSelected(param ?? null)
  }

  const project = content.projects.find((p) => p.id === selected)

  if (!project) {
    return (
      <ul className="icon-grid app-pad">
        {content.projects.map((p) => (
          <li key={p.id}>
            <button type="button" className="icon-tile" onClick={() => setSelected(p.id)}>
              <ProjectFolder id={p.id} />
              <span className="chip">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  if (project.id === 'omnicompiler') return <OmniCompiler project={project} onBack={() => setSelected(null)} />

  return (
    <article className="info app-pad">
      <header className="info-head">
        <Icon name="folder" size={40} />
        <div>
          <h2>{project.name}</h2>
          <p className="info-kind">Get Info</p>
        </div>
      </header>
      <p className="read">{project.summary}</p>
      {project.award && <p className="read info-award">★ {project.award}</p>}
      {project.note && <p className="read">{project.note}</p>}
      <ul className="chips" aria-label="Tech stack">
        {project.stack.map((tech) => (
          <li key={tech} className="chip">
            {tech}
          </li>
        ))}
      </ul>
      <div className="info-actions">
        <a className="btn" href={project.repo} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
        <button type="button" className="btn" onClick={() => setSelected(null)}>
          Back to Projects
        </button>
      </div>
    </article>
  )
}

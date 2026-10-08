import { Fragment } from 'react'
import { content } from '../content'
import { Portrait } from '../icons/Portrait'

const BAR_FILLS = ['var(--c4)', 'var(--c3)', 'var(--c2)']

export function About() {
  const { identity, skills, tools } = content
  return (
    <div className="about app-pad">
      <div className="about-face px-border">
        <Portrait size={120} detailed />
      </div>
      <div className="about-info">
        <h2>{identity.name}</h2>
        <p>{identity.role}</p>
        <p className="read">{identity.tagline}</p>
        <div className="bars">
          {skills.map((skill, i) => (
            <Fragment key={skill.name}>
              <span>{skill.name}</span>
              <span className="bar">
                <span
                  className="bar-fill dither"
                  style={{ width: `${skill.level * 10}%`, backgroundColor: BAR_FILLS[i % BAR_FILLS.length] }}
                />
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
      </div>
    </div>
  )
}

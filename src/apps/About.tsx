import { content } from '../content'
import { Portrait } from '../icons/Portrait'

function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="tags">
      <h3>{label}</h3>
      <ul className="chips">
        {items.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function About() {
  const { identity, languages, tools } = content
  return (
    <div className="about app-pad">
      <div className="about-face px-border">
        <Portrait size={120} detailed />
      </div>
      <div className="about-info">
        <h2>{identity.name}</h2>
        <p>{identity.role}</p>
        <p className="read about-headline">{identity.headline}</p>
        <p className="read">{identity.subline}</p>
        <Tags label="Languages" items={languages} />
        <Tags label="Works with" items={tools} />
      </div>
    </div>
  )
}

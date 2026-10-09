import { content } from '../content'
import photo from '../assets/varnika.jpg'

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
  const { identity, languages, tools, readMe } = content
  return (
    <div className="about app-pad">
      <img className="about-photo px-border" src={photo} alt="Varnika Bajpai" width={132} height={132} />
      <div className="about-info">
        <h2>{identity.name}</h2>
        <p>{identity.role}</p>
        <p className="read about-headline">{identity.headline}</p>
        <p className="read">{identity.subline}</p>
        <Tags label="Languages" items={languages} />
        <Tags label="Works with" items={tools} />
        <details className="about-more">
          <summary>More about me</summary>
          {readMe.map((paragraph) => (
            <p key={paragraph} className="read">
              {paragraph}
            </p>
          ))}
        </details>
      </div>
    </div>
  )
}

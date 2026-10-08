import { content } from '../content'

export function ReadMe() {
  return (
    <article className="doc app-pad">
      <h2>Read Me</h2>
      {content.readMe.map((paragraph) => (
        <p key={paragraph} className="read readme-p">
          {paragraph}
        </p>
      ))}
    </article>
  )
}

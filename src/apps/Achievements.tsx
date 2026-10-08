import { useState } from 'react'
import { content } from '../content'
import { Icon } from '../icons/Icon'

export function Achievements() {
  const items = content.achievements
  const [index, setIndex] = useState(0)
  const item = items[index]
  const go = (step: number) => setIndex((i) => (i + step + items.length) % items.length)

  return (
    <div className="stack app-pad">
      <article className="card scrap px-border px-shadow" aria-live="polite">
        <Icon name="star" size={48} fill="var(--c3)" />
        <h2>{item.title}</h2>
        <p className="read">{item.detail}</p>
      </article>
      <div className="pager">
        <button type="button" className="btn" onClick={() => go(-1)}>
          Previous
        </button>
        <span>
          {index + 1} / {items.length}
        </span>
        <button type="button" className="btn" onClick={() => go(1)}>
          Next
        </button>
      </div>
    </div>
  )
}

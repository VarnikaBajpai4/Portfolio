import { useState } from 'react'
import type { CSSProperties } from 'react'
import { content } from '../content'
import './books.css'

/** heights of the spines in px, so that the shelf is not a flat row */
const HEIGHTS = [150, 136, 162, 128, 156, 140, 166, 132]
const TONES = ['var(--c4)', 'var(--c2)', 'var(--paper)', 'var(--c1)']

/** A shelf of the books I tell people to read. A click pulls one out. */
export function Books() {
  const books = content.books
  const [index, setIndex] = useState<number | null>(null)
  const book = index === null ? null : books[index]

  return (
    <div className="books">
      <ul className="books-shelf" aria-label="Shelf">
        {books.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              className="books-spine"
              aria-pressed={i === index}
              aria-label={`${item.title}, ${item.author}`}
              style={{ '--h': `${HEIGHTS[i % HEIGHTS.length]}px`, '--tone': TONES[i % TONES.length] } as CSSProperties}
              onClick={() => setIndex(i === index ? null : i)}
            >
              <span>{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="books-card" aria-live="polite">
        {book ? (
          <>
            <strong>{book.title}</strong>
            <span>{book.author}</span>
          </>
        ) : (
          <span>Books I tell people to read. Pull one out.</span>
        )}
      </p>
    </div>
  )
}

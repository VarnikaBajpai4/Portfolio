import { useState } from 'react'
import { content } from '../content'

export function NotePad() {
  const [page, setPage] = useState(0)
  const pages = content.notes
  return (
    <div className="notepad">
      <p className="notepad-text" aria-live="polite">
        {pages[page]}
      </p>
      <button
        type="button"
        className="notepad-corner"
        aria-label="Next page"
        onClick={() => setPage((p) => (p + 1) % pages.length)}
      />
      <span className="notepad-page">{page + 1}</span>
    </div>
  )
}

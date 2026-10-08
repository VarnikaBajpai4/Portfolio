import { useEffect } from 'react'
import { Portrait } from '../icons/Portrait'

const TILES = ['Py', 'C++', 'ML', 'JS', 'Java']
const DURATION_MS = 2000

export function Intro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, DURATION_MS)
    window.addEventListener('keydown', onDone)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onDone)
    }
  }, [onDone])

  return (
    <div className="overlay checker intro" onPointerDown={onDone}>
      <div className="overlay-card px-border px-shadow">
        <Portrait size={144} detailed />
        <p className="overlay-text">Welcome to Varnika's profile.</p>
      </div>
      <ul className="intro-tiles" aria-hidden="true">
        {TILES.map((tile, i) => (
          <li key={tile} className="intro-tile px-border" style={{ animationDelay: `${(i + 1) * 300}ms` }}>
            {tile}
          </li>
        ))}
      </ul>
      <button type="button" className="sr-only" onClick={onDone}>
        Skip intro
      </button>
    </div>
  )
}

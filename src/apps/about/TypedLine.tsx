import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../../motion'

const TYPE_MS = 55
const ERASE_MS = 26
const HOLD_MS = 1500

/** Types each phrase, holds it, erases it, and moves to the next. */
export function TypedLine({ phrases }: { phrases: string[] }) {
  const [still] = useState(prefersReducedMotion)
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(0)
  const [erasing, setErasing] = useState(false)
  const phrase = phrases[index]

  useEffect(() => {
    if (still) return
    let delay = erasing ? ERASE_MS : TYPE_MS
    let next = () => setLength((n) => n + (erasing ? -1 : 1))
    if (!erasing && length === phrase.length) {
      delay = HOLD_MS
      next = () => setErasing(true)
    } else if (erasing && length === 0) {
      delay = 200
      next = () => {
        setErasing(false)
        setIndex((i) => (i + 1) % phrases.length)
      }
    }
    const timer = window.setTimeout(next, delay)
    return () => window.clearTimeout(timer)
  }, [still, erasing, length, phrase, phrases.length])

  if (still) return <span>{phrases.join(' ')}</span>

  return (
    <>
      <span className="sr-only">{phrases.join(' ')}</span>
      <span className="typed" aria-hidden="true">
        {phrase.slice(0, length)}
        <span className="typed-caret" />
      </span>
    </>
  )
}

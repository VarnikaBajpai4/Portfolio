import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** Becomes true the first time the element scrolls into view, and stays true. */
export function useInView(ref: RefObject<Element | null>): boolean {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true)
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, seen])
  return seen
}

import { useEffect, useState } from 'react'
import type { Stat } from '../../content'
import { prefersReducedMotion } from '../../motion'

const DURATION_MS = 1200

/** Runs the number up from zero once `active` is true. */
export function CountUp({ stat, active }: { stat: Stat; active: boolean }) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? stat.value : 0))

  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    let frame = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION_MS, 1)
      setShown(stat.value * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [active, stat.value])

  return (
    <span className="stat-number">
      {stat.prefix}
      {shown.toFixed(stat.decimals ?? 0)}
      {stat.suffix}
    </span>
  )
}

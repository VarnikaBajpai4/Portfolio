import { prefersReducedMotion } from '../motion'

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

const DURATION_MS = 280

/** The transform that makes `el` sit exactly on `box`. */
function onto(el: HTMLElement, box: Box): string {
  const own = el.getBoundingClientRect()
  const sx = Math.max(box.width / own.width, 0.02)
  const sy = Math.max(box.height / own.height, 0.02)
  return `translate(${box.left - own.left}px, ${box.top - own.top}px) scale(${sx}, ${sy})`
}

/** Grow a window out of the icon it belongs to. */
export function popIn(el: HTMLElement, from: Box): void {
  if (prefersReducedMotion()) return
  el.animate(
    [
      { transform: onto(el, from), opacity: 0.2 },
      { transform: 'none', opacity: 1 },
    ],
    { duration: DURATION_MS, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' },
  )
}

/** Shrink a window back into its icon, then call `onDone`. */
export function popOut(el: HTMLElement, to: Box, onDone: () => void): void {
  if (prefersReducedMotion()) {
    onDone()
    return
  }
  const animation = el.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: onto(el, to), opacity: 0.2 },
    ],
    { duration: DURATION_MS, easing: 'cubic-bezier(0.6, 0, 0.9, 0.4)', fill: 'forwards' },
  )
  animation.onfinish = animation.oncancel = onDone
}

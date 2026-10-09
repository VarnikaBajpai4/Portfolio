import { prefersReducedMotion } from '../motion'

export interface Box {
  left: number
  top: number
  width: number
  height: number
}

const OUTLINES = 5
const DURATION_MS = 240
const STAGGER_MS = 28

/** The classic growing-outline effect between two viewport rectangles. */
export function playZoom(from: Box, to: Box, onDone?: () => void): void {
  if (prefersReducedMotion()) {
    onDone?.()
    return
  }
  const frame = (box: Box) => ({
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  })
  for (let i = 0; i < OUTLINES; i++) {
    const outline = document.createElement('div')
    outline.className = 'zoom-outline'
    Object.assign(outline.style, frame(from))
    document.body.append(outline)
    const animation = outline.animate([frame(from), frame(to)], {
      duration: DURATION_MS,
      delay: i * STAGGER_MS,
      easing: 'steps(8, end)',
      fill: 'both',
    })
    animation.onfinish = animation.oncancel = () => {
      outline.remove()
      if (i === OUTLINES - 1) onDone?.()
    }
  }
}

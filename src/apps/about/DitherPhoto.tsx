import { useEffect, useRef, useState } from 'react'
import { atkinson } from '../../dither'
import { prefersReducedMotion } from '../../motion'

const GRID = 88
const HOLD_MS = 700
const FADE_MS = 900

/** A photo that first appears as a 1-bit dot picture and then resolves into colour. Click to replay. */
export function DitherPhoto({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<'dots' | 'fade' | 'done'>(() => (prefersReducedMotion() ? 'done' : 'dots'))

  useEffect(() => {
    if (prefersReducedMotion()) return
    const timers: number[] = []
    const image = new Image()
    image.onload = () => {
      const context = canvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, GRID, GRID)
      const pixels = context.getImageData(0, 0, GRID, GRID)
      atkinson(pixels)
      context.putImageData(pixels, 0, 0)
      setPhase('dots')
      timers.push(window.setTimeout(() => setPhase('fade'), HOLD_MS))
      timers.push(window.setTimeout(() => setPhase('done'), HOLD_MS + FADE_MS))
    }
    image.src = src
    return () => {
      image.onload = null
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [src, run])

  return (
    <span className="dither-photo px-border" onClick={() => setRun((n) => n + 1)} title="Click to develop it again">
      <img src={src} alt={alt} />
      <canvas ref={canvasRef} className={`dither-canvas is-${phase}`} width={GRID} height={GRID} aria-hidden="true" />
    </span>
  )
}

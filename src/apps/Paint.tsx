import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { content } from '../content'
import { atkinson } from '../dither'
import { PixelGrid } from '../icons/PixelGrid'
import { prefersReducedMotion } from '../motion'
import './paint.css'

const FILES = import.meta.glob<string>('../assets/paintings/*.jpg', { eager: true, import: 'default' })
const file = (id: string, thumb = false) => FILES[`../assets/paintings/${id}${thumb ? '.thumb' : ''}.jpg`]

type Tool = 'brush' | 'eraser' | 'zoom'

// '#' ink, 'a' accent, 'o' paper
const GLYPHS: Record<Tool | 'bucket', string[]> = {
  brush: [
    '.........##.',
    '........###.',
    '.......###..',
    '......###...',
    '.....###....',
    '....aa#.....',
    '...aaaa.....',
    '..#aaa......',
    '.##aa.......',
    '.###........',
    '##..........',
    '............',
  ],
  eraser: [
    '............',
    '............',
    '....######..',
    '...#oooo##..',
    '..#oooo#a#..',
    '.#oooo#aa#..',
    '.######aa#..',
    '.#aaaa#a#...',
    '.#aaaa##....',
    '.######.....',
    '............',
    '............',
  ],
  bucket: [
    '............',
    '....##......',
    '...#..#.....',
    '...#.###....',
    '..####oo#...',
    '.#o#oooo#a..',
    '.#oo#ooo#a..',
    '..#oooo#.a..',
    '...#oo#..a..',
    '....##...a..',
    '............',
    '............',
  ],
  zoom: [
    '............',
    '...####.....',
    '..#oooo#....',
    '.#oooooo#...',
    '.#oooooo#...',
    '.#oooooo#...',
    '.#oooooo#...',
    '..#oooo#....',
    '...#####....',
    '.......##...',
    '........##..',
    '.........##.',
  ],
}
const LEGEND = { '#': 'var(--ink)', a: 'var(--c4)', o: 'var(--paper)' }

const HINTS: Record<Tool, string> = {
  brush: 'Brush: drag on the picture to paint the colour in.',
  eraser: 'Eraser: drag to rub the colour out. Double-click the tool to clear it all.',
  zoom: 'FatBits: move over the picture to look closely.',
}

/** the longest side of the dot picture, in dots */
const DOTS = 230
/** brush widths, in dots */
const SIZES = [8, 16, 30]
const AUTO_MS = 1100
const POUR_MS = 650

/**
 * My paintings in a paint program, as MacPaint was. Each one starts as a black and white dot picture.
 * The bucket pours the colour in, the brush paints it in by hand, and the eraser takes it out again.
 */
export function Paint() {
  const works = content.paintings
  const [index, setIndex] = useState(0)
  const [tool, setTool] = useState<Tool>('brush')
  const [size, setSize] = useState(1)
  const [state, setState] = useState<'dots' | 'mixed' | 'colour'>('dots')
  const [origin, setOrigin] = useState('50% 50%')
  const work = works[index]

  const canvasRef = useRef<HTMLCanvasElement>(null)
  /** the full dot picture, kept so that the eraser can put dots back */
  const dotsRef = useRef<HTMLCanvasElement | null>(null)
  const autoTimer = useRef(0)
  const frame = useRef(0)
  const last = useRef<{ x: number; y: number } | null>(null)

  const stopMotion = () => {
    window.clearTimeout(autoTimer.current)
    cancelAnimationFrame(frame.current)
  }

  /** The colour runs down the picture from the top. */
  const pour = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    stopMotion()
    if (prefersReducedMotion()) {
      context.clearRect(0, 0, canvas.width, canvas.height)
      setState('colour')
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const done = Math.min((now - start) / POUR_MS, 1)
      context.clearRect(0, 0, canvas.width, Math.ceil(canvas.height * done))
      if (done < 1) frame.current = requestAnimationFrame(step)
      else setState('colour')
    }
    frame.current = requestAnimationFrame(step)
  }
  const pourRef = useRef(pour)
  useEffect(() => {
    pourRef.current = pour
  })

  const allDots = () => {
    const canvas = canvasRef.current
    const dots = dotsRef.current
    if (!canvas || !dots) return
    stopMotion()
    canvas.getContext('2d')?.drawImage(dots, 0, 0)
    setState('dots')
  }

  // a new picture: make its dot picture, show it, and then let the colour in
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scale = DOTS / Math.max(work.w, work.h)
    const width = Math.round(work.w * scale)
    const height = Math.round(work.h * scale)
    const image = new Image()
    image.onload = () => {
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(image, 0, 0, width, height)
      const pixels = context.getImageData(0, 0, width, height)
      atkinson(pixels)
      context.putImageData(pixels, 0, 0)
      const copy = document.createElement('canvas')
      copy.width = width
      copy.height = height
      copy.getContext('2d')?.drawImage(canvas, 0, 0)
      dotsRef.current = copy
      setState('dots')
      if (prefersReducedMotion()) pourRef.current()
      else autoTimer.current = window.setTimeout(() => pourRef.current(), AUTO_MS)
    }
    image.src = file(work.id)
    return () => {
      image.onload = null
      window.clearTimeout(autoTimer.current)
      cancelAnimationFrame(frame.current)
    }
  }, [work])

  /** One square of the brush or the eraser at a point of the screen. */
  const stamp = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const dots = dotsRef.current
    if (!canvas || !context || !dots) return
    const box = canvas.getBoundingClientRect()
    const width = SIZES[size]
    const x = Math.round(((clientX - box.left) / box.width) * canvas.width - width / 2)
    const y = Math.round(((clientY - box.top) / box.height) * canvas.height - width / 2)
    if (tool === 'brush') context.clearRect(x, y, width, width)
    else context.drawImage(dots, x, y, width, width, x, y, width, width)
  }

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'zoom' || e.button !== 0) return
    stopMotion()
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = { x: e.clientX, y: e.clientY }
    stamp(e.clientX, e.clientY)
    setState('mixed')
  }

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (tool === 'zoom') {
      // measure against the place of the picture before it is enlarged, so that the view does not drift
      const art = e.currentTarget.parentElement!
      const stage = art.parentElement!.getBoundingClientRect()
      const x = ((e.clientX - stage.left - art.offsetLeft) / art.offsetWidth) * 100
      const y = ((e.clientY - stage.top - art.offsetTop) / art.offsetHeight) * 100
      const within = (value: number) => Math.min(Math.max(value, 0), 100).toFixed(1)
      setOrigin(`${within(x)}% ${within(y)}%`)
      return
    }
    const from = last.current
    if (!from) return
    // fill the path between two events, so that a fast stroke has no holes
    const steps = Math.max(1, Math.ceil(Math.hypot(e.clientX - from.x, e.clientY - from.y) / 4))
    for (let i = 1; i <= steps; i++) {
      stamp(from.x + ((e.clientX - from.x) * i) / steps, from.y + ((e.clientY - from.y) * i) / steps)
    }
    last.current = { x: e.clientX, y: e.clientY }
  }

  const show = (next: number) => setIndex((next + works.length) % works.length)

  return (
    <div
      className="paint"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') show(index - 1)
        if (e.key === 'ArrowRight') show(index + 1)
      }}
    >
      <div className="paint-tools" role="toolbar" aria-label="Tools">
        {(['brush', 'eraser', 'zoom'] as const).map((name) => (
          <button
            key={name}
            type="button"
            className="paint-tool"
            aria-pressed={tool === name}
            aria-label={name === 'zoom' ? 'FatBits' : name === 'brush' ? 'Brush' : 'Eraser'}
            title={HINTS[name]}
            onClick={() => setTool(name)}
            onDoubleClick={name === 'eraser' ? allDots : undefined}
          >
            <PixelGrid rows={GLYPHS[name]} legend={LEGEND} size={30} />
          </button>
        ))}
        <button type="button" className="paint-tool" aria-label="Paint bucket" title="Paint bucket: pour all the colour in." onClick={pour}>
          <PixelGrid rows={GLYPHS.bucket} legend={LEGEND} size={30} />
        </button>
        <div className="paint-step">
          <button type="button" aria-label="Previous picture" onClick={() => show(index - 1)}>
            ◀
          </button>
          <button type="button" aria-label="Next picture" onClick={() => show(index + 1)}>
            ▶
          </button>
        </div>
        <p className="paint-count">
          {index + 1} / {works.length}
        </p>
      </div>

      <div className="paint-sizes" role="group" aria-label="Brush size">
        {SIZES.map((width, i) => (
          <button
            key={width}
            type="button"
            aria-pressed={size === i}
            aria-label={['Small', 'Medium', 'Large'][i]}
            onClick={() => setSize(i)}
          >
            <span style={{ height: 2 + i * 3 }} />
          </button>
        ))}
      </div>

      <div className={`paint-stage tool-${tool}`}>
        <figure
          className="paint-art"
          data-state={state}
          style={{ '--ratio': work.w / work.h, transformOrigin: origin } as CSSProperties}
        >
          <img key={work.id} src={file(work.id)} alt={`${work.title}, ${work.medium}, by Varnika`} draggable={false} />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (last.current = null)}
            onPointerCancel={() => (last.current = null)}
          />
        </figure>
      </div>

      <p className="paint-info" aria-live="polite">
        <strong>{work.title}</strong>
        <span>{work.medium}</span>
        <span className="paint-hint">{HINTS[tool]}</span>
      </p>

      {/* where MacPaint had its row of patterns: one small square for each picture */}
      <ul className="paint-strip" aria-label="Pictures">
        {works.map((item, i) => (
          <li key={item.id}>
            <button type="button" aria-label={item.title} aria-pressed={i === index} onClick={() => show(i)}>
              <img src={file(item.id, true)} alt="" loading="lazy" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { Project } from '../../content'
import { useWindowControls } from '../../wm/store'
import { useInView } from '../about/useInView'
import './showcase.css'

/** Below this width there is no room for a project page. */
const MIN_WIDTH = 700

/** A section that eases in the first time it scrolls into view. */
export function Reveal({
  className = '',
  labelledBy,
  children,
}: {
  className?: string
  labelledBy?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref)
  return (
    <section ref={ref} className={`show-reveal ${className}${seen ? ' is-in' : ''}`} aria-labelledby={labelledBy}>
      {children}
    </section>
  )
}

export interface ShowcaseCopy {
  tagline: string
  /** a rubber-stamp note beside the title */
  stamp?: string
  overview: string[]
  /** small print under the overview */
  meta: string
  /** the tech stack, top layer first */
  stack: { layer: string; parts: string[] }[]
  steps: { name: string; text: string }[]
  demoTitle: string
  demoHint: string
}

interface Props {
  project: Project
  copy: ShowcaseCopy
  /** a class for per-project colours and patterns */
  theme: string
  onBack: () => void
  /** the project's own demo */
  children: ReactNode
}

/** The frame every project page shares: title band, what it is, tech stack, how it works, then a demo. */
export function Showcase({ project, copy, theme, onBack, children }: Props) {
  const controls = useWindowControls()
  const rootRef = useRef<HTMLElement>(null)
  const grew = useRef(false)
  const wasWide = useRef(false)

  // The page needs room: make the window large while it is open, and put it back after.
  useEffect(() => {
    if (controls && !controls.zoomed && !grew.current) {
      grew.current = true
      controls.toggleZoom()
    }
    // only on the way in
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If the window is made small again, there is no room for this page: return to the folder.
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || !controls) return
    const observer = new ResizeObserver(() => {
      if (el.clientWidth >= MIN_WIDTH) wasWide.current = true
      else if (wasWide.current) onBack()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [controls, onBack])

  const back = () => {
    if (grew.current && controls?.zoomed) controls.toggleZoom()
    onBack()
  }

  return (
    <article className={`show ${theme}`} ref={rootRef}>
      <header className="show-head">
        <div>
          <h2>{project.name}</h2>
          <p className="show-tagline">{copy.tagline}</p>
        </div>
        {copy.stamp && <p className="show-stamp">{copy.stamp}</p>}
        <div className="show-actions">
          <a className="btn" href={project.repo} target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
          <button type="button" className="btn" onClick={back}>
            Back to Projects
          </button>
        </div>
      </header>

      <div className="show-intro">
        <Reveal className="show-about" labelledBy="show-about">
          <h3 id="show-about">What it is</h3>
          {copy.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="show-meta">{copy.meta}</p>
        </Reveal>

        <Reveal labelledBy="show-stack">
          <h3 id="show-stack">Tech stack</h3>
          <ol className="show-stack">
            {copy.stack.map((item, i) => (
              <li key={item.layer} style={{ '--n': i, '--count': copy.stack.length } as CSSProperties}>
                <span className="show-layer">{item.layer}</span>
                <ul>
                  {item.parts.map((part) => (
                    <li key={part}>{part}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      <Reveal labelledBy="show-how">
        <h3 id="show-how">How it works</h3>
        <ol className="show-steps">
          {copy.steps.map((item, i) => (
            <li key={item.name} style={{ '--n': i } as CSSProperties}>
              <span className="show-step-n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <strong>{item.name}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal labelledBy="show-demo">
        <h3 id="show-demo">{copy.demoTitle}</h3>
        <p className="show-hint">{copy.demoHint}</p>
        {children}
      </Reveal>
    </article>
  )
}

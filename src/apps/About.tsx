import { useLayoutEffect, useRef, useState } from 'react'
import photo from '../assets/varnika.jpg'
import { content } from '../content'
import { useWindowControls } from '../wm/store'
import './about/about.css'
import { DitherPhoto } from './about/DitherPhoto'
import { Story } from './about/Story'
import { TypedLine } from './about/TypedLine'

/** At this width there is room for the story, so it shows by itself. */
const STORY_WIDTH = 720

function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="tags">
      <h3>{label}</h3>
      <ul className="chips">
        {items.map((item) => (
          <li key={item} className="chip">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function About() {
  const { identity, languages, tools } = content
  const controls = useWindowControls()
  const rootRef = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(false)
  const [opened, setOpened] = useState(false)
  const story = wide || opened

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const observer = new ResizeObserver(() => setWide(el.clientWidth >= STORY_WIDTH))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // In a window, the story opens by making the window large. On a phone it unfolds in place.
  const openStory = () => (controls && !controls.zoomed ? controls.toggleZoom() : setOpened(true))

  return (
    <div className={`about${story ? ' is-story' : ''}`} ref={rootRef}>
      <header className="about-hero">
        <div className="about-side">
          <DitherPhoto src={photo} alt={identity.name} />
          {!story && (
            <button type="button" className="btn about-open" onClick={openStory}>
              Open my story
            </button>
          )}
        </div>
        <div className="about-info">
          <h2>{identity.name}</h2>
          <p className="about-role">{identity.role}</p>
          <p className="about-typed">
            <TypedLine phrases={identity.identities} />
          </p>
          <p className="about-motto">{identity.motto}</p>
          <p className="read">{identity.subline}</p>
          {!story && (
            <>
              <Tags label="Languages" items={languages} />
              <Tags label="Works with" items={tools} />
            </>
          )}
        </div>
      </header>
      {story && <Story />}
    </div>
  )
}

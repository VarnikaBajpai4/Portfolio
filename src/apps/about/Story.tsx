import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { content } from '../../content'
import type { HobbyIcon } from '../../content'
import { Sticker } from '../../icons/Sticker'
import { useInView } from './useInView'

/** A panel that plays its entrance when it first scrolls into view. */
function Tile({ className, children }: { className: string; children: (seen: boolean) => ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref)
  return (
    <section ref={ref} className={`tile px-border ${className}${seen ? ' is-in' : ''}`}>
      {children(seen)}
    </section>
  )
}

/** The family as a commit graph, newest on top, with one line about my mother as the commit note. */
function Family() {
  const members = [...content.family].reverse()
  return (
    <Tile className="tile-family">
      {() => (
        <>
          <h3>
            <span aria-hidden="true">$ git log --graph </span>family-of-engineers
          </h3>
          <ol className="graph">
            {members.map((member, i) => (
              <li
                key={member.who}
                className={member.branch ? 'graph-branch' : undefined}
                style={{ '--order': members.length - i } as CSSProperties}
              >
                <span className="graph-who">
                  {member.who}
                  {member.tag && <span className="graph-tag">{member.tag}</span>}
                </span>
                <span className="graph-note">{member.note}</span>
              </li>
            ))}
          </ol>
          <figure className="graph-quote">
            <figcaption>{content.quote.about}</figcaption>
            <blockquote>{content.quote.text}</blockquote>
          </figure>
        </>
      )}
    </Tile>
  )
}

/** Skills as keys on a keyboard, after the old Key Caps desk accessory. One row per group. */
function KeyCaps() {
  const { languages, tools } = content
  const half = Math.ceil(tools.length / 2)
  const rows = [languages, tools.slice(0, half), tools.slice(half)]
  let order = 0
  return (
    <Tile className="tile-keys">
      {() => (
        <>
          <h3>Key Caps</h3>
          <div className="keys">
            {rows.map((row, r) => (
              <ul key={row[0]} className={`keys-row keys-row-${r}`} aria-label={r === 0 ? 'Languages' : 'Works with'}>
                {row.map((label) => (
                  <li key={label} className="key" style={{ '--order': order++ } as CSSProperties}>
                    {label}
                  </li>
                ))}
              </ul>
            ))}
            <div className="key key-space" style={{ '--order': order } as CSSProperties} aria-hidden="true" />
          </div>
        </>
      )}
    </Tile>
  )
}

const STICKER_FILLS = ['var(--c4)', 'var(--c2)', 'var(--c3)', 'var(--c1)']

function Hobby({ icon, label, index }: { icon: HobbyIcon; label: string; index: number }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drops, setDrops] = useState(0)
  const grab = useRef<{ x: number; y: number } | null>(null)
  const tilt = ((index * 37) % 17) - 8

  const onDown = (e: PointerEvent<HTMLLIElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    grab.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  const onMove = (e: PointerEvent<HTMLLIElement>) => {
    if (grab.current) setOffset({ x: e.clientX - grab.current.x, y: e.clientY - grab.current.y })
  }
  const onUp = () => {
    if (!grab.current) return
    grab.current = null
    setDrops((n) => n + 1)
  }

  return (
    <li
      className="hobby"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(${tilt}deg)` }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* a new key restarts the wobble each time it is dropped */}
      <span key={drops} className={`hobby-art px-border${drops ? ' is-dropped' : ''}`}>
        <Sticker name={icon} size={48} fill={STICKER_FILLS[index % STICKER_FILLS.length]} />
      </span>
      <span className="hobby-label">{label}</span>
    </li>
  )
}

function Hobbies() {
  return (
    <Tile className="tile-hobbies">
      {() => (
        <>
          <h3>Away from the keyboard</h3>
          <ul className="hobbies">
            {content.hobbies.map((hobby, i) => (
              <Hobby key={hobby.icon} icon={hobby.icon} label={hobby.label} index={i} />
            ))}
          </ul>
        </>
      )}
    </Tile>
  )
}

export function Story() {
  return (
    <div className="story">
      <div className="story-col">
        <Family />
        <Tile className="tile-doc">
          {() => (
            <>
              <div className="doc-ruler" aria-hidden="true" />
              <h3>How I got here</h3>
              {content.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </>
          )}
        </Tile>
      </div>
      <div className="story-col">
        <KeyCaps />
        <Hobbies />
      </div>
    </div>
  )
}

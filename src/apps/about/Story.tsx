import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { content } from '../../content'
import type { HobbyIcon } from '../../content'
import { Sticker } from '../../icons/Sticker'
import { CountUp } from './CountUp'
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

/** Where it comes from: the family as a small commit line, and one line about my mother. */
function Roots() {
  return (
    <Tile className="tile-roots">
      {() => (
        <>
          <h3>A family of engineers</h3>
          <ol className="lineage">
            {content.family.map((member, i) => (
              <li
                key={member.who}
                className={member.branch ? 'lineage-branch' : undefined}
                style={{ '--order': i } as CSSProperties}
              >
                <span className="lineage-who">{member.who}</span>
                {member.tag && <span className="lineage-tag">{member.tag}</span>}
                <span className="lineage-note">{member.note}</span>
              </li>
            ))}
          </ol>
          <figure className="roots-quote">
            <blockquote>{content.quote.text}</blockquote>
            <figcaption>{content.quote.about}</figcaption>
          </figure>
        </>
      )}
    </Tile>
  )
}

function Stats() {
  return (
    <>
      {content.stats.map((stat, i) => (
        <Tile key={stat.label} className={`tile-stat tile-stat-${i}`}>
          {(seen) => (
            <>
              {i === 1 && (
                <span className="stat-medal" aria-hidden="true">
                  <Sticker name="medal" size={48} fill="var(--c2)" />
                </span>
              )}
              <CountUp stat={stat} active={seen} />
              <span className="stat-label">{stat.label}</span>
            </>
          )}
        </Tile>
      ))}
    </>
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
      <Roots />
      <Stats />
      <KeyCaps />
      <Tile className="tile-text">
        {() => (
          <>
            <h3>How I got here</h3>
            {content.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </>
        )}
      </Tile>
      <Hobbies />
      <Tile className="tile-homage">
        {() => (
          <>
            <Sticker name="mac" size={64} fill="var(--c2)" />
            <p>{content.readMe[content.readMe.length - 1]}</p>
          </>
        )}
      </Tile>
    </div>
  )
}

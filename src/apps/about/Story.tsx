import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'
import { content } from '../../content'
import type { HobbyIcon } from '../../content'
import { prefersReducedMotion } from '../../motion'
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

/** Types a line out, one letter at a time. Give it a new `key` to start again. */
function Typed({ text }: { text: string }) {
  const [length, setLength] = useState(() => (prefersReducedMotion() ? text.length : 0))
  useEffect(() => {
    if (length >= text.length) return
    const timer = window.setTimeout(() => setLength((n) => n + 1), 16)
    return () => window.clearTimeout(timer)
  }, [length, text.length])
  return <>{text.slice(0, length)}</>
}

type Key = { skill: string } | { blank: string; wide?: boolean }

/**
 * Skills as a keyboard, after the old Key Caps desk accessory: press a key and the
 * strip above the keys types out what I use it for.
 */
function KeyCaps() {
  const { languages, tools, skillNotes } = content
  const [active, setActive] = useState<string | null>(null)
  const half = Math.ceil(tools.length / 2)
  const skills = (list: string[]): Key[] => list.map((skill) => ({ skill }))
  const rows: Key[][] = [
    [{ blank: 'esc' }, ...skills(languages), { blank: 'del' }],
    [{ blank: 'tab', wide: true }, ...skills(tools.slice(0, half))],
    [{ blank: 'caps', wide: true }, ...skills(tools.slice(half)), { blank: 'return', wide: true }],
  ]
  const line = active ? `${active}: ${skillNotes[active]}` : 'Press a key.'
  let order = 0

  return (
    <Tile className="tile-keys">
      {() => (
        <>
          <h3>Key Caps</h3>
          <div className="keyboard px-border">
            <output className="keys-display px-border">
              <Typed key={line} text={line} />
              <span className="typed-caret" aria-hidden="true" />
            </output>
            {rows.map((row, r) => (
              <div key={r} className="keys-row">
                {row.map((key) =>
                  'skill' in key ? (
                    <button
                      key={key.skill}
                      type="button"
                      className={`key${r === 0 ? ' key-language' : ''}`}
                      style={{ '--order': order++ } as CSSProperties}
                      aria-pressed={active === key.skill}
                      onClick={() => setActive(key.skill)}
                      onPointerEnter={() => setActive(key.skill)}
                      onFocus={() => setActive(key.skill)}
                    >
                      {key.skill}
                    </button>
                  ) : (
                    <span
                      key={key.blank}
                      className={`key key-blank${key.wide ? ' key-wide' : ''}`}
                      style={{ '--order': order++ } as CSSProperties}
                      aria-hidden="true"
                    >
                      {key.blank}
                    </span>
                  ),
                )}
              </div>
            ))}
            <div className="keys-row" aria-hidden="true">
              <span className="key key-blank key-wide">shift</span>
              <span className="key key-blank key-space" />
              <span className="key key-blank key-wide">shift</span>
            </div>
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
        <Sticker name={icon} size={44} fill={STICKER_FILLS[index % STICKER_FILLS.length]} />
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

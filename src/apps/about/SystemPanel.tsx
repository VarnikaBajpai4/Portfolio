import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { content } from '../../content'
import { Sticker } from '../../icons/Sticker'
import { CountUp } from './CountUp'
import { useInView } from './useInView'

/** The two numbers, laid out like the memory bars of an old "About This Macintosh" box. */
export function SystemPanel() {
  const ref = useRef<HTMLElement>(null)
  const seen = useInView(ref)
  const [grade, rank] = content.stats

  return (
    <aside ref={ref} className={`sys px-border${seen ? ' is-in' : ''}`} aria-label="At a glance">
      <div className="sys-head">
        <Sticker name="mac" size={40} fill="var(--c2)" />
        <p>
          <strong>System Varnika</strong>
          <span>Version 2026, still shipping</span>
        </p>
      </div>
      <dl className="sys-rows">
        <dt>{grade.label}</dt>
        <dd>
          <span className="sys-bar">
            <span className="sys-fill dither" style={{ '--level': `${grade.value * 10}%` } as CSSProperties} />
          </span>
          <CountUp stat={grade} active={seen} />
        </dd>
        <dt>Rank</dt>
        <dd>
          <span className="sys-medal" aria-hidden="true">
            <Sticker name="medal" size={30} fill="var(--c4)" />
          </span>
          <span>
            <strong>
              {rank.prefix}
              {rank.value}
            </strong>{' '}
            {rank.label}
          </span>
        </dd>
      </dl>
      <p className="sys-foot">{content.readMe[content.readMe.length - 1]}</p>
    </aside>
  )
}

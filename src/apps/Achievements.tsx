import { useState } from 'react'
import type { CSSProperties } from 'react'
import hackathonPhoto from '../assets/idea-hackathon.jpg'
import { content } from '../content'
import { Icon } from '../icons/Icon'
import { Sticker } from '../icons/Sticker'
import './achievements.css'

/** A photo for an achievement, by its id. */
const PHOTOS: Record<string, { src: string; alt: string }> = {
  ubi: { src: hackathonPhoto, alt: 'My team on stage with the trophy and the prize cheque at the PSBs Hackathon Series 2025' },
}

/** A scrapbook, as on the old Macs: one item on each page, and a scroll bar to turn the pages. */
export function Achievements() {
  const items = content.achievements
  const [index, setIndex] = useState(0)
  const [big, setBig] = useState(false)
  const item = items[index]
  const photo = PHOTOS[item.id]

  const show = (next: number) => {
    setIndex(Math.min(Math.max(next, 0), items.length - 1))
    setBig(false)
  }

  return (
    <div className="scrapbook">
      <article className={`scrap-page${big ? ' is-big' : ''}`} key={item.id} aria-live="polite">
        {photo ? (
          <button
            type="button"
            className="scrap-photo"
            aria-pressed={big}
            aria-label={big ? 'Make the photo smaller' : 'Make the photo larger'}
            onClick={() => setBig(!big)}
          >
            <img src={photo.src} alt={photo.alt} />
          </button>
        ) : (
          <span className="scrap-art" aria-hidden="true">
            {item.sticker ? <Sticker name={item.sticker} size={72} fill="var(--c4)" /> : <Icon name="star" size={64} fill="var(--c3)" />}
          </span>
        )}
        <div className="scrap-text">
          <h2>{item.title}</h2>
          <p className="read">{item.detail}</p>
          {item.tally && (
            <div className="scrap-tally">
              <ul aria-label={item.tally.label}>
                {item.tally.values.map((value, i) => (
                  <li key={i} style={{ '--n': i } as CSSProperties}>
                    {value}
                  </li>
                ))}
              </ul>
              <span aria-hidden="true">{item.tally.label}</span>
            </div>
          )}
        </div>
      </article>

      <div className="scrap-bar">
        <span className="scrap-count">
          {index + 1} / {items.length}
        </span>
        <button type="button" className="scrap-arrow" aria-label="Previous" disabled={index === 0} onClick={() => show(index - 1)}>
          ◀
        </button>
        <input
          type="range"
          className="scrap-scroll"
          aria-label="Page"
          min={1}
          max={items.length}
          value={index + 1}
          onChange={(e) => show(Number(e.target.value) - 1)}
        />
        <button
          type="button"
          className="scrap-arrow"
          aria-label="Next"
          disabled={index === items.length - 1}
          onClick={() => show(index + 1)}
        >
          ▶
        </button>
        <span className="scrap-kind">{photo ? 'PICT' : 'TEXT'}</span>
      </div>
    </div>
  )
}

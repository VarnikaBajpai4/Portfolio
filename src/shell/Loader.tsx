import { useEffect, useState } from 'react'
import { Chindi } from '../icons/Chindi'
import { PixelGrid } from '../icons/PixelGrid'
import { Portrait } from '../icons/Portrait'

const RUN_MS = 2400
const CAUGHT_MS = 700

const POINTER = [
  'K.......',
  'KK......',
  'KWK.....',
  'KWWK....',
  'KWWWK...',
  'KWWWWK..',
  'KWWWWWK.',
  'KWWWWKKK',
  'KWKWWK..',
  'KK.KWWK.',
  '....KWWK',
  '.....KK.',
]

export function Loader({ onDone }: { onDone: () => void }) {
  const [caught, setCaught] = useState(false)
  const [step, setStep] = useState(false)

  useEffect(() => {
    const walk = window.setInterval(() => setStep((s) => !s), 130)
    const catchIt = window.setTimeout(() => setCaught(true), RUN_MS)
    const finish = window.setTimeout(onDone, RUN_MS + CAUGHT_MS)
    window.addEventListener('keydown', onDone)
    return () => {
      window.clearInterval(walk)
      window.clearTimeout(catchIt)
      window.clearTimeout(finish)
      window.removeEventListener('keydown', onDone)
    }
  }, [onDone])

  return (
    <div className="overlay checker loader" onPointerDown={onDone}>
      <div className="overlay-card px-border px-shadow">
        <Portrait size={120} detailed />
        <h1 className="loader-name">Varnika Bajpai</h1>
        <div className="loader-lane">
          <div className={`loader-runner${caught ? ' is-caught' : ''}`} aria-hidden="true">
            <span className="loader-cat">
              <Chindi pose={caught ? 'sit' : step ? 'walkA' : 'walkB'} scale={3} />
            </span>
            {!caught && (
              <span className="loader-pointer">
                <PixelGrid rows={POINTER} legend={{ K: '#000000', W: '#ffffff' }} size={20} />
              </span>
            )}
          </div>
          <div className="loader-track px-border" role="progressbar" aria-label="Loading">
            <div className="loader-fill" />
          </div>
        </div>
        <p className="loader-text" role="status">
          {caught ? 'Caught it.' : 'Chindi is fetching the desktop...'}
        </p>
      </div>
      <button type="button" className="sr-only" onClick={onDone}>
        Skip intro
      </button>
    </div>
  )
}

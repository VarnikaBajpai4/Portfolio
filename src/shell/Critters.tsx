import { PixelGrid } from '../icons/PixelGrid'
import { usePalette } from '../theme'

// P pink, F frill, K ink, W cream, D tan, R red, Y yellow, B brown, M dark brown, G stem green, O orange
const LEGEND = {
  P: '#f6a6c1',
  F: '#e0607e',
  K: '#000000',
  W: '#efe2c4',
  D: '#c9b38a',
  R: '#d63a3a',
  Y: '#f2c94c',
  B: '#8a5a3c',
  M: '#3d2418',
  G: '#2f6b2a',
  O: '#f08a2c',
}

const AXOLOTL = [
  '.F..........F.',
  'F.F.PPPPPP.F.F',
  '.F.PPPPPPPP.F.',
  'F.PPKPPPPKPP.F',
  '..PPPPPPPPPP..',
  '..PPPPKKPPPP..',
  '...PPPPPPPP...',
]

const LLAMA = [
  '.D.D........',
  '.WWW........',
  '.KWW........',
  'WWWW........',
  '.WWW........',
  '.WWW........',
  '.WWWWWWWWWW.',
  '.WWRRRRRRWWD',
  '.WWRYRYRRWW.',
  '.WWWWWWWWWW.',
  '.WW.WW.WW.WW',
  '.DD.DD.DD.DD',
]

const HORSE = [
  '..M...........',
  '.BBM..........',
  'BKBBM.........',
  'WBBBM.........',
  '.BBBBM........',
  '..BBBBBBBBBBB.',
  '..BBBBBBBBBBBM',
  '..BBBBBBBBBBBM',
  '..BBBBBBBBBB.M',
  '..BB.BB..BB.BB',
  '..BB.BB..BB.BB',
  '..MM.MM..MM.MM',
]

const POPPY = ['.R.', 'RKR', '.R.', '.G.', '.G.']
const DANDELION = ['.Y.', 'YOY', '.Y.', '.G.', '.G.']

/** where each flower grows, as CSS insets */
const FLOWERS: { rows: string[]; at: Record<string, string> }[] = [
  { rows: POPPY, at: { left: '22%', bottom: '34px' } },
  { rows: DANDELION, at: { left: '30%', bottom: '14px' } },
  { rows: POPPY, at: { left: '73%', bottom: '44px' } },
  { rows: DANDELION, at: { left: '79%', bottom: '18px' } },
  { rows: DANDELION, at: { left: '46.6%', top: '30%' } },
  { rows: POPPY, at: { right: '150px', top: '46%' } },
]

/** The small animals and flowers of the Overworld theme. They are part of the scenery and do nothing. */
export function Critters() {
  const [palette] = usePalette()
  if (palette !== 'overworld') return null
  return (
    <div className="critters" aria-hidden="true">
      {FLOWERS.map((flower, i) => (
        <span key={i} className="critter" style={flower.at}>
          <PixelGrid rows={flower.rows} legend={LEGEND} size={9} />
        </span>
      ))}
      <span className="critter critter-pond">
        <span className="critter-swim">
          <PixelGrid rows={AXOLOTL} legend={LEGEND} size={42} />
        </span>
      </span>
      <span className="critter critter-hop critter-llama">
        <PixelGrid rows={LLAMA} legend={LEGEND} size={36} />
      </span>
      <span className="critter critter-hop critter-horse">
        <PixelGrid rows={HORSE} legend={LEGEND} size={42} />
      </span>
    </div>
  )
}

import { PixelGrid } from '../icons/PixelGrid'

// Two things I like, left quietly on the desktop floor.
const LEGEND = { K: '#000000', B: '#161616', b: '#3d3d3d', G: '#d9b24a' }

const BAG = [
  '....GG....GG....',
  '...G..G..G..G...',
  '..G....GG....G..',
  '..G..........G..',
  '.KKKKKKKKKKKKKK.',
  'KBBBBBBBBBBBBBBK',
  'KBbBbBbBbBbBbBBK',
  'KBBbBbBbBbBbBBBK',
  'KKKKKKKGGKKKKKKK',
  'KBbBbBbGGbBbBbBK',
  'KBBbBbBbBbBbBBBK',
  'KBbBbBbBbBbBbBBK',
  'KBBbBbBbBbBbBBBK',
  'KBbBbBbBbBbBbBBK',
  '.KKKKKKKKKKKKKK.',
]

const LOAFER = [
  '....KKKK........',
  '...KBBBBKK......',
  '..KBBBBBBBKKK...',
  '.KBBBBGGBBBBBKK.',
  'KBBBBBBBBBBBBBBK',
  'KKKKKKKKKKKKKKKK',
  '.KK..........KK.',
]

export function Closet() {
  return (
    <div className="closet" aria-hidden="true">
      <PixelGrid rows={BAG} legend={LEGEND} size={32} />
      <PixelGrid rows={LOAFER} legend={LEGEND} size={32} />
      <PixelGrid rows={LOAFER} legend={LEGEND} size={32} />
    </div>
  )
}

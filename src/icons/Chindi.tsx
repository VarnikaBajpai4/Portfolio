import { PixelGrid } from './PixelGrid'

// K outline, W white, O ginger, o darker ginger stripe, G green eye, P pink nose
const LEGEND = { K: '#000000', W: '#ffffff', O: '#f0a04b', o: '#c9742a', G: '#7fa23c', P: '#f29aa8' }

const SIT = [
  '.KK..........KK.',
  'KOOK........KOOK',
  'KOOOKKKKKKKKOOOK',
  'KOOOOOWWWWOOOOOK',
  'KOOOOWWWWWWOOOOK',
  'KWWGGWWWWWWGGWWK',
  'KWWGGWWWWWWGGWWK',
  'KWWWWWWPPWWWWWWK',
  '.KWWWWWWWWWWWWK.',
  '..KKWWWWWWWWKK..',
  '..KWWWWWWWWWWK..',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWKK',
  '.KWWWWWWWWWWWKOK',
  '.KWWKWWWWWKWWKoK',
  '.KKKKKKKKKKKKKK.',
]

const WALK_BODY = [
  '................K..K..',
  '.KK............KOKKOK.',
  'KOoK...........KOOWOOK',
  'KoOK...........KWGWWGK',
  'KOoK...........KWWWPWK',
  '.KOKKKKKKKKKKKKKWWWWK.',
  '.KWWWWOOOOWWWWWWWWKK..',
  '.KWWWWOOOOOWWWWWWWK...',
  '.KWWWWWOOOWWWWWWWWK...',
  '.KWWWWWWWWWWWWWWWWK...',
  '.KWWKKKKKKKKKKWWKK....',
]

const WALK_A = [...WALK_BODY, '.KWK.KWK....KWK.KWK...', '.KWK.KWK....KWK.KWK...', '.KKK.KKK....KKK.KKK...']
const WALK_B = [...WALK_BODY, '..KWKKWK....KWKKWK....', '..KWKKWK....KWKKWK....', '..KKKKKK....KKKKKK....']

const SLEEP = [
  '....KKKKKKKK......',
  '..KKWWWWOOOWKK....',
  '.KWWWWWOOOOWWWKK..',
  'KOKWWWWWOOWWWWOOK.',
  'KOOKWWWWWWWWWKOOOK',
  'KoOOKKKKKKKKKWKWKK',
  '.KoOoOoKWWWWWWWWK.',
  '..KKKKKKKKKKKKKK..',
]

const POSES = { sit: SIT, walkA: WALK_A, walkB: WALK_B, sleep: SLEEP }

export type ChindiPose = keyof typeof POSES

/** One grid pixel is drawn as `scale` screen pixels. */
export function Chindi({ pose, scale = 2 }: { pose: ChindiPose; scale?: number }) {
  const rows = POSES[pose]
  return <PixelGrid rows={rows} legend={LEGEND} size={rows[0].length * scale} />
}

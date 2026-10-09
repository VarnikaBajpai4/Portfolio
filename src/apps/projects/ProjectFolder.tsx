import { Icon } from '../../icons/Icon'
import { PixelGrid } from '../../icons/PixelGrid'
import './folders.css'

// A small mark on the front of each project's folder, so no two folders look alike.
const EMBLEMS: Record<string, { rows: string[]; fill: string; motion: string }> = {
  // code brackets, typed out
  omnicompiler: {
    rows: ['..K...K.K...', '.K...K...K..', 'K....K....K.', '.K..K....K..', '..K.K...K...', '............'],
    fill: 'var(--c3)',
    motion: 'type',
  },
  // waves that drift
  floatchat: {
    // drawn wider than the window it shows through, so it can slide
    rows: [
      '.................',
      '.KK..KK..KK..KK..',
      'K..KK..KK..KK..KK',
      '.................',
      '..KK..KK..KK..KK.',
      'KK..KK..KK..KK..K',
    ],
    fill: '#8ecbf7',
    motion: 'drift',
  },
  // a bank
  bharosa: {
    rows: ['.....KK.....', '...KKKKKK...', '.KKKKKKKKKK.', '..K.K..K.K..', '..K.K..K.K..', '.KKKKKKKKKK.'],
    fill: 'var(--c4)',
    motion: 'bob',
  },
  // people joined into a team
  symbiote: {
    rows: ['KK........KK', 'KK.K....K.KK', '....KKKK....', '....KKKK....', 'KK.K....K.KK', 'KK........KK'],
    fill: 'var(--c2)',
    motion: 'pulse',
  },
  // a shield with a scan line
  malshield: {
    rows: ['..KKKKKKKK..', '..K..KK..K..', '..K.KKKK.K..', '...K.KK.K...', '....KKKK....', '.....KK.....'],
    fill: 'var(--paper)',
    motion: 'scan',
  },
}

const SIZE = 56
const PIXEL = SIZE / 16

export function ProjectFolder({ id }: { id: string }) {
  const emblem = EMBLEMS[id]
  return (
    <span className="folder">
      <Icon name="folder" size={SIZE} fill={emblem?.fill ?? 'var(--c3)'} />
      {emblem && (
        <span
          className={`folder-emblem folder-${emblem.motion}`}
          style={{ left: PIXEL * 2, top: PIXEL * 6, width: PIXEL * 12 }}
        >
          <PixelGrid rows={emblem.rows} legend={{ K: 'var(--ink)' }} size={PIXEL * emblem.rows[0].length} />
        </span>
      )}
    </span>
  )
}

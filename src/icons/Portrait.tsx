import { PixelGrid } from './PixelGrid'

const LEGEND = {
  H: '#3a2318',
  h: '#5c3a26',
  S: '#f6d3b3',
  s: '#e4b48f',
  E: '#1a1a1a',
  L: '#d9697c',
  T: '#111111',
  G: '#e0b040',
}

const SIMPLE = [
  '...HHHHHH...',
  '..HHHHHHHH..',
  '.HHHHHHHHHH.',
  '.HHHSSSSHHH.',
  'HHHSSSSSSHHH',
  'HHSESSSSESHH',
  'HHSSSSSSSSHH',
  'HHHSSLLSSHHH',
  'HHHHSSSSHHHH',
  'HHH.TSST.HHH',
  'HH.TTTTTT.HH',
  'HH.TTTTTT.HH',
]

const DETAILED = [
  '........HHHHHHHH........',
  '......HHHHHHHHHHHH......',
  '.....HHHhHHHHHHHHHH.....',
  '....HHHhHHHHHHHHHHHH....',
  '...HHHhHHHHHHHHHHHHHH...',
  '...HHhHHHHSSSSSHHHHHH...',
  '..HHHHHHSSSSSSSSSHHHHH..',
  '..HHHHHSSSSSSSSSSSHHHH..',
  '..HHHHSSSSSSSSSSSSSHHH..',
  '..HHHSSHHHSSSSHHHSSHHH..',
  '..HHHSSSEESSSSEESSSHHH..',
  '.HHHHSSSEESSSSEESSSHHHH.',
  '.HHHHSSSSSSSSSSSSSSHHHH.',
  '.HHHGSSSSSSSsSSSSSSGHHH.',
  '.HHHHSSSSSSssSSSSSSHHHH.',
  '.HhHHHSSSSLLLLSSSSHHHhH.',
  '.HhHHHHSSSSLLSSSSHHHHhH.',
  'HHhHHHHHSSSSSSSSHHHHHhHH',
  'HHhHHHHHHHssssHHHHHHHhHH',
  'HHHhHHHHHTTssTTHHHHHhHHH',
  'HHHhHHHHTTTTTTTTHHHHhHHH',
  '.HHHhHHTTTTTTTTTTHHhHHH.',
  '.HHHHHTTTTTGGTTTTTHHHHH.',
  '..HHHTTTTTTTTTTTTTTHHH..',
]

export function Portrait({ size, detailed = false }: { size: number; detailed?: boolean }) {
  return <PixelGrid rows={detailed ? DETAILED : SIMPLE} legend={LEGEND} size={size} />
}

// H hair, S skin, K ink, B beard, T dark shirt, N navy shirt, W white, P trousers, F shoes,
// R red, Y gold, G grey, U watch blue
export const PEOPLE_LEGEND = {
  H: '#2a1a12',
  S: '#d9a47a',
  K: '#000000',
  B: '#1c120c',
  T: '#1e1e1e',
  N: '#27305c',
  W: '#ffffff',
  P: '#3b4f7a',
  F: '#111111',
  R: '#d63a3a',
  Y: '#e7b93c',
  G: '#bdbdbd',
  U: '#2f6fd6',
}

const LEGS = ['..PPPPPPPP..', '..PPP..PPP..', '..PPP..PPP..', '..PPP..PPP..', '..FFF..FFF..']

export const PEOPLE = {
  mom: {
    rows: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '.HHHSSSSHHH.',
      '.HHSKSSKSHH.',
      '.HWSSSSSSWH.',
      '.HHSSRRSSHH.',
      '.HH.SSSS.HH.',
      '.HHYYYYYYHH.',
      '.HYYWYYWYYH.',
      '.YYYWYYYWYY.',
      'SYYYYWWYYYYS',
      '.YYWYYYYWYY.',
      '..YYYYYYYY..',
      ...LEGS,
    ],
  },
  dad: {
    rows: [
      '....SSSS....',
      '...SSSSSS...',
      '..HSSSSSSH..',
      '..HKKSSKKH..',
      '..SSSSSSSS..',
      '...SSKKSS...',
      '....SSSS....',
      '..TTTTTTTT..',
      '.TTTTTTTTTT.',
      '.TTWTTTTWTT.',
      'STTTTTTTTTTS',
      '.TTTTTTTTTT.',
      '..TTTTTTTT..',
      ...LEGS,
    ],
  },
  brother: {
    rows: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '..HSSSSSSH..',
      '..KKKSSKKK..',
      '..BSSSSSSB..',
      '..BBWWWWBB..',
      '...BBBBBB...',
      '..WWWWWWKW..',
      '.WWWWWWWKWW.',
      '.WWWWWWKWWW.',
      'SWWWWWWWWWWS',
      '.WWWWWWWWWW.',
      '..WWWWWWWW..',
      ...LEGS,
    ],
  },
  sisterInLaw: {
    rows: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '.HHSSSSSSHH.',
      '.HHSKSSKSHH.',
      '.HHSSSSSSHH.',
      '.HHSSWWSSHH.',
      '.HH.SSSS.HH.',
      '.HHWWYYWWHH.',
      '.HWWWWWWWWH.',
      '.HWWWWWWWWH.',
      'SWWWWWWWWWWS',
      '.WWWWWWWWWW.',
      '..WWWWWWWW..',
      ...LEGS,
    ],
  },
  boyfriend: {
    rows: [
      '...HHHHHH...',
      '..HHHHHHHH..',
      '..HHHHHSSH..',
      '..SKSKKSKS..',
      '..SSSSSSSS..',
      '...SSKKSS...',
      '....SSSS....',
      '..TTGTTGTT..',
      '.TTTTTTTTTT.',
      '.TTTTTTTTTT.',
      'STTTTTTTTTTU',
      '.TTTTTTTTTT.',
      '..TTTTTTTT..',
      ...LEGS,
    ],
  },
}

export type FamilyId = keyof typeof PEOPLE
export const FAMILY_IDS = Object.keys(PEOPLE) as FamilyId[]
/** size of one person in grid pixels */
export const PERSON_W = 12
export const PERSON_H = 18

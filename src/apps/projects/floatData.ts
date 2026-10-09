import type { ShowcaseCopy } from './Showcase'

export const COPY: ShowcaseCopy = {
  tagline: 'Ask the ocean a question in plain language. Get an answer drawn from real float data.',
  stamp: 'SIH 2025',
  overview: [
    'Thousands of Argo floats drift through the oceans and report temperature, salinity and oxygen. The data is public, but it sits in NetCDF files that take code to read. FloatChat lets anyone ask in plain language.',
    'A question goes to a language model that can call tools on our own MCP server. The tools run SQL over the float profiles and return a time series, a heat map or a map layer, so each answer points back to real measurements. A second mode forecasts a variable forward.',
  ],
  meta: 'Built for Smart India Hackathon 2025, team Debug Dynasty.',
  stack: [
    { layer: 'Interface', parts: ['React', 'Vite', 'Tailwind CSS', 'Leaflet', 'Framer Motion'] },
    { layer: 'Server', parts: ['Node.js', 'Express', 'MongoDB'] },
    { layer: 'Core', parts: ['Python', 'FastAPI', 'FastMCP', 'GPT-5 API', 'XGBoost'] },
    { layer: 'Data', parts: ['Argo NetCDF', 'PostgreSQL', 'Chroma', 'Pandas'] },
  ],
  steps: [
    { name: 'Ingest', text: 'Argo NetCDF profiles are cleaned and loaded into PostgreSQL.' },
    { name: 'Index', text: 'Schema notes and summaries are embedded into Chroma.' },
    { name: 'Gatekeep', text: 'Each question is checked: on topic, and specific enough to plot?' },
    { name: 'Call', text: 'The model picks a tool on a custom MCP server.' },
    { name: 'Plot', text: 'SQL results become a time series, a heat map or a map layer.' },
    { name: 'Forecast', text: 'XGBoost models project a variable forward in Prediction mode.' },
  ],
  demoTitle: 'Ask the ocean',
  demoHint: 'Pick a question and follow it through the system. A recorded example with illustrative data.',
}

export type View = 'line' | 'map' | 'heat'

export interface Question {
  id: string
  ask: string
  /** the gatekeeper's ruling */
  verdict: 'proceed' | 'irrelevant'
  /** the MCP tool the model calls */
  tool?: string
  sql?: string
  answer: string
  view?: View
}

export const QUESTIONS: Question[] = [
  {
    id: 'trend',
    ask: 'How did sea temperature change in the Arabian Sea this year?',
    verdict: 'proceed',
    tool: 'generate_time_series_tool',
    sql: "SELECT DATE_TRUNC('month', time), AVG(temp) FROM profiles WHERE region = 'arabian_sea' GROUP BY 1",
    answer: 'It climbs from about 26 °C in January to a peak near 30 °C in May, then cools when the monsoon arrives.',
    view: 'line',
  },
  {
    id: 'where',
    ask: 'Where are the floats near India?',
    verdict: 'proceed',
    tool: 'generate_map_points_tool',
    sql: 'SELECT float_id, lat, lon FROM floats WHERE lat BETWEEN 0 AND 25 AND lon BETWEEN 55 AND 95',
    answer: 'Nine floats are reporting: five in the Arabian Sea and four in the Bay of Bengal.',
    view: 'map',
  },
  {
    id: 'salt',
    ask: 'Show salinity across the Bay of Bengal.',
    verdict: 'proceed',
    tool: 'generate_heatmap_tool',
    sql: "SELECT lon_bin, lat_bin, AVG(psal) FROM profiles WHERE region = 'bay_of_bengal' GROUP BY 1, 2",
    answer: 'The water is fresher in the north, near the river mouths, and saltier toward the open ocean.',
    view: 'heat',
  },
  {
    id: 'poem',
    ask: 'Write a poem about my cat.',
    verdict: 'irrelevant',
    answer: 'I only answer questions about Argo ocean data. Try temperature, salinity, or where the floats are.',
  },
]

/** What a question passes through. The demo lights these up one at a time. */
export const STAGES = ['Gatekeeper', 'Retrieve', 'Tool call', 'SQL', 'Plot'] as const

/** Monthly mean surface temperature, °C. Illustrative. */
export const TEMPERATURE = [26.1, 26.4, 27.6, 29.0, 30.1, 29.2, 27.6, 27.0, 27.9, 28.8, 28.0, 26.8]
export const MONTHS = 'JFMAMJJASOND'

/** Land around India on a 24 by 16 grid: L is land, everything else is sea. */
export const COAST = [
  'LLLLLLLLLLLLLLLLLLLLLLLL',
  '.LLLLLLLLLLLLLLLLLLLLLL.',
  '..LLLLLLLLLLLLLLLLLL.LL.',
  '...LLLLLLLLLLLLLLLL.....',
  '....LLLLLLLLLLLLLL......',
  '.....LLLLLLLLLLLL.......',
  '......LLLLLLLLLLL.......',
  '.......LLLLLLLLL........',
  '........LLLLLLL.........',
  '.........LLLLLL.........',
  '..........LLLL..........',
  '..........LLL...........',
  '...........LL...........',
  '...........L....L.......',
  '................LL......',
  '........................',
]

/** Float positions as a share of the map's width and height: five to the west, four to the east. */
export const FLOATS = [
  [8, 34],
  [15, 52],
  [24, 66],
  [10, 78],
  [33, 88],
  [78, 40],
  [86, 56],
  [72, 68],
  [90, 82],
]

/** Salinity in PSU on a grid, north at the top. Illustrative. */
export const SALINITY = [
  [31.2, 31.0, 30.9, 31.3, 31.8, 32.1, 32.4, 32.6],
  [31.9, 31.6, 31.7, 32.0, 32.4, 32.7, 32.9, 33.0],
  [32.6, 32.4, 32.5, 32.8, 33.0, 33.2, 33.4, 33.5],
  [33.2, 33.1, 33.2, 33.4, 33.6, 33.8, 33.9, 34.0],
  [33.8, 33.8, 33.9, 34.0, 34.2, 34.3, 34.4, 34.5],
  [34.3, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9],
]

import { useEffect, useState } from 'react'
import { content } from '../content'
import type { Place } from '../content'
import './map.css'

/** degrees in one cell of the map */
const CELL = 5
const COLS = 360 / CELL
const TOP = 80
const ROWS = 27

/** The land, as runs of cells: [row from the top, first column, last column]. */
const LAND: [number, number, number][] = [
  [0, 16, 22], [0, 26, 31], [0, 39, 39], [0, 56, 57],
  [1, 12, 24], [1, 25, 32], [1, 46, 66],
  [2, 3, 8], [2, 9, 23], [2, 26, 31], [2, 39, 42], [2, 43, 71],
  [3, 3, 8], [3, 9, 17], [3, 21, 22], [3, 27, 29], [3, 31, 32], [3, 37, 41], [3, 42, 71],
  [4, 4, 5], [4, 10, 17], [4, 21, 24], [4, 35, 35], [4, 38, 39], [4, 40, 68],
  [5, 11, 24], [5, 34, 35], [5, 37, 44], [5, 45, 64], [5, 67, 68],
  [6, 11, 24], [6, 35, 44], [6, 45, 65],
  [7, 11, 22], [7, 34, 35], [7, 37, 43], [7, 44, 64], [7, 64, 65],
  [8, 12, 21], [8, 34, 35], [8, 38, 40], [8, 41, 44], [8, 45, 62], [8, 63, 64],
  [9, 12, 20], [9, 34, 43], [9, 43, 48], [9, 48, 54], [9, 54, 60], [9, 62, 62],
  [10, 13, 16], [10, 19, 20], [10, 33, 43], [10, 43, 47], [10, 49, 54], [10, 55, 60],
  [11, 14, 17], [11, 19, 21], [11, 33, 43], [11, 44, 47], [11, 50, 54], [11, 55, 59],
  [12, 15, 18], [12, 33, 43], [12, 44, 46], [12, 51, 53], [12, 55, 57], [12, 60, 60],
  [13, 18, 19], [13, 33, 44], [13, 51, 52], [13, 56, 57], [13, 60, 61],
  [14, 20, 24], [14, 34, 45], [14, 52, 52], [14, 56, 56],
  [15, 20, 26], [15, 37, 44], [15, 55, 59],
  [16, 20, 28], [16, 38, 44], [16, 56, 62], [16, 64, 65],
  [17, 20, 29], [17, 38, 43], [17, 57, 60], [17, 64, 66],
  [18, 21, 28], [18, 38, 44], [18, 62, 64],
  [19, 22, 28], [19, 38, 43], [19, 45, 45], [19, 60, 65],
  [20, 22, 27], [20, 39, 43], [20, 45, 45], [20, 59, 66],
  [21, 22, 26], [21, 39, 42], [21, 59, 66],
  [22, 22, 25], [22, 39, 41], [22, 59, 60], [22, 63, 66],
  [23, 22, 24], [23, 64, 65], [23, 70, 70],
  [24, 22, 23], [24, 65, 65], [24, 69, 70],
  [25, 22, 23], [25, 69, 69],
  [26, 22, 23],
]

/** each land cell one time, as [column, row]; some runs touch */
const CELLS = [...new Set(LAND.flatMap(([row, from, to]) => Array.from({ length: to - from + 1 }, (_, i) => `${from + i},${row}`)))].map(
  (cell) => cell.split(',').map(Number),
)

const x = (lon: number) => (lon + 180) / CELL
const y = (lat: number) => (TOP - lat) / CELL

function degrees(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`
}

function timeAt(zone: string, now: Date) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: zone, weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(now)
}

/** The Map of the old control panels: a dot map of the world, with a pin for each place that matters to me. */
export function WorldMap() {
  const places = content.places
  const [id, setId] = useState(places[0].id)
  const [now, setNow] = useState(() => new Date())
  const place: Place = places.find((p) => p.id === id) ?? places[0]

  // the local time of the place stays correct while the window is open
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const next = () => setId(places[(places.indexOf(place) + 1) % places.length].id)

  return (
    <div className="map">
      <div className="map-world px-border">
        <svg viewBox={`0 0 ${COLS} ${ROWS}`} role="group" aria-label="World map">
          {CELLS.map(([column, row]) => (
            <rect key={`${column}-${row}`} className="map-land" x={column + 0.12} y={row + 0.12} width="0.76" height="0.76" />
          ))}
          {/* the lines of latitude and longitude through the chosen place */}
          <line className="map-cross" x1="0" x2={COLS} y1={y(place.lat)} y2={y(place.lat)} />
          <line className="map-cross" y1="0" y2={ROWS} x1={x(place.lon)} x2={x(place.lon)} />
          {/* the chosen pin is drawn last, on top: some places are close to each other */}
          {[...places.filter((p) => p.id !== id), place].map((p) => (
            <rect
              key={p.id}
              className={`map-pin${p.id === id ? ' is-on' : ''}`}
              x={x(p.lon) - 0.55}
              y={y(p.lat) - 0.55}
              width="1.1"
              height="1.1"
              onClick={() => setId(p.id)}
            />
          ))}
        </svg>
      </div>

      <ul className="map-list" aria-label="Places">
        {places.map((p) => (
          <li key={p.id}>
            <button type="button" aria-pressed={p.id === id} onClick={() => setId(p.id)}>
              {p.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="map-detail" aria-live="polite">
        <h2>{place.name}</h2>
        <p className="read">{place.note}</p>
        <dl>
          <dt>Latitude</dt>
          <dd>{degrees(place.lat, 'N', 'S')}</dd>
          <dt>Longitude</dt>
          <dd>{degrees(place.lon, 'E', 'W')}</dd>
          <dt>Time there</dt>
          <dd>{timeAt(place.zone, now)}</dd>
        </dl>
        <button type="button" className="btn map-find" onClick={next}>
          Find next
        </button>
      </div>
    </div>
  )
}

interface Props {
  /** one string per row, one character per pixel; '.' is transparent */
  rows: string[]
  legend: Record<string, string>
  size: number
}

export function PixelGrid({ rows, legend, size }: Props) {
  const width = rows[0].length
  const rects = []
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y]
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      if (ch !== '.') {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={legend[ch]} />)
      }
      x += run
    }
  }
  return (
    <svg
      width={size}
      height={(size * rows.length) / width}
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

// Geometry for folding the bottom-left corner of a sheet of paper to a point.

export interface Pt {
  x: number
  y: number
}

export interface Fold {
  /** the part of the page still lying flat */
  sheet: Pt[]
  /** the lifted part, mirrored over the crease: this is the back of the page */
  flap: Pt[]
  /** a point on the crease, and the tip of the flap; the shading runs between them */
  crease: Pt
  tip: Pt
}

/** Keep the part of a convex polygon where (p - m) · n has the wanted sign. */
function cut(poly: Pt[], m: Pt, n: Pt, positive: boolean): Pt[] {
  const side = (p: Pt) => ((p.x - m.x) * n.x + (p.y - m.y) * n.y) * (positive ? 1 : -1)
  const result: Pt[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const da = side(a)
    const db = side(b)
    if (da >= 0) result.push(a)
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db)
      result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
    }
  }
  return result
}

/**
 * Fold the bottom-left corner of a `w` by `h` page so that it lands on `to`.
 * The crease is the line halfway between the corner and `to`.
 */
export function foldCorner(w: number, h: number, to: Pt): Fold {
  const corner = { x: 0, y: h }
  const page = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, corner]
  const dx = to.x - corner.x
  const dy = to.y - corner.y
  const length = Math.hypot(dx, dy)
  if (length < 1) return { sheet: page, flap: [], crease: corner, tip: corner }

  const n = { x: dx / length, y: dy / length }
  const crease = { x: corner.x + dx / 2, y: corner.y + dy / 2 }
  const lifted = cut(page, crease, n, false)
  const mirror = (p: Pt): Pt => {
    const d = (p.x - crease.x) * n.x + (p.y - crease.y) * n.y
    return { x: p.x - 2 * d * n.x, y: p.y - 2 * d * n.y }
  }
  return { sheet: cut(page, crease, n, true), flap: lifted.map(mirror), crease, tip: to }
}

/** Where the corner must go for the whole page to have left the pad. */
export function fullyTurned(w: number, h: number): Pt {
  return { x: 2.15 * w, y: h - 2.15 * h }
}

export const APP_IDS = [
  'about',
  'work',
  'projects',
  'achievements',
  'community',
  'resume',
  'contact',
  'readme',
  'notepad',
  'terminal',
  'trash',
  'hd',
] as const

export type AppId = (typeof APP_IDS)[number]

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** The area windows live in: below the menu bar, above the dock. */
export interface Bounds {
  w: number
  h: number
}

export interface Win {
  id: AppId
  rect: Rect
  z: number
  zoomed: boolean
  restore?: Rect
  param?: string
}

export interface WMState {
  windows: Win[]
  nextZ: number
}

export type WMAction =
  | { type: 'open'; id: AppId; rect: Rect; param?: string }
  | { type: 'close'; id: AppId }
  | { type: 'closeAll' }
  | { type: 'focus'; id: AppId }
  | { type: 'move'; id: AppId; x: number; y: number; bounds: Bounds }
  | { type: 'resize'; id: AppId; w: number; h: number; bounds: Bounds }
  | { type: 'zoom'; id: AppId; bounds: Bounds }
  | { type: 'clampAll'; bounds: Bounds }
  | { type: 'reset'; windows: Win[] }

export const MIN_W = 220
export const MIN_H = 140
export const TITLE_H = 28
const ZOOM_INSET = 16

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), Math.max(lo, hi))
}

/** Enforce minimum size, cap at the bounds, and keep the whole title bar reachable. */
export function clampRect(r: Rect, b: Bounds): Rect {
  const w = clamp(r.w, MIN_W, b.w)
  const h = clamp(r.h, MIN_H, b.h)
  return { w, h, x: clamp(r.x, 0, b.w - w), y: clamp(r.y, 0, b.h - TITLE_H) }
}

export function initialState(windows: Win[]): WMState {
  return { windows, nextZ: windows.reduce((max, w) => Math.max(max, w.z), 0) + 1 }
}

function topOf(windows: Win[]): Win | undefined {
  return windows.reduce<Win | undefined>((top, w) => (!top || w.z > top.z ? w : top), undefined)
}

function update(s: WMState, id: AppId, change: (w: Win) => Win): WMState {
  return { ...s, windows: s.windows.map((w) => (w.id === id ? change(w) : w)) }
}

function focus(s: WMState, id: AppId): WMState {
  if (topOf(s.windows)?.id === id) return s
  return { ...update(s, id, (w) => ({ ...w, z: s.nextZ })), nextZ: s.nextZ + 1 }
}

export function wmReducer(s: WMState, a: WMAction): WMState {
  switch (a.type) {
    case 'open': {
      if (s.windows.some((w) => w.id === a.id)) {
        return focus(
          update(s, a.id, (w) => ({ ...w, param: a.param })),
          a.id,
        )
      }
      const win: Win = { id: a.id, rect: a.rect, z: s.nextZ, zoomed: false, param: a.param }
      return { windows: [...s.windows, win], nextZ: s.nextZ + 1 }
    }
    case 'close':
      return { ...s, windows: s.windows.filter((w) => w.id !== a.id) }
    case 'closeAll':
      return { ...s, windows: [] }
    case 'focus':
      return focus(s, a.id)
    case 'move':
      return update(s, a.id, (w) => ({
        ...w,
        zoomed: false,
        rect: clampRect({ ...w.rect, x: a.x, y: a.y }, a.bounds),
      }))
    case 'resize':
      return update(s, a.id, (w) => ({
        ...w,
        zoomed: false,
        rect: clampRect({ ...w.rect, w: a.w, h: a.h }, a.bounds),
      }))
    case 'zoom':
      return update(s, a.id, (w) =>
        w.zoomed && w.restore
          ? { ...w, zoomed: false, rect: clampRect(w.restore, a.bounds), restore: undefined }
          : {
              ...w,
              zoomed: true,
              restore: w.rect,
              rect: clampRect(
                { x: ZOOM_INSET, y: ZOOM_INSET, w: a.bounds.w - 2 * ZOOM_INSET, h: a.bounds.h - 2 * ZOOM_INSET },
                a.bounds,
              ),
            },
      )
    case 'clampAll':
      return { ...s, windows: s.windows.map((w) => ({ ...w, rect: clampRect(w.rect, a.bounds) })) }
    case 'reset':
      return initialState(a.windows)
  }
}

export function topId(windows: Win[]): AppId | null {
  return topOf(windows)?.id ?? null
}

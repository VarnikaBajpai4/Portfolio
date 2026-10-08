import { useSyncExternalStore } from 'react'
import { readStored, writeStored } from './storage'

export type PaletteId = 'sorbet' | 'cocoa' | 'blueberry'

export const PALETTES: { id: PaletteId; label: string; swatch: string }[] = [
  { id: 'sorbet', label: 'Sorbet', swatch: '#1fa8c9' },
  { id: 'cocoa', label: 'Cocoa', swatch: '#7a3b1d' },
  { id: 'blueberry', label: 'Blueberry', swatch: '#8ea2e8' },
]

const KEY = 'vb.palette'
const EVENT = 'vb:palette'
let current: PaletteId | null = null

export function isPaletteId(v: string): v is PaletteId {
  return PALETTES.some((p) => p.id === v)
}

export function getPalette(): PaletteId {
  if (current) return current
  const stored = readStored(KEY)
  return stored && isPaletteId(stored) ? stored : 'sorbet'
}

export function setPalette(id: PaletteId): void {
  current = id
  document.documentElement.dataset.palette = id
  writeStored(KEY, id)
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  return () => window.removeEventListener(EVENT, onChange)
}

export function usePalette(): [PaletteId, (id: PaletteId) => void] {
  return [useSyncExternalStore(subscribe, getPalette), setPalette]
}

import { createContext, useContext } from 'react'

/** Drop a torn-off note at a viewport position. */
export type AddSticky = (text: string, x: number, y: number) => void

export const StickyContext = createContext<AddSticky | null>(null)

export function useAddSticky(): AddSticky | null {
  return useContext(StickyContext)
}

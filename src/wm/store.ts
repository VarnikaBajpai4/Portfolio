import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { AppId, WMAction, Win } from './reducer'

export interface WM {
  windows: Win[]
  topId: AppId | null
  dispatch: Dispatch<WMAction>
}

/** What an app may ask of the window it lives in. Null outside a window (the phone layout). */
export interface WindowControls {
  zoomed: boolean
  toggleZoom: () => void
}

export const WindowContext = createContext<WindowControls | null>(null)

export function useWindowControls(): WindowControls | null {
  return useContext(WindowContext)
}

export const WMContext = createContext<WM | null>(null)

export function useWM(): WM {
  const wm = useContext(WMContext)
  if (!wm) throw new Error('useWM must be used inside WMProvider')
  return wm
}

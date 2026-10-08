import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { AppId, WMAction, Win } from './reducer'

export interface WM {
  windows: Win[]
  topId: AppId | null
  dispatch: Dispatch<WMAction>
}

export const WMContext = createContext<WM | null>(null)

export function useWM(): WM {
  const wm = useContext(WMContext)
  if (!wm) throw new Error('useWM must be used inside WMProvider')
  return wm
}

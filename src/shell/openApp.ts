import { createContext, useContext } from 'react'
import type { AppId } from '../wm/reducer'

export type OpenApp = (id: AppId, param?: string) => void

export const OpenAppContext = createContext<OpenApp>(() => {})

export function useOpenApp(): OpenApp {
  return useContext(OpenAppContext)
}

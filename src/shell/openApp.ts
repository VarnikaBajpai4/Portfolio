import { createContext, useContext } from 'react'
import type { AppId } from '../wm/reducer'

/** `origin` is the element the window should grow out of, when it is not the app's own icon. */
export type OpenApp = (id: AppId, param?: string, origin?: Element) => void

export const OpenAppContext = createContext<OpenApp>(() => {})

export function useOpenApp(): OpenApp {
  return useContext(OpenAppContext)
}

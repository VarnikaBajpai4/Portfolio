import { useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { initialState, topId, wmReducer } from './reducer'
import type { Win } from './reducer'
import { WMContext } from './store'

export function WMProvider({ initial, children }: { initial: Win[]; children: ReactNode }) {
  const [state, dispatch] = useReducer(wmReducer, initial, initialState)
  const value = useMemo(
    () => ({ windows: state.windows, topId: topId(state.windows), dispatch }),
    [state.windows],
  )
  return <WMContext value={value}>{children}</WMContext>
}

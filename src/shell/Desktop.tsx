import { useCallback, useEffect, useMemo, useState } from 'react'
import { APPS, fillColor, getApp, rectFor } from '../apps/registry'
import type { AppId, Bounds, Win } from '../wm/reducer'
import { useWM } from '../wm/store'
import { Window } from '../wm/Window'
import { WMProvider } from '../wm/WMProvider'
import { DesktopIcons } from './DesktopIcons'
import { Dock } from './Dock'
import { MenuBar } from './MenuBar'
import { OpenAppContext } from './openApp'
import './shell.css'

const MENU_H = 32
const DOCK_RESERVE = 84

function measure(): Bounds {
  return { w: window.innerWidth, h: window.innerHeight - MENU_H - DOCK_RESERVE }
}

function startWindows(bounds: Bounds): Win[] {
  return APPS.filter((app) => app.openOnStart).map((app, i) => ({
    id: app.id,
    rect: rectFor(app, bounds),
    z: i + 1,
    zoomed: false,
  }))
}

interface Props {
  onRestartIntro: () => void
  onShutDown: () => void
}

function DesktopInner({ bounds, onRestartIntro, onShutDown }: Props & { bounds: Bounds }) {
  const { windows, dispatch } = useWM()

  useEffect(() => {
    dispatch({ type: 'clampAll', bounds })
  }, [bounds, dispatch])

  const openApp = useCallback(
    (id: AppId, param?: string) => dispatch({ type: 'open', id, rect: rectFor(getApp(id), bounds), param }),
    [bounds, dispatch],
  )

  return (
    <OpenAppContext value={openApp}>
      <MenuBar
        bounds={bounds}
        onCleanUp={() => dispatch({ type: 'reset', windows: startWindows(bounds) })}
        onRestartIntro={onRestartIntro}
        onShutDown={onShutDown}
      />
      <main className="desk-area">
        <DesktopIcons />
        {windows.map((win) => {
          const app = getApp(win.id)
          const App = app.component
          return (
            <Window key={win.id} win={win} title={app.title} fill={fillColor(app.fill)} bounds={bounds}>
              <App param={win.param} />
            </Window>
          )
        })}
      </main>
      <Dock />
    </OpenAppContext>
  )
}

export function Desktop(props: Props) {
  const [bounds, setBounds] = useState(measure)
  const initial = useMemo(() => startWindows(measure()), [])

  useEffect(() => {
    const onResize = () => setBounds(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="desktop checker">
      <WMProvider initial={initial}>
        <DesktopInner bounds={bounds} {...props} />
      </WMProvider>
    </div>
  )
}

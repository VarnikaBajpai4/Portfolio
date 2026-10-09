import { useCallback, useEffect, useRef, useState } from 'react'
import { APPS, fillColor, getApp, rectFor } from '../apps/registry'
import type { AppId, Bounds, Rect, Win } from '../wm/reducer'
import { useWM } from '../wm/store'
import { Window } from '../wm/Window'
import { WMProvider } from '../wm/WMProvider'
import { DesktopIcons } from './DesktopIcons'
import { Dock } from './Dock'
import { MenuBar } from './MenuBar'
import { OpenAppContext } from './openApp'
import { Pet } from './Pet'
import './shell.css'
import { StickyContext } from './stickies'
import { Sticky } from './Sticky'
import type { StickyNote } from './Sticky'
import { playZoom } from './zoom'
import type { Box } from './zoom'

const MENU_H = 32
const DOCK_RESERVE = 84
const ENTRANCE_DELAY_MS = 450
const ENTRANCE_STAGGER_MS = 170

/** 'none': windows are simply there. 'wait': hold everything back. 'go': unpack the desktop. */
export type Entrance = 'none' | 'wait' | 'go'

function measure(): Bounds {
  return { w: window.innerWidth, h: window.innerHeight - MENU_H - DOCK_RESERVE }
}

const START_APPS = APPS.filter((app) => app.openOnStart)

function startWindows(bounds: Bounds): Win[] {
  return START_APPS.map((app, i) => ({ id: app.id, rect: rectFor(app, bounds), z: i + 1, zoomed: false }))
}

function toViewport(rect: Rect): Box {
  return { left: rect.x, top: rect.y + MENU_H, width: rect.w, height: rect.h }
}

/** Where an app "lives" on screen: its dock or desktop icon, else the hard disk. */
function homeOf(id: AppId): Box | null {
  const el = document.querySelector(`[data-app="${id}"]`) ?? document.querySelector('[data-app="hd"]')
  return el?.getBoundingClientRect() ?? null
}

interface Props {
  entrance: Entrance
  onRestartIntro: () => void
  onShutDown: () => void
}

function DesktopInner({ bounds, entrance, onRestartIntro, onShutDown }: Props & { bounds: Bounds }) {
  const { windows, dispatch } = useWM()
  const [stickies, setStickies] = useState<StickyNote[]>([])
  const live = useRef({ windows, bounds })
  const nextSticky = useRef(1)

  useEffect(() => {
    live.current = { windows, bounds }
  })

  useEffect(() => {
    dispatch({ type: 'clampAll', bounds })
  }, [bounds, dispatch])

  const openFrom = useCallback(
    (id: AppId, from: Box | null, param?: string) => {
      const rect = rectFor(getApp(id), live.current.bounds)
      const open = () => dispatch({ type: 'open', id, rect, param })
      if (!from || live.current.windows.some((w) => w.id === id)) open()
      else playZoom(from, toViewport(rect), open)
    },
    [dispatch],
  )

  const openApp = useCallback((id: AppId, param?: string) => openFrom(id, homeOf(id), param), [openFrom])

  const closeApp = (win: Win) => {
    dispatch({ type: 'close', id: win.id })
    const home = homeOf(win.id)
    if (home) playZoom(toViewport(win.rect), home)
  }

  // Unpack the desktop out of the hard disk, one window at a time.
  useEffect(() => {
    if (entrance !== 'go') return
    dispatch({ type: 'closeAll' })
    const timers = START_APPS.map((app, i) =>
      window.setTimeout(() => openFrom(app.id, homeOf('hd')), ENTRANCE_DELAY_MS + i * ENTRANCE_STAGGER_MS),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [entrance, dispatch, openFrom])

  const addSticky = useCallback((text: string, x: number, y: number) => {
    setStickies((list) => [...list, { id: nextSticky.current++, text, x: x - 70, y: y - MENU_H - 20 }])
  }, [])

  return (
    <OpenAppContext value={openApp}>
      <StickyContext value={addSticky}>
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
              <Window
                key={win.id}
                win={win}
                title={app.title}
                fill={fillColor(app.fill)}
                bounds={bounds}
                onClose={() => closeApp(win)}
              >
                <App param={win.param} />
              </Window>
            )
          })}
          {stickies.map((note) => (
            <Sticky
              key={note.id}
              note={note}
              onRemove={() => setStickies((list) => list.filter((n) => n.id !== note.id))}
            />
          ))}
          {entrance !== 'wait' && <Pet windows={windows} bounds={bounds} areaH={bounds.h + DOCK_RESERVE} />}
        </main>
        <Dock />
      </StickyContext>
    </OpenAppContext>
  )
}

export function Desktop(props: Props) {
  const [bounds, setBounds] = useState(measure)
  // decided once: a visitor who gets the entrance starts with an empty desktop
  const [initial] = useState(() => (props.entrance === 'none' ? startWindows(measure()) : []))

  useEffect(() => {
    const onResize = () => setBounds(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className={`desktop checker entrance-${props.entrance}`}>
      <WMProvider initial={initial}>
        <DesktopInner bounds={bounds} {...props} />
      </WMProvider>
    </div>
  )
}

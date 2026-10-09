import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { APPS, fillColor, getApp, rectFor } from '../apps/registry'
import { content } from '../content'
import { prefersReducedMotion } from '../motion'
import { TITLE_H } from '../wm/reducer'
import type { AppId, Bounds, Win } from '../wm/reducer'
import { useWM } from '../wm/store'
import { Window } from '../wm/Window'
import { WMProvider } from '../wm/WMProvider'
import { DesktopIcons } from './DesktopIcons'
import { Dock } from './Dock'
import { GRAVITY_EVENT } from './events'
import { MenuBar } from './MenuBar'
import { OpenAppContext } from './openApp'
import { Pet } from './Pet'
import './shell.css'
import { StickyContext } from './stickies'
import { Sticky } from './Sticky'
import type { StickyNote } from './Sticky'
import { popIn, popOut } from './zoom'
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

function windowEl(id: AppId): HTMLElement | null {
  return document.querySelector(`[data-win="${id}"]`)
}

/** The note that is on the desktop from the start, placed under the icon column. */
function homageNote(bounds: Bounds): StickyNote {
  return {
    id: 0,
    text: content.homage,
    x: Math.max(12, bounds.w - 236),
    y: Math.min(600, bounds.h + DOCK_RESERVE - 180),
    wide: true,
  }
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
  const [stickies, setStickies] = useState<StickyNote[]>(() => [homageNote(bounds)])
  const arriving = useRef(new Map<AppId, Box>())
  const leaving = useRef(new Set<AppId>())
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
      const isNew = !live.current.windows.some((w) => w.id === id)
      if (from && isNew) arriving.current.set(id, from)
      dispatch({ type: 'open', id, rect: rectFor(getApp(id), live.current.bounds), param })
    },
    [dispatch],
  )

  const openApp = useCallback(
    (id: AppId, param?: string, origin?: Element) =>
      openFrom(id, origin?.getBoundingClientRect() ?? homeOf(id), param),
    [openFrom],
  )

  // a window that was just opened grows out of its icon
  useLayoutEffect(() => {
    for (const [id, from] of arriving.current) {
      const el = windowEl(id)
      if (el) popIn(el, from)
    }
    arriving.current.clear()
  }, [windows])

  // and shrinks back into it when closed
  const closeApp = (id: AppId) => {
    const el = windowEl(id)
    const home = homeOf(id)
    if (leaving.current.has(id)) return
    if (!el || !home) {
      dispatch({ type: 'close', id })
      return
    }
    leaving.current.add(id)
    popOut(el, home, () => {
      leaving.current.delete(id)
      dispatch({ type: 'close', id })
    })
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

  // `rm -rf /` in the terminal: every window drops to the floor, then the desktop is restored.
  useEffect(() => {
    let frame = 0
    let restore = 0
    const onGravity = () => {
      const { windows: saved, bounds: b } = live.current
      if (saved.length === 0 || frame || prefersReducedMotion()) return
      const bodies = saved.map((win, i) => ({
        win,
        y: win.rect.y,
        speed: 0,
        delay: i * 5,
        floor: Math.max(win.rect.y, b.h + DOCK_RESERVE - win.rect.h - 4),
        resting: false,
      }))
      frame = window.setInterval(() => {
        for (const body of bodies) {
          if (body.resting || body.delay-- > 0) continue
          body.speed += 2.4
          body.y += body.speed
          if (body.y >= body.floor) {
            body.y = body.floor
            if (body.speed > 8) body.speed *= -0.35
            else body.resting = true
          }
          dispatch({
            type: 'move',
            id: body.win.id,
            x: body.win.rect.x,
            y: body.y,
            bounds: { w: b.w, h: body.floor + TITLE_H },
          })
        }
        if (bodies.every((body) => body.resting)) {
          window.clearInterval(frame)
          restore = window.setTimeout(() => {
            frame = 0
            dispatch({ type: 'reset', windows: saved })
          }, 1300)
        }
      }, 16)
    }
    window.addEventListener(GRAVITY_EVENT, onGravity)
    return () => {
      window.removeEventListener(GRAVITY_EVENT, onGravity)
      window.clearInterval(frame)
      window.clearTimeout(restore)
    }
  }, [dispatch])

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
                onClose={() => closeApp(win.id)}
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

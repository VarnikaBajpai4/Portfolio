import { useEffect, useRef, useState } from 'react'
import { getApp, rectFor } from '../apps/registry'
import { Portrait } from '../icons/Portrait'
import { PALETTES, usePalette } from '../theme'
import type { Bounds } from '../wm/reducer'
import { useWM } from '../wm/store'
import { useOpenApp } from './openApp'

interface Item {
  label: string
  onSelect?: () => void
  href?: string
  disabled?: boolean
  checked?: boolean
}

interface MenuDef {
  id: string
  label: string
  face?: boolean
  items: Item[]
}

interface Props {
  bounds: Bounds
  onCleanUp: () => void
  onRestartIntro: () => void
  onShutDown: () => void
}

export const STANDARD_URL = `${import.meta.env.BASE_URL}standard/`

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function MenuBar({ bounds, onCleanUp, onRestartIntro, onShutDown }: Props) {
  const { dispatch, topId } = useWM()
  const openApp = useOpenApp()
  const [palette, setPalette] = usePalette()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLElement>(null)
  const clock = useClock()

  useEffect(() => {
    if (!openMenu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      barRef.current?.querySelector<HTMLElement>(`[data-menu="${openMenu}"]`)?.focus()
      setOpenMenu(null)
    }
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [openMenu])

  const menus: MenuDef[] = [
    {
      id: 'face',
      label: 'Varnika menu',
      face: true,
      items: [
        { label: 'About Varnika', onSelect: () => openApp('about') },
        { label: 'Standard View', href: STANDARD_URL },
        { label: 'Restart Intro', onSelect: onRestartIntro },
      ],
    },
    {
      id: 'file',
      label: 'File',
      items: [
        {
          label: 'Close Window',
          disabled: !topId,
          onSelect: () => topId && dispatch({ type: 'close', id: topId }),
        },
        { label: 'Close All', onSelect: () => dispatch({ type: 'closeAll' }) },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: ['Undo', 'Cut', 'Copy', 'Paste'].map((label) => ({ label, disabled: true })),
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Clean Up Windows', onSelect: onCleanUp },
        ...PALETTES.map((p) => ({
          label: p.label,
          checked: p.id === palette,
          onSelect: () => setPalette(p.id),
        })),
      ],
    },
    {
      id: 'special',
      label: 'Special',
      items: [
        {
          label: 'Open Terminal',
          onSelect: () => dispatch({ type: 'open', id: 'terminal', rect: rectFor(getApp('terminal'), bounds) }),
        },
        { label: 'Shut Down', onSelect: onShutDown },
      ],
    },
  ]

  return (
    <header className="menubar" ref={barRef}>
      {menus.map((menu) => (
        <div key={menu.id} className="menu">
          <button
            type="button"
            className={`menu-button${menu.face ? ' menu-face' : ''}`}
            data-menu={menu.id}
            aria-label={menu.face ? menu.label : undefined}
            aria-haspopup="menu"
            aria-expanded={openMenu === menu.id}
            onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
            onPointerEnter={() => openMenu && setOpenMenu(menu.id)}
          >
            {menu.face ? <Portrait size={22} /> : menu.label}
          </button>
          {openMenu === menu.id && (
            <div className="menu-list" role="menu" aria-label={menu.label}>
              {menu.items.map((item) =>
                item.href ? (
                  <a key={item.label} role="menuitem" className="menu-item" href={item.href}>
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    role="menuitem"
                    className="menu-item"
                    disabled={item.disabled}
                    onClick={() => {
                      setOpenMenu(null)
                      item.onSelect?.()
                    }}
                  >
                    <span className="menu-check">{item.checked ? '✓' : ''}</span>
                    {item.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}

      <div className="menubar-right">
        <div className="swatches" role="group" aria-label="Colour palette">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className="swatch"
              style={{ background: p.swatch }}
              aria-label={`Palette: ${p.label}`}
              aria-pressed={p.id === palette}
              title={p.label}
              onClick={() => setPalette(p.id)}
            />
          ))}
        </div>
        <a className="btn standard-link" href={STANDARD_URL}>
          Standard View
        </a>
        <span className="clock">{clock}</span>
      </div>
    </header>
  )
}

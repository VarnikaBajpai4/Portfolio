import { useEffect, useRef, useState } from 'react'
import { getApp, rectFor } from '../apps/registry'
import { track } from '../analytics'
import { content } from '../content'
import { PixelGrid } from '../icons/PixelGrid'
import { Portrait } from '../icons/Portrait'
import { PALETTES, usePalette } from '../theme'
import type { Bounds } from '../wm/reducer'
import { useWM } from '../wm/store'
import { askPet } from './events'
import { STANDARD_URL } from './links'
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
  /** how many paw prints are on the desktop */
  paws: number
  onPastePaw: () => void
  onUndoPaw: () => void
  onClearPaws: () => void
  onRestartIntro: () => void
  onShutDown: () => void
}

// a heart of the Overworld theme: K outline, R red, W shine
const HEART = ['.KK.KK.', 'KRWKRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...']
const HEART_LEGEND = { K: '#000000', R: '#e0312b', W: '#ffffff' }

// the square sun and moon of the Overworld theme
const SUN = ['YYYYY', 'YWWWY', 'YWWWY', 'YWWWY', 'YYYYY']
const MOON = ['WWWWW', 'WGWWW', 'WWWGW', 'WWGWW', 'WWWWW']
const SKY_LEGEND = { Y: '#f2c94c', W: '#fff6c9', G: '#b9bfd0' }

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const hour = now.getHours()
  return { clock: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), day: hour >= 6 && hour < 18 }
}

export function MenuBar({ bounds, onCleanUp, paws, onPastePaw, onUndoPaw, onClearPaws, onRestartIntro, onShutDown }: Props) {
  const { dispatch, topId } = useWM()
  const openApp = useOpenApp()
  const [palette, setPalette] = usePalette()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const barRef = useRef<HTMLElement>(null)
  const { clock, day } = useClock()

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

  const copyEmail = () => {
    const { email } = content.identity
    track('copy_email')
    // the clipboard can be blocked: then Chindi reads the address out
    const copied = navigator.clipboard?.writeText(email) ?? Promise.reject(new Error('no clipboard'))
    copied.then(
      () => askPet({ say: 'Copied. Now write to her.' }),
      () => askPet({ say: email }),
    )
  }

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
      // the usual words of an Edit menu, each with a small job of its own
      items: [
        { label: 'Undo Paw Print', disabled: paws === 0, onSelect: onUndoPaw },
        { label: 'Copy My Email', onSelect: copyEmail },
        { label: 'Paste Paw Print', onSelect: onPastePaw },
        { label: 'Clear Paw Prints', disabled: paws === 0, onSelect: onClearPaws },
      ],
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
        {/* shown by the Overworld theme only */}
        <span className="hearts" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <PixelGrid key={i} rows={HEART} legend={HEART_LEGEND} size={14} />
          ))}
        </span>
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
        {/* the Overworld theme shows the sun by day and the moon by night */}
        <span className="sky" aria-hidden="true">
          <PixelGrid rows={day ? SUN : MOON} legend={day ? SKY_LEGEND : { ...SKY_LEGEND, W: '#e6e9f2' }} size={14} />
        </span>
        <span className="clock">{clock}</span>
      </div>
    </header>
  )
}

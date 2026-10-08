import { useCallback, useState } from 'react'
import { APPS, fillColor, getApp, iconFill } from '../apps/registry'
import { Icon } from '../icons/Icon'
import { Portrait } from '../icons/Portrait'
import { PALETTES, usePalette } from '../theme'
import type { AppId } from '../wm/reducer'
import { STANDARD_URL } from './links'
import { OpenAppContext } from './openApp'
import './shell.css'

interface Open {
  id: AppId
  param?: string
}

export function MobileShell() {
  const [open, setOpen] = useState<Open | null>(null)
  const [palette, setPalette] = usePalette()

  // the hard disk is the home grid on a phone
  const openApp = useCallback((id: AppId, param?: string) => setOpen(id === 'hd' ? null : { id, param }), [])

  const app = open ? getApp(open.id) : null
  const App = app?.component
  const tiles = APPS.filter((a) => a.id !== 'hd')

  return (
    <OpenAppContext value={openApp}>
      <div className="mobile checker">
        <header className="m-bar">
          <Portrait size={22} />
          <div className="swatches" role="group" aria-label="Colour palette">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                className="swatch"
                style={{ background: p.swatch }}
                aria-label={`Palette: ${p.label}`}
                aria-pressed={p.id === palette}
                onClick={() => setPalette(p.id)}
              />
            ))}
          </div>
          <a className="btn standard-link" href={STANDARD_URL}>
            Standard View
          </a>
        </header>

        <main className="m-win px-border px-shadow" aria-label={app ? app.title : 'Varnika Bajpai'}>
          <div className="m-title">
            {app && (
              <button type="button" className="btn m-back" onClick={() => setOpen(null)}>
                Back
              </button>
            )}
            <h1>{app ? app.title : 'Varnika Bajpai'}</h1>
          </div>
          <div className="m-body" style={{ background: app ? fillColor(app.fill) : 'var(--c1)' }}>
            {App ? (
              <App param={open?.param} />
            ) : (
              <ul className="m-grid">
                {tiles.map((a) => (
                  <li key={a.id}>
                    <button type="button" className="icon-tile" onClick={() => openApp(a.id)}>
                      <Icon name={a.icon} size={44} fill={a.fill === 'c1' ? 'var(--c3)' : iconFill(a)} />
                      <span className="chip">{a.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>

        <nav className="m-dock px-border px-shadow" aria-label="Dock">
          {APPS.filter((a) => a.dock).map((a) => (
            <button
              key={a.id}
              type="button"
              className="dock-item"
              aria-label={a.title}
              aria-current={open?.id === a.id ? 'page' : undefined}
              onClick={() => openApp(a.id)}
            >
              <Icon name={a.icon} size={30} fill={iconFill(a)} />
            </button>
          ))}
        </nav>
      </div>
    </OpenAppContext>
  )
}

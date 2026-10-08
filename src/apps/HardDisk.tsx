import { Icon } from '../icons/Icon'
import { useOpenApp } from '../shell/openApp'
import { APPS, iconFill } from './registry'

export function HardDisk() {
  const openApp = useOpenApp()
  const apps = APPS.filter((app) => app.id !== 'hd')
  return (
    <div className="app-pad">
      <p className="list-count">{apps.length} items</p>
      <ul className="icon-grid">
        {apps.map((app) => (
          <li key={app.id}>
            <button type="button" className="icon-tile" onClick={() => openApp(app.id)}>
              <Icon name={app.icon} size={40} fill={app.fill === 'c4' ? 'var(--c3)' : iconFill(app)} />
              <span className="chip">{app.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

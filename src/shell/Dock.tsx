import { APPS, iconFill } from '../apps/registry'
import { Icon } from '../icons/Icon'
import { useOpenApp } from './openApp'

export function Dock() {
  const openApp = useOpenApp()
  return (
    <nav className="dock" aria-label="Dock">
      {APPS.filter((app) => app.dock).map((app) => (
        <button
          key={app.id}
          type="button"
          className="dock-item"
          aria-label={app.title}
          data-app={app.id}
          onClick={() => openApp(app.id)}
        >
          <Icon name={app.icon} size={32} fill={iconFill(app)} />
          <span className="dock-tip" aria-hidden="true">
            {app.title}
          </span>
        </button>
      ))}
    </nav>
  )
}

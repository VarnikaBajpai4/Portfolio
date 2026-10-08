import { APPS, iconFill } from '../apps/registry'
import { Icon } from '../icons/Icon'
import { useOpenApp } from './openApp'

export function DesktopIcons() {
  const openApp = useOpenApp()
  return (
    <nav className="desk-icons" aria-label="Desktop">
      {APPS.filter((app) => app.desktop).map((app) => (
        <button
          key={app.id}
          type="button"
          className="desk-icon"
          title="Double-click to open"
          onDoubleClick={() => openApp(app.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openApp(app.id)
            }
          }}
        >
          <Icon name={app.icon} size={40} fill={iconFill(app)} />
          <span className="chip">{app.title}</span>
        </button>
      ))}
    </nav>
  )
}

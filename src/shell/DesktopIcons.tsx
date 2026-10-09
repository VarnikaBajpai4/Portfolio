import { DESKTOP_ICONS, getApp, iconFill } from '../apps/registry'
import { Icon } from '../icons/Icon'
import { useOpenApp } from './openApp'

export function DesktopIcons() {
  const openApp = useOpenApp()
  return (
    <nav className="desk-icons" aria-label="Desktop">
      {DESKTOP_ICONS.map((item) => {
        const app = getApp(item.app)
        const label = item.label ?? app.title
        return (
          <button
            key={label}
            type="button"
            className="desk-icon"
            title="Double-click to open"
            // a shortcut is not the app's home, so only real icons are marked
            data-app={item.label ? undefined : app.id}
            onDoubleClick={(e) => openApp(app.id, undefined, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openApp(app.id, undefined, e.currentTarget)
              }
            }}
          >
            <Icon name={item.icon ?? app.icon} size={40} fill={item.fill ?? iconFill(app)} />
            <span className="chip">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

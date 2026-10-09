import type { ComponentType } from 'react'
import type { IconName } from '../icons/Icon'
import { clampRect } from '../wm/reducer'
import type { AppId, Bounds, Rect } from '../wm/reducer'
import { About } from './About'
import { Achievements } from './Achievements'
import './apps.css'
import { Contact } from './Contact'
import { HardDisk } from './HardDisk'
import { NotePad } from './NotePad'
import { Projects } from './Projects'
import { Resume } from './Resume'
import { Terminal } from './Terminal'
import { Trash } from './Trash'
import { Community, Work } from './Work'

export type Fill = 'c1' | 'c2' | 'c3' | 'c4' | 'paper' | 'ink'

export interface AppDef {
  id: AppId
  title: string
  icon: IconName
  component: ComponentType<{ param?: string }>
  /** default size in px */
  size: { w: number; h: number }
  /** default top-left corner as a fraction of the bounds */
  pos: { x: number; y: number }
  fill: Fill
  dock?: boolean
  openOnStart?: boolean
}

// The dock follows the order of this list.
export const APPS: AppDef[] = [
  { id: 'about', title: 'About Varnika', icon: 'face', component: About, size: { w: 520, h: 352 }, pos: { x: 0.03, y: 0.04 }, fill: 'c1', dock: true, openOnStart: true },
  { id: 'work', title: 'Work', icon: 'work', component: Work, size: { w: 760, h: 520 }, pos: { x: 0.2, y: 0.06 }, fill: 'c4', dock: true },
  { id: 'projects', title: 'Projects', icon: 'folder', component: Projects, size: { w: 560, h: 230 }, pos: { x: 0.06, y: 0.59 }, fill: 'c2', dock: true, openOnStart: true },
  { id: 'achievements', title: 'Achievements', icon: 'star', component: Achievements, size: { w: 420, h: 280 }, pos: { x: 0.3, y: 0.18 }, fill: 'c3', dock: true },
  { id: 'terminal', title: 'Terminal', icon: 'terminal', component: Terminal, size: { w: 400, h: 250 }, pos: { x: 0.56, y: 0.485 }, fill: 'ink', dock: true, openOnStart: true },
  { id: 'contact', title: 'Contact', icon: 'mail', component: Contact, size: { w: 340, h: 240 }, pos: { x: 0.4, y: 0.24 }, fill: 'c1', dock: true },
  { id: 'hd', title: 'Varnika HD', icon: 'hd', component: HardDisk, size: { w: 480, h: 320 }, pos: { x: 0.2, y: 0.2 }, fill: 'c4' },
  { id: 'resume', title: 'Resume', icon: 'doc', component: Resume, size: { w: 540, h: 520 }, pos: { x: 0.34, y: 0.06 }, fill: 'paper' },
  { id: 'trash', title: 'Trash', icon: 'trash', component: Trash, size: { w: 400, h: 260 }, pos: { x: 0.36, y: 0.3 }, fill: 'paper' },
  { id: 'notepad', title: 'Note Pad', icon: 'note', component: NotePad, size: { w: 380, h: 280 }, pos: { x: 0.5, y: 0.04 }, fill: 'c3', openOnStart: true },
  { id: 'community', title: 'Community', icon: 'people', component: Community, size: { w: 460, h: 300 }, pos: { x: 0.26, y: 0.16 }, fill: 'c2' },
]

export function getApp(id: AppId): AppDef {
  const app = APPS.find((a) => a.id === id)
  if (!app) throw new Error(`Unknown app: ${id}`)
  return app
}

export function fillColor(fill: Fill): string {
  return fill === 'ink' ? '#111111' : `var(--${fill})`
}

/** Icon accent for an app; the resume gets a different tint so the two documents differ. */
export function iconFill(app: AppDef): string {
  if (app.id === 'resume') return 'var(--c4)'
  if (app.fill === 'ink') return 'var(--c1)'
  return fillColor(app.fill)
}

export function rectFor(app: AppDef, bounds: Bounds): Rect {
  return clampRect(
    { x: Math.round(app.pos.x * bounds.w), y: Math.round(app.pos.y * bounds.h), ...app.size },
    bounds,
  )
}

/** Icons on the desktop, top to bottom. A shortcut may open an app under another name. */
export const DESKTOP_ICONS: { app: AppId; label?: string; icon?: IconName; fill?: string }[] = [
  { app: 'hd' },
  { app: 'about', label: 'Read Me', icon: 'doc', fill: 'var(--paper)' },
  { app: 'resume' },
  { app: 'trash' },
]

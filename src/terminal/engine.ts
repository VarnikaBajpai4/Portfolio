import { content } from '../content'
import { isPaletteId, PALETTES } from '../theme'
import type { PaletteId } from '../theme'
import { APP_IDS } from '../wm/reducer'
import type { AppId } from '../wm/reducer'

export type TermAction =
  | { type: 'open'; app: AppId; param?: string }
  | { type: 'theme'; palette: PaletteId }
  | { type: 'clear' }

export interface TermResult {
  lines: string[]
  action?: TermAction
}

const HELP = [
  'whoami         who is this?',
  'skills         what I work with',
  'experience     where I have worked',
  'achievements   things I am proud of',
  'contact        how to reach me',
  'ls projects/   list my projects',
  'open <name>    open an app or a project',
  'theme <name>   sorbet, cocoa or blueberry',
  'clear          clear the screen',
]

const projectIds = content.projects.map((p) => p.id)

function isAppId(v: string): v is AppId {
  return (APP_IDS as readonly string[]).includes(v)
}

function open(name: string | undefined): TermResult {
  if (!name) {
    return { lines: ['usage: open <name>', `apps: ${APP_IDS.join(' ')}`, `projects: ${projectIds.join(' ')}`] }
  }
  if (isAppId(name)) return { lines: [`opening ${name}...`], action: { type: 'open', app: name } }
  if (projectIds.includes(name)) {
    return { lines: [`opening ${name}...`], action: { type: 'open', app: 'projects', param: name } }
  }
  return { lines: [`open: no such app or project: ${name}`] }
}

function theme(name: string | undefined): TermResult {
  if (name && isPaletteId(name)) return { lines: [`theme set to ${name}`], action: { type: 'theme', palette: name } }
  return { lines: [`usage: theme <${PALETTES.map((p) => p.id).join('|')}>`] }
}

export function runCommand(input: string): TermResult {
  const words = input.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const [cmd, arg] = words
  if (!cmd) return { lines: [] }

  switch (cmd) {
    case 'help':
      return { lines: HELP }
    case 'whoami':
      return { lines: [`${content.identity.name}: ${content.identity.role}`, content.identity.tagline] }
    case 'skills':
      return {
        lines: [
          ...content.skills.map(
            (s) => `${s.name.padEnd(11)}${'#'.repeat(s.level)}${'.'.repeat(10 - s.level)} ${s.level}/10`,
          ),
          `also: ${content.tools.join(', ')}`,
        ],
      }
    case 'experience':
      return { lines: content.work.map((job) => `${job.org}, ${job.role} (${job.period})`) }
    case 'achievements':
      return { lines: content.achievements.map((a) => `* ${a.title}`) }
    case 'contact':
      return { lines: content.links.map((link) => `${link.label}: ${link.href.replace('mailto:', '')}`) }
    case 'ls':
      if (!arg) return { lines: ['projects/'] }
      if (arg === 'projects' || arg === 'projects/') return { lines: [projectIds.join(' ')] }
      return { lines: [`ls: no such directory: ${arg}`] }
    case 'open':
      return open(arg)
    case 'theme':
      return theme(arg)
    case 'clear':
      return { lines: [], action: { type: 'clear' } }
    case 'sudo':
      if (words.slice(1).join(' ') === 'hire varnika') {
        return { lines: ['Permission granted. Excellent decision.', `Next step: ${content.identity.email}`] }
      }
      return { lines: ['Nice try.'] }
    default:
      return { lines: [`command not found: ${cmd}. Type 'help'.`] }
  }
}

import { content } from '../content'
import { isPaletteId, PALETTES } from '../theme'
import type { PaletteId } from '../theme'
import { APP_IDS } from '../wm/reducer'
import type { AppId } from '../wm/reducer'

export type TermAction =
  | { type: 'open'; app: AppId; param?: string }
  | { type: 'theme'; palette: PaletteId }
  | { type: 'clear' }
  | { type: 'pet'; say?: string; goto?: AppId }
  | { type: 'gravity' }
  | { type: 'python' }

export interface TermResult {
  lines: string[]
  /** show the portrait beside these lines */
  portrait?: boolean
  action?: TermAction
}

const HELP = [
  'whoami           who is this?',
  'neofetch         the short version, with a face',
  'skills           what I work with',
  'experience       where I have worked',
  'git log          my career, as commits',
  'achievements     things I am proud of',
  'top              what is running right now',
  'contact          how to reach me',
  'ls               look around',
  'cat readme.txt   read the read me',
  'open <name>      open an app or a project',
  'python           a real Python prompt',
  'catsay <text>    make Chindi say it',
  'theme <name>     sorbet, cocoa or blueberry',
  'clear            clear the screen',
  '',
  'Tab completes. Some commands are not on this list.',
]

const GIT_LOG = [
  '* 9f4c2e1 (HEAD -> main) feat: join Barclays as Software Engineer',
  '* 7b1d0a8 feat: graduate with a silver medal, rank 2, CGPA 9.66',
  '* 5e3a9c4 feat(lyb): ship automated SAP testing pipeline on AWS',
  '* 4c8f7d2 feat: OmniCompiler, final-year project and paper',
  '* 3a6e1b9 feat(barclays): ML log classifier, earn the PPO',
  '* 2d9b5f3 feat: UBI Bharosa, 2nd runner-up of 500+ teams',
  '* 1c7a4e6 feat(gsquare): first data project, shipped end to end',
  '* 0b2f8d5 chore: start BTech in IT at KJ Somaiya',
  '* 0000002 feat: national-level swimming',
  '* 0000001 init: ballet shoes',
]

const TOP = [
  'PID  COMMAND          %CPU',
  '  1  barclays         38.0',
  '  2  gym              21.5',
  '  3  side-projects    14.0',
  '  4  reading          11.0',
  '  5  football          6.5',
  '  6  baking            5.0',
  '  7  painting          4.0',
  '  8  chindi           99.9  (always)',
]

const FILES = ['readme.txt']
const projectIds = content.projects.map((p) => p.id)

/** Top-level commands, for Tab completion. */
export const COMMANDS = [
  'help',
  'whoami',
  'neofetch',
  'skills',
  'experience',
  'git',
  'achievements',
  'top',
  'contact',
  'ls',
  'cat',
  'open',
  'python',
  'catsay',
  'theme',
  'clear',
]

/** What can follow a command, for Tab completion. */
export function argumentsFor(command: string): string[] {
  switch (command) {
    case 'open':
      return [...APP_IDS, ...projectIds]
    case 'theme':
      return PALETTES.map((p) => p.id)
    case 'cat':
      return FILES
    case 'ls':
      return ['projects/']
    case 'git':
      return ['log', 'status']
    default:
      return []
  }
}

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

function neofetch(): TermResult {
  const years = new Date().getFullYear() - 2022
  return {
    portrait: true,
    lines: [
      'varnika@portfolio',
      '-----------------',
      `Role:    ${content.identity.role}`,
      'Degree:  BTech IT, Honours in AI',
      'Medal:   Silver, rank 2, CGPA 9.66',
      `Speaks:  ${content.languages.join(', ')}`,
      'Stack:   ML, LLMs, MLOps',
      `Uptime:  ${years} years of engineering`,
      'Before:  ballerina, national-level swimmer',
      'Cat:     Chindi',
    ],
  }
}

export function runCommand(input: string): TermResult {
  const raw = input.trim()
  const words = raw.toLowerCase().split(/\s+/).filter(Boolean)
  const [cmd, arg] = words
  if (!cmd) return { lines: [] }

  switch (cmd) {
    case 'help':
      return { lines: HELP }
    case 'whoami':
      return { lines: [`${content.identity.name}: ${content.identity.role}`, content.identity.headline] }
    case 'neofetch':
      return neofetch()
    case 'skills':
      return {
        lines: [`languages:  ${content.languages.join(', ')}`, `works with: ${content.tools.join(', ')}`],
      }
    case 'experience':
      return { lines: content.work.map((job) => `${job.org}, ${job.role} (${job.period})`) }
    case 'achievements':
      return { lines: content.achievements.map((a) => `* ${a.title}`) }
    case 'contact':
      return { lines: content.links.map((link) => `${link.label}: ${link.href.replace('mailto:', '')}`) }
    case 'top':
      return { lines: TOP }
    case 'git':
      if (arg === 'log') return { lines: GIT_LOG }
      if (arg === 'status') return { lines: ['On branch main', 'nothing to commit, working tree clean (for once)'] }
      return { lines: ["git: try 'git log'"] }
    case 'ls':
      if (!arg) return { lines: [`projects/  ${FILES.join('  ')}`] }
      if (arg === 'projects' || arg === 'projects/') return { lines: [projectIds.join(' ')] }
      return { lines: [`ls: no such directory: ${arg}`] }
    case 'cat':
      if (!arg) return { lines: ['usage: cat <file>'], action: { type: 'pet', say: 'You called?' } }
      if (arg === 'readme.txt') {
        return { lines: content.readMe, action: { type: 'pet', goto: 'terminal', say: 'Mrrp.' } }
      }
      return { lines: [`cat: no such file: ${arg}`] }
    case 'catsay': {
      const text = raw.slice(cmd.length).trim()
      if (!text) return { lines: ['usage: catsay <text>'] }
      return { lines: [`Chindi says: ${text}`], action: { type: 'pet', say: text.slice(0, 60) } }
    }
    case 'open':
      return open(arg)
    case 'python':
    case 'python3':
      return { lines: [], action: { type: 'python' } }
    case 'theme':
      return theme(arg)
    case 'clear':
      return { lines: [], action: { type: 'clear' } }
    case 'rm':
      if (words.includes('-rf') && words.includes('/')) {
        return {
          lines: ['rm: removing everything...', 'Just kidding. Nothing was harmed.'],
          action: { type: 'gravity' },
        }
      }
      return { lines: ['rm: permission denied'] }
    case 'sudo':
      if (words.slice(1).join(' ') === 'hire varnika') {
        return { lines: ['Permission granted. Excellent decision.', `Next step: ${content.identity.email}`] }
      }
      return { lines: ['Nice try.'] }
    default:
      return { lines: [`command not found: ${cmd}. Type 'help'.`] }
  }
}

/** Complete the word being typed. Returns the new input, or the candidates when there are several. */
export function complete(input: string): { value: string } | { options: string[] } | null {
  const parts = input.replace(/^\s+/, '').split(/\s+/)
  const pool = parts.length === 1 ? COMMANDS : parts.length === 2 ? argumentsFor(parts[0].toLowerCase()) : []
  const word = parts[parts.length - 1].toLowerCase()
  const matches = pool.filter((candidate) => candidate.startsWith(word))
  if (matches.length === 0) return null
  if (matches.length > 1) return { options: matches }
  const needsSpace = parts.length === 1 && argumentsFor(matches[0]).length > 0
  return { value: [...parts.slice(0, -1), matches[0]].join(' ') + (needsSpace ? ' ' : '') }
}

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const terminal = (page: Page) => page.getByRole('dialog', { name: 'Terminal', exact: true })

async function run(page: Page, command: string) {
  const input = page.getByLabel('Terminal input')
  await input.fill(command)
  await input.press('Enter')
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
})

test('help lists the commands', async ({ page }) => {
  await run(page, 'help')
  await expect(terminal(page)).toContainText('whoami')
})

test('ls projects/ lists every project', async ({ page }) => {
  await run(page, 'ls projects/')
  await expect(terminal(page)).toContainText('omnicompiler floatchat bharosa symbiote malshield')
})

test('open <project> shows it in the Projects window', async ({ page }) => {
  await run(page, 'open omnicompiler')
  await expect(page.getByRole('dialog', { name: 'Projects' }).getByRole('heading', { name: 'OmniCompiler' })).toBeVisible()
  await run(page, 'open floatchat')
  await expect(page.getByRole('dialog', { name: 'Projects' }).getByRole('heading', { name: 'FloatChat' })).toBeVisible()
})

test('input is forgiving about case and spaces', async ({ page }) => {
  await run(page, '  OPEN   Work ')
  await expect(page.getByRole('dialog', { name: 'Work', exact: true })).toBeVisible()
})

test('empty and bad input print help instead of failing', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await run(page, '')
  await expect(terminal(page).locator('.term-in')).toHaveCount(1)
  await run(page, 'open')
  await expect(terminal(page)).toContainText('usage: open <name>')
  await run(page, 'open nope')
  await expect(terminal(page)).toContainText('no such app or project: nope')
  await run(page, 'frobnicate')
  await expect(terminal(page)).toContainText('command not found: frobnicate')
  expect(errors).toEqual([])
})

test('theme switches the palette', async ({ page }) => {
  await run(page, 'theme overworld')
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'overworld')
})

test('history and clear', async ({ page }) => {
  await run(page, 'whoami')
  const input = page.getByLabel('Terminal input')
  await input.press('ArrowUp')
  await expect(input).toHaveValue('whoami')
  await run(page, 'clear')
  await expect(terminal(page).getByRole('log').locator('p')).toHaveCount(0)
})

test('neofetch, git log and top print their reports', async ({ page }) => {
  await run(page, 'neofetch')
  await expect(terminal(page)).toContainText('varnika@portfolio')
  await expect(terminal(page)).toContainText('Cat:     Chindi')
  await run(page, 'git log')
  await expect(terminal(page)).toContainText('init: ballet shoes')
  await run(page, 'top')
  await expect(terminal(page)).toContainText('chindi           99.9')
})

test('Tab completes commands and arguments', async ({ page }) => {
  const input = page.getByLabel('Terminal input')
  await input.fill('neo')
  await input.press('Tab')
  await expect(input).toHaveValue('neofetch')
  await input.fill('open omni')
  await input.press('Tab')
  await expect(input).toHaveValue('open omnicompiler')
  await input.fill('c')
  await input.press('Tab')
  await expect(terminal(page)).toContainText('contact  cat  catsay  clear')
})

test('catsay makes Chindi speak, in meows with the words faint underneath', async ({ page }) => {
  // count the meows and record the words in place of hearing them
  await page.evaluate(() => {
    let tones = 0
    const said: string[] = []
    Object.assign(window, { tones: () => tones, said })
    window.speechSynthesis.speak = (words) => {
      // the browser keeps the volume as a 32-bit number, so round it
      said.push(`${words.text} ${words.pitch} ${words.volume.toFixed(2)}`)
    }
    const start = OscillatorNode.prototype.start
    OscillatorNode.prototype.start = function (...args) {
      tones++
      return start.apply(this, args)
    }
  })
  await run(page, 'catsay Hello There')
  await expect(page.locator('.pet-bubble')).toHaveText('Hello There')
  // one meow for each syllable, He-llo The-re, and each meow is a tone and its wobble
  await expect.poll(() => page.evaluate(() => (window as unknown as { tones: () => number }).tones())).toBe(8)
  // the words: at the highest pitch and less than full volume
  expect(await page.evaluate(() => (window as unknown as { said: string[] }).said)).toEqual(['Hello There 2 0.30'])
})

test('cat readme.txt prints the read me', async ({ page }) => {
  await run(page, 'cat readme.txt')
  await expect(terminal(page)).toContainText('homage to the retro Mac')
})

test('rm -rf / drops the windows and then restores them', async ({ page }) => {
  const about = page.getByRole('dialog', { name: 'About Varnika' })
  const before = (await about.boundingBox())!
  await run(page, 'rm -rf /')
  await expect(terminal(page)).toContainText('Just kidding.')
  await expect.poll(async () => (await about.boundingBox())!.y).toBeGreaterThan(before.y + 100)
  await expect.poll(async () => (await about.boundingBox())!.y, { timeout: 8000 }).toBe(before.y)
})

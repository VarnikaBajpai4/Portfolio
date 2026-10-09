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
  await run(page, 'theme blueberry')
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'blueberry')
})

test('history and clear', async ({ page }) => {
  await run(page, 'whoami')
  const input = page.getByLabel('Terminal input')
  await input.press('ArrowUp')
  await expect(input).toHaveValue('whoami')
  await run(page, 'clear')
  await expect(terminal(page).getByRole('log').locator('p')).toHaveCount(0)
})

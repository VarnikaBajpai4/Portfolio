import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const loader = (page: Page) => page.getByRole('progressbar', { name: 'Loading' })
const START = ['About Varnika', 'Projects', 'Note Pad', 'Terminal']

async function expectDesktop(page: Page) {
  for (const name of START) await expect(page.getByRole('dialog', { name, exact: true })).toBeVisible()
}

test('loading screen shows once per session and a click skips it', async ({ page }) => {
  await page.goto('./')
  await expect(loader(page)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Varnika Bajpai' })).toBeVisible()
  await page.mouse.click(640, 700)
  await expect(loader(page)).toHaveCount(0)
  await expectDesktop(page)

  await page.reload()
  await expectDesktop(page)
  await expect(loader(page)).toHaveCount(0)
})

test('loading screen finishes by itself and unpacks the desktop', async ({ page }) => {
  await page.goto('./')
  await expect(loader(page)).toBeVisible()
  await expect(page.getByText('Caught it.')).toBeVisible({ timeout: 4000 })
  await expect(loader(page)).toHaveCount(0, { timeout: 4000 })
  await expectDesktop(page)
})

test('no loading screen when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await expectDesktop(page)
  await expect(loader(page)).toHaveCount(0)
})

test('shut down, then restart replays the loading screen', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Shut Down' }).click()
  await expect(page.getByText('See you soon.')).toBeVisible()
  await page.getByRole('button', { name: 'Restart' }).click()
  await expect(loader(page)).toBeVisible()
  await page.mouse.click(640, 700)
  await expectDesktop(page)
})

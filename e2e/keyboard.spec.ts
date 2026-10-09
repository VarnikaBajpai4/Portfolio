import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** Press Tab until the focused element has this accessible label or text. */
async function tabTo(page: Page, name: string) {
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => {
      const el = document.activeElement
      return el ? (el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '') : ''
    })
    if (focused === name) return
  }
  throw new Error(`Tab never reached "${name}"`)
}

test('the desktop works with the keyboard alone', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')

  await tabTo(page, 'Work')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Work', exact: true })).toBeVisible()

  await tabTo(page, 'Close Work')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'Work', exact: true })).toHaveCount(0)

  await tabTo(page, 'File')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu', { name: 'File' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)

  await tabTo(page, 'Standard View')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/Portfolio\/standard\/$/)
})

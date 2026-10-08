import { expect, test } from '@playwright/test'

const WELCOME = "Welcome to Varnika's profile."

test('intro shows once and a click skips it', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByText(WELCOME)).toBeVisible()
  await page.mouse.click(640, 400)
  await expect(page.getByText(WELCOME)).toHaveCount(0)
  await expect(page.getByRole('dialog', { name: 'About Varnika' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('dialog', { name: 'About Varnika' })).toBeVisible()
  await expect(page.getByText(WELCOME)).toHaveCount(0)
})

test('intro leaves by itself', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByText(WELCOME)).toBeVisible()
  await expect(page.getByText(WELCOME)).toHaveCount(0, { timeout: 4000 })
})

test('no intro when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await expect(page.getByRole('dialog', { name: 'About Varnika' })).toBeVisible()
  await expect(page.getByText(WELCOME)).toHaveCount(0)
})

test('shut down, then restart replays the intro', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
  await page.getByRole('button', { name: 'Special' }).click()
  await page.getByRole('menuitem', { name: 'Shut Down' }).click()
  await expect(page.getByText('See you soon.')).toBeVisible()
  await page.getByRole('button', { name: 'Restart' }).click()
  await expect(page.getByText(WELCOME)).toBeVisible()
})

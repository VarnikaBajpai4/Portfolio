import { expect, test } from '@playwright/test'

test('the site works when localStorage is blocked', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.addInitScript(() => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError')
    }
    Storage.prototype.getItem = blocked
    Storage.prototype.setItem = blocked
  })

  await page.goto('./')
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible()
  await page.mouse.click(640, 400)
  await expect(page.getByRole('dialog', { name: 'About Varnika' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'sorbet')

  await page.getByRole('button', { name: 'Palette: Cocoa' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'cocoa')
  expect(errors).toEqual([])
})

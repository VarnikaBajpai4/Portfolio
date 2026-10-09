import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 } })

test('phone layout: grid, open an app, go back', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')

  const main = page.getByRole('main')
  await expect(page.getByRole('navigation', { name: 'Dock' })).toBeVisible()
  await expect(main.getByRole('button', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await main.getByRole('button', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible()
  await expect(main.getByRole('button', { name: 'OmniCompiler' })).toBeVisible()

  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Varnika Bajpai' })).toBeVisible()

  for (const name of ['About Varnika', 'Work', 'Resume', 'Terminal']) {
    await main.getByRole('button', { name, exact: true }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
    await page.getByRole('button', { name: 'Back', exact: true }).click()
  }
})

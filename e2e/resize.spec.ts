import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1440, height: 900 } })

test('windows stay reachable when the viewport shrinks', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
  const dock = page.getByRole('navigation', { name: 'Dock' })
  await dock.getByRole('button', { name: 'Work', exact: true }).click()

  await page.setViewportSize({ width: 1024, height: 600 })
  await expect(page.getByRole('dialog')).toHaveCount(5)

  const dockTop = (await dock.boundingBox())!.y
  for (const button of await page.getByRole('button', { name: /^Close / }).all()) {
    const b = (await button.boundingBox())!
    expect(b.x).toBeGreaterThanOrEqual(0)
    expect(b.x + b.width).toBeLessThanOrEqual(1024)
    expect(b.y + b.height).toBeLessThanOrEqual(dockTop)
  }

  await page.setViewportSize({ width: 700, height: 800 })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1, name: 'Varnika Bajpai' })).toBeVisible()
})

import { expect, test } from '@playwright/test'

for (const path of ['./', './standard/', './404.html']) {
  test(`${path} is served`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle('Varnika Bajpai')
  })
}

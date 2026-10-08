import { expect, test } from '@playwright/test'

test('Standard View shows every section from the content file', async ({ page }) => {
  await page.goto('./standard/')
  await expect(page.getByRole('heading', { level: 1, name: 'Varnika Bajpai' })).toBeVisible()
  for (const name of ['About', 'Skills', 'Experience', 'Projects', 'Achievements', 'Community', 'Contact']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible()
  }
  const main = page.locator('body')
  await expect(main).toContainText('9.66')
  await expect(main).toContainText('OmniCompiler')
  await expect(main).toContainText('LyondellBasell')
  await expect(main).not.toContainText('+91')
  await expect(page.getByRole('link', { name: 'Back to desktop' })).toHaveAttribute('href', /\/Portfolio\/$/)
})

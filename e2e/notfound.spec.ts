import { expect, test } from '@playwright/test'

test('the error page offers a way home', async ({ page }) => {
  await page.goto('./404.html')
  await expect(page.getByText('Sorry, a system error occurred.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Restart' })).toHaveAttribute('href', /\/Portfolio\/$/)
})

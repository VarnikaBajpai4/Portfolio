import { expect, test } from '@playwright/test'

test('Standard View shows every section from the content file', async ({ page }) => {
  await page.goto('./standard/')
  await expect(page.getByRole('heading', { level: 1, name: 'Varnika Bajpai' })).toBeVisible()
  for (const name of ['Experience', 'Education', 'Projects', 'Skills', 'Achievements', 'Community']) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible()
  }
  const main = page.locator('body')
  await expect(main).toContainText('9.66')
  await expect(main).toContainText('OmniCompiler')
  await expect(main).toContainText('LyondellBasell')
  await expect(main).not.toContainText('+91')
  // a plain document: no life story and no picture
  await expect(main).not.toContainText('ballerina')
  await expect(page.getByRole('img')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'bajpaivarnika04@gmail.com' })).toHaveAttribute('href', /^mailto:/)
  await expect(page.getByRole('link', { name: 'Back to desktop' })).toHaveAttribute('href', /^\/$/)
})

test('the resume PDF can be downloaded from the Standard View and from the Resume window', async ({ page, request }) => {
  await page.goto('./standard/')
  const href = await page.getByRole('link', { name: 'Download resume (PDF)' }).getAttribute('href')
  const file = await request.get(href!)
  expect(file.ok()).toBe(true)
  expect(file.headers()['content-type']).toContain('pdf')

  await page.goto('./')
  await page.getByRole('button', { name: 'Resume', exact: true }).dblclick()
  await expect(page.getByRole('dialog', { name: 'Resume' }).getByRole('link', { name: 'Download PDF' })).toHaveAttribute('href', href!)
})

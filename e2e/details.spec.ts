import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
})

test('About shows the headline and skills without ratings', async ({ page }) => {
  const about = page.getByRole('dialog', { name: 'About Varnika' })
  await expect(about).toContainText('Former ballerina. National-level swimmer. Silver-medallist engineer.')
  await expect(about).toContainText('I pick the hard thing on purpose.')
  for (const skill of ['Python', 'C++', 'JavaScript', 'Java', 'MLOps', 'Grafana']) {
    await expect(about.getByText(skill, { exact: true })).toBeVisible()
  }
  await expect(about).not.toContainText('/10')
})

test('Note Pad turns a page on click', async ({ page }) => {
  const pad = page.getByRole('dialog', { name: 'Note Pad' })
  await expect(pad.locator('.notepad-sheet')).toContainText('I love building new things.')
  await pad.getByRole('button', { name: 'Next page' }).click()
  await expect(pad.locator('.notepad-sheet')).not.toContainText('I love building new things.')
  await expect(pad.locator('.notepad-page')).toHaveText('2')
})

test('a page pulled off the Note Pad becomes a sticky note', async ({ page }) => {
  const pad = page.getByRole('dialog', { name: 'Note Pad' })
  const corner = (await pad.getByRole('button', { name: 'Next page' }).boundingBox())!
  await page.mouse.move(corner.x + 8, corner.y + corner.height - 8)
  await page.mouse.down()
  await page.mouse.move(corner.x + 80, corner.y - 60, { steps: 5 })
  await page.mouse.move(corner.x + 60, corner.y + 260, { steps: 5 })
  await page.mouse.up()

  const sticky = page.locator('.sticky', { hasText: 'I love building new things.' })
  await expect(sticky).toHaveCount(1)
  await expect(sticky).toContainText('I love building new things.')
  await expect(pad.locator('.notepad-page')).toHaveText('2')

  await sticky.getByRole('button', { name: 'Remove note' }).click()
  await expect(sticky).toHaveCount(0)
})

test('the homage note is on the desktop and About shows the photo', async ({ page }) => {
  await expect(page.locator('.sticky', { hasText: 'homage to the retro Mac, System 1 to 7' })).toBeVisible()
  const photo = page.getByRole('dialog', { name: 'About Varnika' }).getByRole('img', { name: 'Varnika Bajpai' })
  await expect(photo).toBeVisible()
  expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
})

test('Chindi answers when clicked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await page.getByRole('button', { name: 'Chindi the cat' }).click()
  await expect(page.locator('.pet-bubble')).toBeVisible()
})

import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const dialog = (page: Page, name: string) => page.getByRole('dialog', { name, exact: true })
const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' })
const desk = (page: Page) => page.getByRole('navigation', { name: 'Desktop' })

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('element has no bounding box')
  return b
}

async function dragTitle(page: Page, name: string, dx: number, dy: number) {
  const b = await box(dialog(page, name))
  // grab the title bar away from the close and zoom boxes
  const x = b.x + 60
  const y = b.y + 14
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 4 })
  await page.mouse.move(x + dx, y + dy, { steps: 4 })
  await page.mouse.up()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('vb.introSeen', '1'))
  await page.goto('./')
})

test('opens four windows that do not overlap', async ({ page }) => {
  const names = ['About Varnika', 'Projects', 'Note Pad', 'Terminal']
  const boxes = []
  for (const name of names) {
    await expect(dialog(page, name)).toBeVisible()
    boxes.push(await box(dialog(page, name)))
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y
      expect(apart, `${names[i]} overlaps ${names[j]}`).toBe(true)
    }
  }
})

test('every dock item opens its app', async ({ page }) => {
  for (const name of ['About Varnika', 'Work', 'Projects', 'Achievements', 'Terminal', 'Contact']) {
    await dock(page).getByRole('button', { name, exact: true }).click()
    await expect(dialog(page, name)).toBeVisible()
  }
})

test('desktop icons open on double-click and on Enter', async ({ page }) => {
  await desk(page).getByRole('button', { name: 'Varnika HD', exact: true }).dblclick()
  await expect(dialog(page, 'Varnika HD')).toBeVisible()

  // Read Me is a shortcut to the About window
  await page.getByRole('button', { name: 'Close About Varnika' }).click()
  await expect(dialog(page, 'About Varnika')).toHaveCount(0)
  await desk(page).getByRole('button', { name: 'Read Me', exact: true }).dblclick()
  await expect(dialog(page, 'About Varnika')).toBeVisible()
  for (const name of ['Resume', 'Trash']) {
    await desk(page).getByRole('button', { name, exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(dialog(page, name)).toBeVisible()
  }
})

test('opening the same app twice keeps one window', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Work', exact: true }).dblclick()
  await expect(dialog(page, 'Work')).toHaveCount(1)
})

test('a window drags and stays on screen', async ({ page }) => {
  const before = await box(dialog(page, 'Note Pad'))
  await dragTitle(page, 'Note Pad', 120, 60)
  const after = await box(dialog(page, 'Note Pad'))
  expect(after.x - before.x).toBe(120)
  expect(after.y - before.y).toBe(60)

  await dragTitle(page, 'Note Pad', 3000, 3000)
  const far = await box(dialog(page, 'Note Pad'))
  expect(far.x + far.width).toBeLessThanOrEqual(1280)
  expect(far.y + 28).toBeLessThanOrEqual(800)
})

test('clicking a covered window brings it to the front', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Work', exact: true }).click()
  const z = (name: string) => dialog(page, name).evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(await z('Work')).toBeGreaterThan(await z('About Varnika'))
  const about = await box(dialog(page, 'About Varnika'))
  await page.mouse.click(about.x + 10, about.y + about.height - 10)
  expect(await z('About Varnika')).toBeGreaterThan(await z('Work'))
})

test('close and zoom boxes work', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Work', exact: true }).click()
  await page.getByRole('button', { name: 'Close Work' }).click()
  await expect(dialog(page, 'Work')).toHaveCount(0)

  const before = await box(dialog(page, 'Projects'))
  await page.getByRole('button', { name: 'Zoom Projects' }).click()
  const zoomed = await box(dialog(page, 'Projects'))
  expect(zoomed.width).toBeGreaterThan(before.width)
  await page.getByRole('button', { name: 'Zoom Projects' }).click()
  expect(await box(dialog(page, 'Projects'))).toEqual(before)
})

test('palette choice survives a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Palette: Cocoa' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'cocoa')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'cocoa')
})

test('Standard View link points at the standard page', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Standard View' })).toHaveAttribute('href', /\/Portfolio\/standard\/$/)
})

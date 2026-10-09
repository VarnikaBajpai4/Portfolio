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

test('Chindi never sits in front of a window that covers her', async ({ page }) => {
  const cat = page.getByRole('button', { name: 'Chindi the cat' })
  const overlaps = async () => {
    const c = (await cat.boundingBox())!
    for (const win of await page.getByRole('dialog').all()) {
      const w = (await win.boundingBox())!
      const inside = c.x + c.width > w.x + 4 && c.x < w.x + w.width - 4 && c.y + c.height > w.y + 4 && c.y < w.y + w.height
      if (inside) return true
    }
    return false
  }
  // put her on the Note Pad, then cover the Note Pad with a full-size window
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('vb:pet', { detail: { goto: 'notepad' } })))
  await page.waitForTimeout(900)
  const pad = (await page.getByRole('dialog', { name: 'Note Pad' }).boundingBox())!
  expect((await cat.boundingBox())!.y).toBeLessThan(pad.y)

  await page.getByRole('button', { name: 'Zoom About Varnika' }).click()
  await expect.poll(overlaps, { timeout: 3000 }).toBe(false)
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(700)
    expect(await overlaps(), `check ${i}`).toBe(false)
  }
})

test('Open my story turns About into the full story', async ({ page }) => {
  const about = page.getByRole('dialog', { name: 'About Varnika' })
  await expect(about.getByText('family-of-engineers')).toHaveCount(0)
  await about.getByRole('button', { name: 'Open my story' }).click()

  await expect(about.getByRole('heading', { name: 'family-of-engineers' })).toBeVisible()
  for (const who of ['Nanu', 'Dad', 'My brother', 'His wife', 'Me']) {
    await expect(about.locator('.graph-who', { hasText: who }).first()).toBeVisible()
  }
  await expect(about.locator('.graph li').first()).toContainText('HEAD')
  await expect(about.getByText('My favourite woman in STEM.')).toBeVisible()
  await expect(about.getByText('I have never corrected her.')).toBeVisible()

  // the grade counts up beside its bar
  await expect(about.locator('.stat-number')).toHaveText('9.66', { timeout: 4000 })
  await expect(about.locator('.sys')).toContainText('#2')
  // pressing a key types what the skill is for
  await expect(about.locator('.keys-display')).toContainText('Press a key.')
  await about.getByRole('button', { name: 'Docker', exact: true }).click()
  await expect(about.locator('.keys-display')).toContainText('Docker: Sandboxed runtimes')
  await expect(about.getByRole('button', { name: 'Docker', exact: true })).toHaveAttribute('aria-pressed', 'true')

  await about.getByText('Football', { exact: true }).scrollIntoViewIfNeeded()
  await expect(about.locator('.hobby')).toHaveCount(10)
  await expect(about.locator('.sys')).toContainText('homage to the retro Mac')
})

test('OmniCompiler opens as a steppable showcase', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  const small = (await projects.boundingBox())!
  await projects.getByRole('button', { name: 'OmniCompiler' }).click()
  await expect(projects.getByRole('heading', { name: 'OmniCompiler' })).toBeVisible()
  // the window grows to make room
  await expect.poll(async () => (await projects.boundingBox())!.width).toBeGreaterThan(small.width + 200)

  // the explanation and the stack come before the demo, and they fade in without a scroll
  await expect(projects.getByRole('heading', { name: 'What it is' })).toBeVisible()
  await expect(projects.locator('.omni-reveal').first()).toHaveCSS('opacity', '1')
  await expect(projects.getByRole('heading', { name: 'Tech stack' })).toBeVisible()
  for (const part of ['FastAPI', 'Docker', 'Monaco Editor', 'Gemini']) {
    await expect(projects.locator('.omni-stack').getByText(part, { exact: true })).toBeVisible()
  }
  await expect(projects.locator('.omni-steps li')).toHaveCount(6)

  await projects.getByRole('tab', { name: 'Go', exact: true }).click()
  await expect(projects.locator('.omni-lines')).toContainText('func binarySearch(arr []int, target int) int {')

  await expect(projects.locator('.omni-count')).toHaveText('step 1 of 10')
  const step = projects.getByRole('button', { name: 'Step', exact: true })
  for (let i = 0; i < 9; i++) await step.click()
  await expect(projects.locator('.omni-note')).toHaveText('Found 23 at index 5.')
  await expect(step).toBeDisabled()
  await expect(projects.locator('.omni-node.is-current')).toContainText('return mid')

  await projects.getByRole('button', { name: 'Back to Projects' }).click()
  await expect(projects.getByRole('button', { name: 'FloatChat' })).toBeVisible()
  await expect.poll(async () => (await projects.boundingBox())!.width).toBe(small.width)
})

test('making the window small again returns from a project to the folder', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  await projects.getByRole('button', { name: 'OmniCompiler' }).click()
  await expect(projects.getByRole('heading', { name: 'OmniCompiler' })).toBeVisible()

  await page.getByRole('button', { name: 'Zoom Projects' }).click()
  await expect(projects.getByRole('heading', { name: 'OmniCompiler' })).toHaveCount(0)
  for (const name of ['OmniCompiler', 'FloatChat', 'UBI Bharosa', 'Symbiote', 'MalShield']) {
    await expect(projects.getByRole('button', { name })).toBeVisible()
  }
})

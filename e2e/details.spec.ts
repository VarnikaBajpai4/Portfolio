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

test('Note Pad lists my work and turns a page on click', async ({ page }) => {
  const pad = page.getByRole('dialog', { name: 'Note Pad' })
  const sheet = pad.locator('.notepad-sheet')
  await expect(sheet).toContainText('What I built, exactly')
  await pad.getByRole('button', { name: 'Next page' }).click()
  await expect(sheet).toContainText('OmniCompiler')
  await expect(sheet).toContainText('One Random Forest model per language')
  await expect(pad.locator('.notepad-page')).toHaveText('2 / 8')

  // the index jumps straight to a page
  for (let i = 0; i < 7; i++) await pad.getByRole('button', { name: 'Next page' }).click()
  await expect(sheet).toContainText('What I built, exactly')
  await sheet.getByRole('button', { name: 'What I am working on' }).click()
  await expect(sheet).toContainText('A Unified Multi-Language Debugging Framework')
  await expect(sheet).toContainText('quantisation fidelity')
})

test('a page pulled off the Note Pad becomes a sticky note', async ({ page }) => {
  const pad = page.getByRole('dialog', { name: 'Note Pad' })
  await pad.locator('.notepad-sheet').getByRole('button', { name: 'Symbiote' }).click()
  const corner = (await pad.getByRole('button', { name: 'Next page' }).boundingBox())!
  await page.mouse.move(corner.x + 8, corner.y + corner.height - 8)
  await page.mouse.down()
  await page.mouse.move(corner.x + 80, corner.y - 60, { steps: 5 })
  await page.mouse.move(corner.x - 120, corner.y + 200, { steps: 5 })
  await page.mouse.up()

  const sticky = page.locator('.sticky', { hasText: 'The matching algorithm, written from scratch.' })
  await expect(sticky).toHaveCount(1)
  await expect(pad.locator('.notepad-sheet')).toContainText('UBI Bharosa')

  await sticky.getByRole('button', { name: 'Remove note' }).click()
  await expect(sticky).toHaveCount(0)
})

test('the last Note Pad page is the visitor\'s to write on and take', async ({ page }) => {
  const pad = page.getByRole('dialog', { name: 'Note Pad' })
  await pad.locator('.notepad-sheet').getByRole('button', { name: 'A page for you' }).click()
  await pad.getByLabel('Write a note').fill('Call her on Monday')
  const corner = (await pad.getByRole('button', { name: 'Next page' }).boundingBox())!
  await page.mouse.move(corner.x + 8, corner.y + corner.height - 8)
  await page.mouse.down()
  await page.mouse.move(corner.x + 80, corner.y - 60, { steps: 5 })
  await page.mouse.move(corner.x - 120, corner.y + 200, { steps: 5 })
  await page.mouse.up()
  await expect(page.locator('.sticky', { hasText: 'Call her on Monday' })).toHaveCount(1)
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
  // put her on the Terminal, then cover the Terminal with a full-size window
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('vb:pet', { detail: { goto: 'terminal' } })))
  await page.waitForTimeout(900)
  const perch = (await page.getByRole('dialog', { name: 'Terminal' }).boundingBox())!
  expect((await cat.boundingBox())!.y).toBeLessThan(perch.y)

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
  await expect(projects.locator('.show-reveal').first()).toHaveCSS('opacity', '1')
  await expect(projects.getByRole('heading', { name: 'Tech stack' })).toBeVisible()
  for (const part of ['FastAPI', 'Docker', 'Monaco Editor', 'Gemini']) {
    await expect(projects.locator('.show-stack').getByText(part, { exact: true })).toBeVisible()
  }
  await expect(projects.locator('.show-steps li')).toHaveCount(6)

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
  // let the window finish growing, as a person would see before reaching for the zoom box
  await expect.poll(async () => (await projects.boundingBox())!.width).toBeGreaterThan(1000)
  await expect(projects.locator('.show-reveal').first()).toHaveCSS('opacity', '1')

  await page.getByRole('button', { name: 'Zoom Projects' }).click()
  await expect(projects.getByRole('heading', { name: 'OmniCompiler' })).toHaveCount(0)
  for (const name of ['OmniCompiler', 'FloatChat', 'UBI Bharosa', 'Symbiote', 'MalShield']) {
    await expect(projects.getByRole('button', { name })).toBeVisible()
  }
})

test('FloatChat shows what happens to a question', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  await projects.getByRole('button', { name: 'FloatChat' }).click()
  await expect(projects.getByRole('heading', { name: 'FloatChat' })).toBeVisible()
  await expect(projects.locator('.show-stack').getByText('FastMCP', { exact: true })).toBeVisible()

  await projects.getByRole('button', { name: 'Where are the floats near India?' }).click()
  await expect(projects.locator('.float-trace')).toContainText('generate_map_points_tool', { timeout: 6000 })
  await expect(projects.locator('.float-answer')).toContainText('Nine floats are reporting')
  await expect(projects.locator('.float-pin')).toHaveCount(9)

  // an off-topic question is stopped before any tool runs
  await projects.getByRole('button', { name: 'Write a poem about my cat.' }).click()
  await expect(projects.locator('.float-trace')).toContainText('irrelevant')
  await expect(projects.locator('.float-answer')).toContainText('I only answer questions about Argo ocean data.')
  await expect(projects.locator('.float-trace')).not.toContainText('generate_')
})

test('UBI Bharosa puts an urgent ticket at the front of the queue', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  await projects.getByRole('button', { name: 'UBI Bharosa' }).click()
  await expect(projects.getByRole('heading', { name: 'UBI Bharosa' })).toBeVisible()
  await expect(projects.locator('.bh-ticket').first()).toContainText('A-101')

  await projects.getByRole('button', { name: /My loan instalment was taken twice/ }).click()
  await expect(projects.locator('.bh-ticket')).toHaveCount(4, { timeout: 6000 })
  await expect(projects.locator('.bh-ticket').first()).toContainText('A-104')

  await projects.getByRole('button', { name: 'Serve next' }).click()
  await expect(projects.getByText('Now serving A-104')).toBeVisible()
  await expect(projects.locator('.bh-ticket').first()).toContainText('A-101')
})

test('Symbiote scores a pairing and rewards a complementary teammate', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  await projects.getByRole('button', { name: 'Symbiote' }).click()
  await expect(projects.getByRole('heading', { name: 'Symbiote' })).toBeVisible()

  const score = async (name: RegExp) => {
    await projects.getByRole('button', { name }).click()
    return Number((await projects.locator('.sy-score').innerText()).replace(/\D+/g, ''))
  }
  const twin = await score(/The frontend twin/)
  const backend = await score(/The backend specialist/)
  expect(backend).toBeGreaterThan(twin)
  await score(/The all-rounder/)
  await score(/The beginner/)
  await expect(projects.locator('.sy-chip.is-best')).toHaveCount(1)
})

test('MalShield gives a verdict with its reasons', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  await projects.getByRole('button', { name: 'MalShield' }).click()
  await expect(projects.getByRole('heading', { name: 'MalShield' })).toBeVisible()

  await projects.getByRole('button', { name: 'free_game_setup.exe' }).click()
  await expect(projects.locator('.ms-verdict')).toHaveText('Malicious', { timeout: 6000 })
  await expect(projects.locator('.ms-report')).toContainText('Trojan family')
  await expect(projects.locator('.ms-report')).toContainText('WriteProcessMemory')

  await projects.getByRole('button', { name: 'invoice_march.docx' }).click()
  await expect(projects.locator('.ms-verdict')).toHaveText('Clean', { timeout: 6000 })
})

test('all five project folders fit on one row', async ({ page }) => {
  const projects = page.getByRole('dialog', { name: 'Projects' })
  const tops = new Set<number>()
  for (const name of ['OmniCompiler', 'FloatChat', 'UBI Bharosa', 'Symbiote', 'MalShield']) {
    tops.add(Math.round((await projects.getByRole('button', { name }).boundingBox())!.y))
  }
  expect(tops.size).toBe(1)
})

test('Work loads a job from a floppy disk and ejects it again', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Dock' }).getByRole('button', { name: 'Work', exact: true }).click()
  const work = page.getByRole('dialog', { name: 'Work', exact: true })
  const detail = work.locator('.work-detail')
  // the disk of the current job is in the drive at the start
  await expect(detail).toContainText('Software Engineer')
  await expect(detail).toContainText('July 2026 – present')
  await expect(work.locator('.work-disk')).toHaveCount(3)

  // a click puts a disk in the drive
  await work.getByRole('button', { name: /Insert disk: LyondellBasell/ }).click()
  await expect(detail).toContainText('SAP Testing')
  await expect(detail.getByText('AWS', { exact: true })).toBeVisible()
  await expect(work.locator('.work-machine')).toContainText('Walk the test tree')
  // the printer prints the same job
  await expect(work.locator('.work-paper')).toContainText('end of disk')

  // a drag onto the Mac does the same
  const disk = work.getByRole('button', { name: /Insert disk: G-Square/ })
  const from = (await disk.boundingBox())!
  const screen = (await work.locator('.work-screen').boundingBox())!
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(screen.x + screen.width / 2, screen.y + screen.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(detail).toContainText('AI and Data Science Intern')

  await work.getByRole('button', { name: 'Eject' }).click()
  await expect(work.getByText('No disk in the drive.')).toBeVisible()
  await expect(work.locator('.work-paper')).toContainText('Put a disk in the drive')
  await expect(work.locator('.work-disk')).toHaveCount(4)

  // the box is in time order
  const x = async (name: RegExp) => (await work.getByRole('button', { name }).boundingBox())!.x
  expect(await x(/G-Square/)).toBeLessThan(await x(/Technology Summer Intern/))
  expect(await x(/Technology Summer Intern/)).toBeLessThan(await x(/Insert disk: LyondellBasell/))
  expect(await x(/Insert disk: LyondellBasell/)).toBeLessThan(await x(/Barclays, Software Engineer/))
})

test('double-clicking Chindi introduces her, then the note leaves', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await page.getByRole('button', { name: 'Chindi the cat' }).dblclick()
  const card = page.locator('.chindi')
  await expect(card).toContainText('Meet Chindi.')
  await expect(card).toContainText('I prefer her company to most humans.')
  await expect(card.getByRole('img')).toBeVisible()
  await expect(card).toHaveCount(0, { timeout: 9000 })
})

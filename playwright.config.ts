import { defineConfig, devices } from '@playwright/test'

const url = 'http://localhost:4173/Portfolio/'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: url },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }],
  webServer: {
    command: 'npm run build && npm run preview',
    url,
    reuseExistingServer: true,
  },
})

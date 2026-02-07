import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL
const vercelBypass = process.env.E2E_VERCEL_BYPASS

if (!baseURL) {
  throw new Error('E2E_BASE_URL is required to run Playwright tests')
}

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    extraHTTPHeaders: vercelBypass
      ? {
        'x-vercel-protection-bypass': vercelBypass,
      }
      : undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

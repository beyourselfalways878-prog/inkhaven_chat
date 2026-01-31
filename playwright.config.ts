import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'playwright/tests',
  timeout: 120_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: 1,
  reporter: 'list',
  use: {
    actionTimeout: 5_000,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      // Force deterministic mock chat during Playwright runs and set port cross-platform
      NEXT_PUBLIC_USE_MOCK_CHAT: '1',
      PORT: '3001'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
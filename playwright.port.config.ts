import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:3107',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    timezoneId: 'Africa/Dakar',
  },
  projects: [
    { name: 'desktop', use: devices['Desktop Chrome'] },
    { name: 'tablette', use: devices['iPad Pro 11'] },
    { name: 'mobile', use: devices['Pixel 7'] },
  ],
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/result.json' }],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,

  use: {
    baseURL: 'http://127.0.0.1:5173',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'bun run dev:api',
      url: 'http://127.0.0.1:3000/api/v1/health',
      reuseExistingServer: true,
    },
    {
      command: 'bun run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
    },
  ],
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});

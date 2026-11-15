import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const scratch = path.resolve(root, '../../.paddock');
const packagePointer = path.join(scratch, 'current-vercel-package');
const packagePath = process.env.PADDOCK_PACKAGE_DIR ?? (existsSync(packagePointer)
  ? readFileSync(packagePointer, 'utf8').trim() : path.join(scratch, 'vercel-package'));
const python = process.env.PADDOCK_PYTHON ?? path.join(scratch, 'vercel-venv/bin/python');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    locale: 'es-ES',
    reducedMotion: 'reduce',
    launchOptions: { executablePath: process.env.PADDOCK_CHROMIUM ?? '/usr/bin/chromium', chromiumSandbox: true },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium', viewport: { width: 390, height: 844 } } },
  ],
  webServer: [
    {
      command: '"$PADDOCK_TEST_PYTHON" -m flask --app api.index run --host=127.0.0.1 --port=5051 --no-reload',
      cwd: path.resolve(root, '../deploy/vercel'),
      env: { PADDOCK_TEST_PYTHON: python, PADDOCK_ASSET_DIR: process.env.PADDOCK_ASSET_DIR ?? path.join(packagePath, 'assets'), PYTHONDONTWRITEBYTECODE: '1' },
      url: 'http://127.0.0.1:5051/api/v1/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    { command: 'npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 30000 },
  ],
});

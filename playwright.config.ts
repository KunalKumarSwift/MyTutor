import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;
const e2eDatabaseUrl =
  process.env['E2E_DATABASE_URL'] ??
  'postgresql://mytutor:mytutor@localhost:5432/mytutor_e2e?schema=public';

export const E2E_CREDENTIALS = {
  admin: { username: 'admin', password: 'E2E-admin-pass-1' },
  operator: { username: 'operator', password: 'E2E-operator-pass-1' },
};

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...(process.env['PLAYWRIGHT_CHROMIUM_PATH']
      ? { launchOptions: { executablePath: process.env['PLAYWRIGHT_CHROMIUM_PATH'] } }
      : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node e2e/serve.mjs',
    url: `${baseURL}/api/v1/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    stdout: 'pipe',
    env: {
      E2E_DATABASE_URL: e2eDatabaseUrl,
      HOST: '127.0.0.1',
      PORT: String(PORT),
      LOG_LEVEL: 'warn',
      SESSION_SECRET: 'e2e-only-session-secret-not-for-production-use',
      ALLOWED_ORIGINS: baseURL,
      COOKIE_SECURE: 'false',
      WEB_DIST_DIR: '../web/dist',
      LOGIN_RATE_LIMIT_MAX: '200',
      API_RATE_LIMIT_MAX: '5000',
      SEED_ADMIN_USERNAME: E2E_CREDENTIALS.admin.username,
      SEED_ADMIN_PASSWORD: E2E_CREDENTIALS.admin.password,
      SEED_OPERATOR_USERNAME: E2E_CREDENTIALS.operator.username,
      SEED_OPERATOR_PASSWORD: E2E_CREDENTIALS.operator.password,
    },
  },
});

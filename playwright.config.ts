import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Incluir también tests de rendimiento
  testMatch: ['**/*.spec.ts', '**/performance-tests/**/*.spec.ts'],

  // Tiempo máximo para cada test
  timeout: 30 * 1000,

  // Tiempo de espera para assertions
  expect: {
    timeout: 5000,
  },

  // Configuración de ejecución
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: 'html',

  // Configuración compartida para todos los proyectos
  use: {
    // URL base para navegar
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5000',

    // Capturar traza en caso de fallo
    trace: 'on-first-retry',

    // Screenshots en caso de fallo
    screenshot: 'only-on-failure',

    // Videos solo en caso de fallo
    video: 'retain-on-failure',
  },

  // Configurar proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Configuración para móvil
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Configuración para tablet
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Servidor de desarrollo
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

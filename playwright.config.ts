import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests de extremo a extremo. Deben pasar tanto contra el modo demo (sin
 * variables de Supabase, como corre en CI) como contra un backend real configurado
 * en `.env.local` (como corre en desarrollo) — por eso evitan afirmaciones que
 * dependan de si hay o no una sesión iniciada.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

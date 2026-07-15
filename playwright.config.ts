import { defineConfig, devices } from "@playwright/test";

const WEB_PORT = 4173;
const API_PORT = 8901;

export default defineConfig({
  testDir: "./tests",
  testMatch: ["e2e/**/*.spec.ts", "accessibility/**/*.spec.ts"],
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" },
      },
    },
  ],
  webServer: [
    {
      command: "pnpm exec tsx tests/e2e/start-server.ts",
      port: API_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
      env: { MOCK_MODE: "true", DEV_API_PORT: String(API_PORT) },
    },
    {
      command: `pnpm --filter @desk-os/web run build && pnpm --filter @desk-os/web exec vite preview --port ${WEB_PORT} --strictPort`,
      port: WEB_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: { VITE_FUNCTIONS_PROXY_TARGET: `http://localhost:${API_PORT}` },
    },
  ],
});

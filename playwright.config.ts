import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "");
const baseURL = externalBaseUrl ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  // Next development compilation is workspace-wide; serial browser workers avoid
  // cold-route compilation contention locally and mirror the CI execution shape.
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 8_000,
  },
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: process.env.CI
          ? `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`
          : `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: process.env.CI ? 180_000 : 120_000,
      },
});

const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

// Windows: Playwright uses taskkill to stop the dev server. Add System32 to
// PATH if it is missing, otherwise the test run never exits.
if (process.platform === "win32") {
  const system32 = path.join(
    process.env.SystemRoot || "C:\\Windows",
    "System32"
  );
  const entries = (process.env.PATH || "").split(path.delimiter);
  if (
    !entries.some(
      (entry) =>
        entry.toLowerCase().replace(/\\+$/, "") === system32.toLowerCase()
    )
  ) {
    process.env.PATH = [system32, ...entries].join(path.delimiter);
  }
}

// Set E2E_BASE_URL to test a running build/deployment instead of starting
// the dev server. Port 3100 so it doesn't clash with a normal npm start.
const port = process.env.E2E_PORT || "3100";
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${port}`;
const startsItsOwnServer = !process.env.E2E_BASE_URL;

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "phone",
      use: { ...devices["Pixel 7"] },
      grepInvert: /@hover/,
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@touch/,
    },
  ],
  webServer: startsItsOwnServer
    ? {
        command: "npm start",
        url: baseURL,
        env: { PORT: String(port), BROWSER: "none" },
        timeout: 180000,
        reuseExistingServer: true,
      }
    : undefined,
});

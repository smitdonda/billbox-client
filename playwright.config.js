const { defineConfig, devices } = require("@playwright/test");

/*
 * Two projects, because half of what these tests check only exists on one side
 * of the pointer: a phone has a coarse pointer and no hover, and the toasts
 * change shape accordingly.
 *
 * By default the suite runs against a dev server started here. Point
 * E2E_BASE_URL at a deployment to run the same tests against it:
 *
 *   E2E_BASE_URL=https://billbox-client.vercel.app npm run test:e2e
 *
 * CI does exactly that: it builds, serves ./build itself, and points
 * E2E_BASE_URL at it — so the tests measure the bundle the deployment ships,
 * and no server has to be torn down at the end of the run. Nothing answers
 * /api there, and nothing has to: the tests stub the two routes the login
 * page calls.
 */
/*
 * A port of its own, not the 3000 a dev server takes. Reusing whatever
 * answers on 3000 sounds convenient until it is another project's dev server:
 * the suite then measures that app and fails on a page it has never seen.
 */
const port = process.env.E2E_PORT || "3100";
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${port}`;
const startsItsOwnServer = !process.env.E2E_BASE_URL;

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // The HTML report is what gets uploaded when a CI run goes red; "github"
  // alone leaves nothing behind to open.
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "phone",
      // Pixel 7 brings what the desktop browser cannot fake: real touch
      // events, pointer: coarse, and hover: none.
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: startsItsOwnServer
    ? {
        command: "npm start",
        url: baseURL,
        // Set here rather than inlined in the command, which would need a
        // different spelling on Windows. BROWSER stops create-react-app
        // opening a window of its own.
        env: { PORT: String(port), BROWSER: "none" },
        // create-react-app takes its time on a cold start.
        timeout: 180000,
        // Reusing a dev server that is already up is the normal case while
        // working. Nothing starts a server under CI — it passes E2E_BASE_URL
        // and this block is skipped entirely.
        reuseExistingServer: true,
      }
    : undefined,
});

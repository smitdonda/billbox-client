# End-to-end tests

Playwright, two projects: `phone` (Pixel 7 — real touch events, `pointer: coarse`,
`hover: none`) and `desktop`. Several of the toast behaviours only exist on one
side of that line, so both run.

```bash
npm run test:e2e                 # both projects, against a local dev server
npm run test:e2e:phone           # phone only
npm run test:e2e:ui              # the Playwright UI
```

Against a deployment instead of localhost:

```bash
E2E_BASE_URL=https://billbox-client.vercel.app npm run test:e2e
```

With no `E2E_BASE_URL` the config starts `npm start` on port **3100** — its own
port, not the 3000 a dev server takes, so the suite can never end up measuring
whatever other project happens to be running. A server already listening on
3100 is reused.

On Windows, Playwright stops the dev server it started with `taskkill`. When
`C:\Windows\System32` is missing from PATH that command is not found, the
server keeps running, and the run never exits after the last test.
`playwright.config.js` puts System32 back on PATH for the run to prevent this.
If a run still hangs, start the server yourself first:

```bash
set PORT=3100 && npm start      # in another terminal
npm run test:e2e
```

## What they need

Nothing. No account, no seeded data, no API. Every toast is raised by failing
the login request from inside the test (`page.route`), so the requests never
leave the browser and nothing is ever written. The login form fills itself from
the demo card on the page, so no credentials are typed either.

## What they cover

- The wording after a failed request: a dropped connection, a timeout, and a
  server that answers without a message of its own. Axios's own phrasing
  ("Network Error", "Request failed with status code 500") must not reach the
  screen.
- The stack: piled on a phone, fanned out on a desktop.
- Touch: the close button's hit area reaches 44px under a coarse pointer even
  though it is drawn at 20px, and a swipe dismisses.
- The paint: `--danger` on the rail and the type, the timer bar running on the
  same 3.5s clock sonner dismisses by, and no sideways scroll at phone width.

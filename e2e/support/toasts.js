const TOAST = "[data-sonner-toast]";

/**
 * Open the login page with the sign-in request set to fail, so a toast can be
 * raised on demand without an account, a session, or anything written.
 *
 * The login form fills itself from the demo card on the page, so no
 * credentials are typed here.
 */
async function armFailingLogin(page, { fail = "abort" } = {}) {
  // "Not signed in", answered here rather than by an API, so the suite runs
  // against a plain static build with nothing behind /api. The app treats a
  // 401 on this route as an answer, not as an expired session.
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ success: false, message: "Not signed in" }),
    })
  );

  await page.route("**/api/auth/login", (route) => {
    if (fail === "abort") return route.abort("failed");
    if (fail === "timeout") return route.abort("timedout");
    return route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/login");
  await page.getByRole("button", { name: /fill the form/i }).click();
}

/** Raise `count` toasts and settle. */
async function raiseToasts(page, count = 1) {
  for (let i = 0; i < count; i += 1) {
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForTimeout(600);
  }
  await page.locator(TOAST).first().waitFor();
  await page.waitForTimeout(400);
}

/** Where each toast sits, top-down. */
function toastTops(page) {
  return page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((t) =>
        Math.round(t.getBoundingClientRect().top)
      ),
    TOAST
  );
}

module.exports = { TOAST, armFailingLogin, raiseToasts, toastTops };

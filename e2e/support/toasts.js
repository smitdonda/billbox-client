const TOAST = "[data-sonner-toast]";

// Opens the login page with the login request set to fail
async function armFailingLogin(page, { fail = "abort" } = {}) {
  // pretend nobody is logged in, so no API is needed
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
  // fill in the demo account
  await page.getByRole("button", { name: /fill the form/i }).click();
}

async function raiseToasts(page, count = 1) {
  for (let i = 0; i < count; i += 1) {
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForTimeout(600);
  }
  await page.locator(TOAST).first().waitFor();
  await page.waitForTimeout(400);
}

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

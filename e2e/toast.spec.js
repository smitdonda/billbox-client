const { test, expect } = require("@playwright/test");
const {
  TOAST,
  armFailingLogin,
  raiseToasts,
  toastTops,
} = require("./support/toasts");

// The login request is failed on purpose to show toasts, no account needed

test.describe("toast wording", () => {
  test("a request that never arrives says so, in plain words", async ({
    page,
  }) => {
    await armFailingLogin(page, { fail: "abort" });
    await raiseToasts(page);

    await expect(page.locator(TOAST)).toContainText(
      "Cannot reach the server. Check your connection."
    );
  });

  test("a request that times out says that instead", async ({ page }) => {
    await armFailingLogin(page, { fail: "timeout" });
    await raiseToasts(page);

    await expect(page.locator(TOAST)).toContainText("took too long to respond");
  });

  test("a server that answers without a message leaves the caller's wording", async ({
    page,
  }) => {
    await armFailingLogin(page, { fail: "500" });
    await raiseToasts(page);

    await expect(page.locator(TOAST)).toContainText("Could not sign you in");
    await expect(page.locator(TOAST)).not.toContainText("status code");
  });
});

test.describe("the stack", () => {
  test("stays piled on a phone and fans out on a desktop", async ({
    page,
  }, testInfo) => {
    await armFailingLogin(page);
    await raiseToasts(page, 3);

    const tops = await toastTops(page);
    expect(tops).toHaveLength(3);

    const spread = Math.max(...tops) - Math.min(...tops);
    if (testInfo.project.name === "phone") {
      expect(spread).toBeLessThan(60);
    } else {
      expect(spread).toBeGreaterThan(120);
    }
  });
});

// only runs in the phone project (see playwright.config.js)
test.describe("touch", { tag: "@touch" }, () => {
  test("the close button answers a finger, not just a cursor", async ({
    page,
  }) => {
    await armFailingLogin(page);
    await raiseToasts(page);

    const close = page.locator(`${TOAST} [data-close-button]`).first();
    const box = await close.boundingBox();

    // the button is 20px, tap 14px away from the centre (inside the 44px area)
    expect(Math.round(box.width)).toBeLessThanOrEqual(24);

    const offCentre = {
      x: box.x + box.width / 2 + 14,
      y: box.y + box.height / 2 + 14,
    };
    const landsOnButton = await page.evaluate(({ x, y }) => {
      const btn = document.querySelector(
        "[data-sonner-toast] [data-close-button]"
      );
      const el = document.elementFromPoint(x, y);
      return Boolean(el) && (el === btn || btn.contains(el));
    }, offCentre);
    expect(landsOnButton).toBe(true);

    await page.touchscreen.tap(offCentre.x, offCentre.y);
    await expect(page.locator(TOAST)).toHaveCount(0);
  });

  test("a swipe takes the toast away", async ({ page }) => {
    await armFailingLogin(page);
    await raiseToasts(page);

    const box = await page.locator(TOAST).first().boundingBox();
    const y = box.y + box.height / 2;

    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, y, { steps: 6 });
    await expect(page.locator(TOAST).first()).toHaveAttribute(
      "data-swiping",
      "true"
    );
    await page.mouse.move(box.x + box.width / 2 + 260, y, { steps: 10 });
    await page.mouse.up();

    await expect(page.locator(TOAST)).toHaveCount(0);
  });
});

test.describe("the painted toast", () => {
  test("wears the token palette and fits the screen", async ({ page }) => {
    await armFailingLogin(page);
    await raiseToasts(page);

    const seen = await page.evaluate((sel) => {
      const toast = document.querySelector(sel);
      const content = toast.querySelector("[data-content]");
      const rail = getComputedStyle(content, "::before");
      const timer = getComputedStyle(content, "::after");
      const rect = toast.getBoundingClientRect();
      return {
        type: toast.getAttribute("data-type"),
        accent: getComputedStyle(toast)
          .getPropertyValue("--toast-accent")
          .trim(),
        rail: rail.backgroundColor,
        timerAnimation: timer.animationName,
        timerDuration: timer.animationDuration,
        overflowsRight: Math.round(rect.right) > window.innerWidth,
        pageScrollsSideways:
          document.documentElement.scrollWidth > window.innerWidth,
      };
    }, TOAST);

    expect(seen.type).toBe("error");
    // --danger colour
    expect(seen.accent).toBe("rgb(173 57 57)");
    expect(seen.rail).toBe("rgb(173, 57, 57)");
    expect(seen.timerAnimation).toBe("toast-timer");
    expect(seen.timerDuration).toBe("3.5s");
    expect(seen.overflowsRight).toBe(false);
    expect(seen.pageScrollsSideways).toBe(false);
  });

  // needs hover, so only runs in the desktop project
  test(
    "the timer bar holds while the toast is held",
    { tag: "@hover" },
    async ({ page }) => {
      await armFailingLogin(page);
      await raiseToasts(page);

      await page.locator(TOAST).first().hover();
      await page.waitForTimeout(300);
      const held = await page.evaluate(
        (sel) =>
          getComputedStyle(
            document.querySelector(`${sel} [data-content]`),
            "::after"
          ).animationPlayState,
        TOAST
      );
      expect(held).toBe("paused");

      await page.mouse.move(10, 400);
      await page.waitForTimeout(300);
      const released = await page.evaluate(
        (sel) =>
          getComputedStyle(
            document.querySelector(`${sel} [data-content]`),
            "::after"
          ).animationPlayState,
        TOAST
      );
      expect(released).toBe("running");
    }
  );
});

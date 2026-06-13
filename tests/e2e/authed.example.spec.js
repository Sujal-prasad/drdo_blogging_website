const { test, expect } = require("@playwright/test");

/* ===========================================================================
   TEMPLATE — authenticated flows (publish, comment, follow, paywall…).
   These need a logged-in Supabase session, so they're skipped by default.

   To enable:
   1. Use a DEDICATED test Supabase project (never prod) — set its keys in a
      test build of scripts/config.js, with email confirmation OFF.
   2. Create a test account, then either:
        a) log in through the UI once and save Playwright `storageState`, OR
        b) call supabase.auth.signInWithPassword in a global-setup and persist it.
   3. Remove `.skip` below and wire up `loginAsTestUser`.
   =========================================================================== */

async function loginAsTestUser(page) {
  await page.goto("/pages/login.html");
  await page.fill("#email", process.env.TEST_EMAIL || "test@example.com");
  await page.fill("#password", process.env.TEST_PASSWORD || "test-password");
  await page.click("#emailSubmit");
  await page.waitForURL(/\/index\.html/, { timeout: 20000 });
}

test.describe.skip("authenticated flows", () => {
  test("publish an article", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/pages/write.html");
    await page.fill("#title", "E2E test post");
    await page.fill("#body", "A body written by Playwright.\n\nSecond paragraph.");
    await page.click("#publish");
    await expect(page).toHaveURL(/\/pages\/article\.html\?id=/);
    await expect(page.locator(".article-title").first()).toHaveText("E2E test post");
  });

  test("clap is one-per-article", async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/index.html");
    await page.locator(".card").first().click();
    const clap = page.locator(".clap-btn").first();
    await clap.click();
    const after = await clap.locator(".clap-count").innerText();
    await clap.click(); // second clap ignored
    await expect(clap.locator(".clap-count")).toHaveText(after);
  });

  test("paywall blocks the 6th article", async ({ page }) => {
    await loginAsTestUser(page);
    // open 6 distinct articles; the 6th should show the RazorPlay checkout
    // (assert .pay-overlay becomes visible) …
  });
});

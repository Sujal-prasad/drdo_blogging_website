const { test, expect } = require("@playwright/test");

// Runs the in-browser unit/integration suite (tests/tests.html) under Playwright
// and asserts it reports zero failures.
test("data/logic suite passes (tests.html)", async ({ page }) => {
  await page.goto("/tests/tests.html");
  const summary = page.locator("#summary");
  await expect(summary).toContainText("failed", { timeout: 15000 });
  await expect(summary).toContainText("0 failed");
});

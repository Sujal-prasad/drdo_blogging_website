const { test, expect } = require("@playwright/test");

test("login page renders", async ({ page }) => {
  await page.goto("/pages/login.html");
  await expect(page).toHaveTitle(/Sign in/);
  await expect(page.locator(".mascot")).toBeVisible();           // the cat mascot
  await expect(page.getByText("Continue with Google")).toBeVisible();
  await expect(page.getByText("Continue with Discord")).toBeVisible();
  await expect(page.locator("#themeToggle")).toBeVisible();
});

test("theme toggle flips light/dark", async ({ page }) => {
  await page.goto("/pages/login.html");
  const html = page.locator("html");
  const before = await html.getAttribute("data-theme");
  await page.locator("#themeToggle").click();
  await expect(html).not.toHaveAttribute("data-theme", before || "light");
});

test("protected pages redirect to login when logged out", async ({ page }) => {
  // a fresh browser has no Supabase session → the auth gate should bounce us
  await page.goto("/index.html");
  await page.waitForURL(/\/pages\/login\.html/, { timeout: 15000 });
  await expect(page).toHaveURL(/login\.html/);
});

test("the reader also guards when logged out", async ({ page }) => {
  await page.goto("/pages/write.html");
  await page.waitForURL(/\/pages\/login\.html/, { timeout: 15000 });
  await expect(page).toHaveURL(/login\.html/);
});

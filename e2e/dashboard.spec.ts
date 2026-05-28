import { test, expect } from "@playwright/test"

/**
 * Dashboard smoke tests.
 * Run in dev mode (no auth) or against a deployed preview with SUPABASE disabled.
 */
test.describe("Dashboard (dev / offline mode)", () => {
  test.beforeEach(async ({ page }) => {
    // Unset SUPABASE env so middleware passes through
    await page.goto("/")
  })

  test("renders Arabic dashboard at root path", async ({ page }) => {
    // Verify locale
    await expect(page.locator("html")).toHaveAttribute("lang", "ar")
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")

    // Verify page title
    await expect(page).toHaveTitle(/مطبخي/)
  })

  test("switches to English on /en route", async ({ page }) => {
    await page.goto("/en")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
    await expect(page).toHaveTitle(/My Kitchen/)
  })

  test("shows inventory stats", async ({ page }) => {
    // Stats grid should appear after hydration
    await page.waitForSelector("[data-testid='stat-card'], .glass-card", { timeout: 5000 })
    const cards = page.locator(".glass-card")
    await expect(cards.first()).toBeVisible()
  })

  test("navigates to inventory page", async ({ page }) => {
    await page.click("a[href='/inventory'], a[href*='/inventory']")
    await expect(page.url()).toContain("/inventory")
  })

  test("opens command palette with keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("Meta+k")
    // Command palette should appear
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible({ timeout: 2000 })
  })

  test("theme toggle changes color scheme", async ({ page }) => {
    const html = page.locator("html")
    const initialClass = await html.getAttribute("class")
    // Click theme toggle button
    await page.getByLabel(/toggle theme|تبديل الوضع/i).click()
    // Wait for transition
    await page.waitForTimeout(300)
    const newClass = await html.getAttribute("class")
    expect(newClass).not.toBe(initialClass)
  })
})

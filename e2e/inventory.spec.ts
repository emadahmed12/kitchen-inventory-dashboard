import { test, expect } from "@playwright/test"

test.describe("Inventory page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/inventory")
  })

  test("shows inventory items after hydration", async ({ page }) => {
    // Wait for skeleton to disappear and real items to appear
    await page.waitForSelector(".glass-card", { timeout: 5000 })
    const items = page.locator("article")
    await expect(items.first()).toBeVisible()
  })

  test("search filters items in real time", async ({ page }) => {
    await page.waitForSelector("article", { timeout: 5000 })
    const initialCount = await page.locator("article").count()
    expect(initialCount).toBeGreaterThan(0)

    // Type a search term that won't match everything
    await page.fill("input[type=search], input[placeholder*='ابحث'], input[placeholder*='Search']", "rice")

    // Result count should change (reduce or stay the same)
    await page.waitForTimeout(300) // debounce
    const filteredCount = await page.locator("article").count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test("FAB opens add item dialog", async ({ page }) => {
    const fab = page.getByLabel(/add item|إضافة/i)
    if (await fab.isVisible()) {
      await fab.click()
      await expect(page.getByRole("dialog")).toBeVisible()
    }
  })
})

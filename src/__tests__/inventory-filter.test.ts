import { describe, it, expect } from "vitest"
import { filterAndSortItems, hasActiveFilters } from "@/lib/inventory/filters"
import { SEED_INVENTORY } from "@/data/seed-inventory"
import type { InventoryFilterState } from "@/types/ui"

const DEFAULT_FILTERS: InventoryFilterState = {
  search: "",
  category: "all",
  status: "all",
  sort: "status",
}

describe("filterAndSortItems", () => {
  it("returns all items when no filters are active", () => {
    const result = filterAndSortItems(SEED_INVENTORY, DEFAULT_FILTERS)
    expect(result).toHaveLength(SEED_INVENTORY.length)
  })

  it("filters by search term (case-insensitive)", () => {
    const filters = { ...DEFAULT_FILTERS, search: "rice" }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    result.forEach((item) => {
      expect(item.name.toLowerCase()).toContain("rice")
    })
  })

  it("filters by category", () => {
    const filters = { ...DEFAULT_FILTERS, category: "grains" as const }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    result.forEach((item) => expect(item.category).toBe("grains"))
  })

  it("filters by status", () => {
    const filters = { ...DEFAULT_FILTERS, status: "low" as const }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    result.forEach((item) => expect(item.status).toBe("low"))
  })

  it("returns empty array when search matches nothing", () => {
    const filters = { ...DEFAULT_FILTERS, search: "xyznonexistent" }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    expect(result).toHaveLength(0)
  })

  it("sorts by name ascending", () => {
    const filters = { ...DEFAULT_FILTERS, sort: "name-asc" as const }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].name.localeCompare(result[i].name)).toBeLessThanOrEqual(0)
    }
  })

  it("sorts by quantity descending", () => {
    const filters = { ...DEFAULT_FILTERS, sort: "quantity-desc" as const }
    const result = filterAndSortItems(SEED_INVENTORY, filters)
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].quantity).toBeGreaterThanOrEqual(result[i].quantity)
    }
  })
})

describe("hasActiveFilters", () => {
  it("returns false for default filters", () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false)
  })

  it("returns true when search is not empty", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: "rice" })).toBe(true)
  })

  it("returns true when category is not 'all'", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, category: "grains" })).toBe(true)
  })

  it("returns true when status is not 'all'", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, status: "low" })).toBe(true)
  })
})

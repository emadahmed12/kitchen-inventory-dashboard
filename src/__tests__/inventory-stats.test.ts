import { describe, it, expect } from "vitest"
import { computeInventoryStats, computeLocationOccupancy, getLowStockItems } from "@/lib/inventory/stats"
import type { InventoryItem } from "@/types/inventory"

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: "test-" + Math.random(),
    name: "Test Item",
    quantity: 5,
    unit: "kg",
    category: "grains",
    location: "pantry",
    status: "healthy",
    lowStockThreshold: 2,
    tags: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe("computeInventoryStats", () => {
  it("calculates total correctly", () => {
    const items = [makeItem(), makeItem(), makeItem()]
    expect(computeInventoryStats(items).total).toBe(3)
  })

  it("counts opened items", () => {
    const items = [makeItem({ status: "opened" }), makeItem({ status: "healthy" })]
    expect(computeInventoryStats(items).opened).toBe(1)
  })

  it("counts unique categories", () => {
    const items = [
      makeItem({ category: "grains" }),
      makeItem({ category: "grains" }),
      makeItem({ category: "canned" }),
    ]
    expect(computeInventoryStats(items).categories).toBe(2)
  })

  it("counts items that need attention", () => {
    const items = [
      makeItem({ status: "low" }),
      makeItem({ status: "almost_finished" }),
      makeItem({ status: "healthy" }),
    ]
    expect(computeInventoryStats(items).needsAttention).toBe(2)
  })

  it("returns zeros for empty array", () => {
    const stats = computeInventoryStats([])
    expect(stats.total).toBe(0)
    expect(stats.opened).toBe(0)
    expect(stats.categories).toBe(0)
  })
})

describe("getLowStockItems", () => {
  it("returns only items that need attention", () => {
    const items = [
      makeItem({ status: "low" }),
      makeItem({ status: "healthy" }),
      makeItem({ status: "almost_finished" }),
    ]
    const result = getLowStockItems(items)
    expect(result.every((i) => i.status === "low" || i.status === "almost_finished")).toBe(true)
  })

  it("respects the limit parameter", () => {
    const items = Array.from({ length: 10 }, () => makeItem({ status: "low" }))
    expect(getLowStockItems(items, 3)).toHaveLength(3)
  })
})

describe("computeLocationOccupancy", () => {
  it("calculates percentage of capacity used", () => {
    // pantry has capacity 20
    const items = Array.from({ length: 10 }, () => makeItem({ location: "pantry" }))
    const result = computeLocationOccupancy(items)
    const pantry = result.find((l) => l.locationId === "pantry")
    expect(pantry).toBeDefined()
    expect(pantry!.pct).toBe(50) // 10/20 = 50%
    expect(pantry!.count).toBe(10)
  })

  it("caps percentage at 100", () => {
    // kitchen has capacity 12, add 15 items
    const items = Array.from({ length: 15 }, () => makeItem({ location: "kitchen" }))
    const result = computeLocationOccupancy(items)
    const kitchen = result.find((l) => l.locationId === "kitchen")
    expect(kitchen!.pct).toBe(100)
  })
})

import { describe, it, expect } from "vitest"
import { inventoryItemSchema, quantityUpdateSchema } from "@/lib/validation/inventory"
import { signInSchema, signUpSchema, imageFileSchema } from "@/lib/validation/auth"

const validItem = {
  name: "Rice bag",
  quantity: 3,
  unit: "kg",
  category: "grains",
  location: "pantry",
}

describe("inventoryItemSchema", () => {
  it("accepts valid input", () => {
    expect(() => inventoryItemSchema.parse(validItem)).not.toThrow()
  })

  it("rejects empty name", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, name: "" })).toThrow()
  })

  it("rejects name longer than 100 chars", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, name: "x".repeat(101) })).toThrow()
  })

  it("rejects negative quantity", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, quantity: -1 })).toThrow()
  })

  it("rejects quantity over 9999", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, quantity: 10_000 })).toThrow()
  })

  it("rejects invalid category", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, category: "invalid_cat" })).toThrow()
  })

  it("rejects invalid unit", () => {
    expect(() => inventoryItemSchema.parse({ ...validItem, unit: "invalid_unit" })).toThrow()
  })

  it("trims name whitespace", () => {
    const result = inventoryItemSchema.parse({ ...validItem, name: "  Rice  " })
    expect(result.name).toBe("Rice")
  })

  it("strips empty notes", () => {
    const result = inventoryItemSchema.parse({ ...validItem, notes: "  " })
    expect(result.notes).toBeUndefined()
  })
})

describe("quantityUpdateSchema", () => {
  it("accepts valid quantity", () => {
    expect(() => quantityUpdateSchema.parse({ quantity: 5 })).not.toThrow()
  })
  it("rejects negative quantity", () => {
    expect(() => quantityUpdateSchema.parse({ quantity: -1 })).toThrow()
  })
})

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    expect(() =>
      signInSchema.parse({ email: "user@example.com", password: "Password1" })
    ).not.toThrow()
  })

  it("rejects invalid email", () => {
    expect(() =>
      signInSchema.parse({ email: "not-an-email", password: "Password1" })
    ).toThrow()
  })

  it("rejects short password", () => {
    expect(() =>
      signInSchema.parse({ email: "user@example.com", password: "short" })
    ).toThrow()
  })
})

describe("signUpSchema", () => {
  it("rejects password without uppercase", () => {
    expect(() =>
      signUpSchema.parse({ email: "user@example.com", password: "password123" })
    ).toThrow()
  })

  it("rejects password without number", () => {
    expect(() =>
      signUpSchema.parse({ email: "user@example.com", password: "PasswordOnly" })
    ).toThrow()
  })

  it("accepts strong password", () => {
    expect(() =>
      signUpSchema.parse({ email: "user@example.com", password: "Password123!" })
    ).not.toThrow()
  })
})

describe("imageFileSchema", () => {
  it("accepts valid image", () => {
    expect(() =>
      imageFileSchema.parse({ size: 1_000_000, type: "image/jpeg" })
    ).not.toThrow()
  })

  it("rejects oversized image", () => {
    expect(() =>
      imageFileSchema.parse({ size: 6_000_000, type: "image/jpeg" })
    ).toThrow()
  })

  it("rejects disallowed MIME type", () => {
    expect(() =>
      imageFileSchema.parse({ size: 1_000, type: "application/pdf" })
    ).toThrow()
  })
})

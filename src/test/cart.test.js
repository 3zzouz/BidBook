import { describe, it, expect } from "vitest";
import {
  calculateTotal,
  applyDiscount,
  filterByCategory,
  isFreeShipping,
  sortItems,
  mergeDuplicates,
  applyBulkDiscounts,
  fetchProduct,
  fetchMultipleProducts,
  validateStock,
  placeOrder,
} from "../lib/cart";

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
const sampleItems = [
  { name: "Apple", price: 1.5, quantity: 4, category: "fruits" },
  { name: "Banana", price: 0.8, quantity: 2, category: "fruits" },
  { name: "Milk", price: 1.2, quantity: 3, category: "dairy" },
  { name: "Cheese", price: 3.0, quantity: 1, category: "dairy" },
  { name: "Sourdough", price: 4.5, quantity: 1, category: "bakery" },
  { name: "Laptop", price: 999.99, quantity: 1, category: "electronics" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. calculateTotal
// ─────────────────────────────────────────────────────────────────────────────
describe("calculateTotal()", () => {
  it("returns 0 for an empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("correctly sums price × quantity across all items", () => {
    expect(calculateTotal(sampleItems)).toBe(1018.69);
  });

  it("fixes floating-point precision (0.1*3 + 0.2 → 0.50, not 0.5000000001)", () => {
    const items = [
      { name: "A", price: 0.1, quantity: 3 },
      { name: "B", price: 0.2, quantity: 1 },
    ];
    expect(calculateTotal(items)).toBe(0.5);
  });

  it("handles single item with quantity 1", () => {
    expect(calculateTotal([{ name: "Book", price: 15.99, quantity: 1 }])).toBe(
      15.99,
    );
  });

  it("handles large quantities", () => {
    expect(calculateTotal([{ name: "Pen", price: 0.5, quantity: 1000 }])).toBe(
      500,
    );
  });

  it("throws when items is not an array", () => {
    expect(() => calculateTotal("oops")).toThrow("Items must be an array");
    expect(() => calculateTotal(null)).toThrow("Items must be an array");
    expect(() => calculateTotal(42)).toThrow("Items must be an array");
  });

  it("throws when price is a string", () => {
    expect(() =>
      calculateTotal([{ name: "X", price: "10", quantity: 1 }]),
    ).toThrow("Price and quantity must be numbers");
  });

  it("throws when price is negative", () => {
    expect(() =>
      calculateTotal([{ name: "X", price: -5, quantity: 1 }]),
    ).toThrow("Price and quantity must be non-negative");
  });

  it("throws when quantity is negative", () => {
    expect(() =>
      calculateTotal([{ name: "X", price: 5, quantity: -1 }]),
    ).toThrow("Price and quantity must be non-negative");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. applyDiscount
// ─────────────────────────────────────────────────────────────────────────────
describe("applyDiscount()", () => {
  it("applies 10% with SAVE10", () => {
    expect(applyDiscount(100, "SAVE10")).toBe(90);
  });

  it("applies 20% with SAVE20", () => {
    expect(applyDiscount(50, "SAVE20")).toBe(40);
  });

  it("applies 50% with HALFOFF", () => {
    expect(applyDiscount(80, "HALFOFF")).toBe(40);
  });

  it("returns original total for unknown or empty code", () => {
    expect(applyDiscount(100, "INVALID")).toBe(100);
    expect(applyDiscount(100, "")).toBe(100);
  });

  it("returns 0 when total is 0", () => {
    expect(applyDiscount(0, "SAVE10")).toBe(0);
    expect(applyDiscount(0, "HALFOFF")).toBe(0);
  });

  it("rounds floating-point results correctly (33.33 × 0.90 → 30.00)", () => {
    expect(applyDiscount(33.33, "SAVE10")).toBe(30);
  });

  it("throws when total is not a number", () => {
    expect(() => applyDiscount("100", "SAVE10")).toThrow(
      "Total must be a number",
    );
  });

  it("throws when total is negative", () => {
    expect(() => applyDiscount(-10, "SAVE10")).toThrow(
      "Total cannot be negative",
    );
  });

  it("chains with calculateTotal correctly", () => {
    const items = [{ name: "Shirt", price: 40, quantity: 2 }]; // 80
    expect(applyDiscount(calculateTotal(items), "SAVE20")).toBe(64);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. filterByCategory
// ─────────────────────────────────────────────────────────────────────────────
describe("filterByCategory()", () => {
  it("returns only fruits", () => {
    const result = filterByCategory(sampleItems, "fruits");
    expect(result).toHaveLength(2);
    expect(result.every((i) => i.category === "fruits")).toBe(true);
  });

  it("returns correct dairy items in order", () => {
    const result = filterByCategory(sampleItems, "dairy");
    expect(result.map((i) => i.name)).toEqual(["Milk", "Cheese"]);
  });

  it("returns empty array for category with no matches", () => {
    expect(filterByCategory(sampleItems, "seafood")).toEqual([]);
  });

  it("throws for an empty category string", () => {
    expect(() => filterByCategory(sampleItems, "")).toThrow(
      "Category must be a non-empty string",
    );
  });

  it("throws when items is not an array", () => {
    expect(() => filterByCategory(null, "fruits")).toThrow(
      "Items must be an array",
    );
  });

  it("does not mutate the original array", () => {
    const copy = [...sampleItems];
    filterByCategory(sampleItems, "fruits");
    expect(sampleItems).toEqual(copy);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. isFreeShipping — boundary tests
// ─────────────────────────────────────────────────────────────────────────────
describe("isFreeShipping()", () => {
  it("returns false for totals below threshold", () => {
    expect(isFreeShipping(0)).toBe(false);
    expect(isFreeShipping(49.99)).toBe(false);
  });

  it("returns true exactly at the boundary (50)", () => {
    expect(isFreeShipping(50)).toBe(true);
  });

  it("returns true above the threshold", () => {
    expect(isFreeShipping(50.01)).toBe(true);
    expect(isFreeShipping(9999)).toBe(true);
  });

  it("throws when total is not a number", () => {
    expect(() => isFreeShipping("50")).toThrow("Total must be a number");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. sortItems
// ─────────────────────────────────────────────────────────────────────────────
describe("sortItems()", () => {
  const items = [
    { name: "Banana", price: 0.8, quantity: 5 },
    { name: "Apple", price: 1.5, quantity: 2 },
    { name: "Cherry", price: 3.0, quantity: 8 },
  ];

  it("sorts by price ascending by default", () => {
    expect(sortItems(items).map((i) => i.price)).toEqual([0.8, 1.5, 3.0]);
  });

  it("sorts by price descending", () => {
    expect(sortItems(items, "price", "desc").map((i) => i.price)).toEqual([
      3.0, 1.5, 0.8,
    ]);
  });

  it("sorts by name A→Z", () => {
    expect(sortItems(items, "name", "asc").map((i) => i.name)).toEqual([
      "Apple",
      "Banana",
      "Cherry",
    ]);
  });

  it("sorts by name Z→A", () => {
    expect(sortItems(items, "name", "desc").map((i) => i.name)).toEqual([
      "Cherry",
      "Banana",
      "Apple",
    ]);
  });

  it("sorts by quantity ascending", () => {
    expect(sortItems(items, "quantity", "asc").map((i) => i.quantity)).toEqual([
      2, 5, 8,
    ]);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    sortItems(items, "price", "desc");
    expect(items).toEqual(original);
  });

  it("throws for an invalid sort field", () => {
    expect(() => sortItems(items, "color")).toThrow(
      "Invalid sort field: color",
    );
  });

  it("throws for an invalid direction", () => {
    expect(() => sortItems(items, "price", "sideways")).toThrow(
      "Invalid direction: sideways",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. mergeDuplicates
// ─────────────────────────────────────────────────────────────────────────────
describe("mergeDuplicates()", () => {
  it("merges same-name items by summing quantities", () => {
    const cart = [
      { name: "Apple", price: 1.5, quantity: 2 },
      { name: "Apple", price: 1.5, quantity: 3 },
      { name: "Milk", price: 1.2, quantity: 1 },
    ];
    const merged = mergeDuplicates(cart);
    expect(merged).toHaveLength(2);
    expect(merged.find((i) => i.name === "Apple").quantity).toBe(5);
  });

  it("returns unchanged when no duplicates", () => {
    const cart = [
      { name: "Apple", price: 1.5, quantity: 2 },
      { name: "Milk", price: 1.2, quantity: 1 },
    ];
    expect(mergeDuplicates(cart)).toHaveLength(2);
  });

  it("returns empty array for empty cart", () => {
    expect(mergeDuplicates([])).toEqual([]);
  });

  it("merges three entries of the same item", () => {
    const cart = [
      { name: "Pen", price: 0.5, quantity: 1 },
      { name: "Pen", price: 0.5, quantity: 4 },
      { name: "Pen", price: 0.5, quantity: 5 },
    ];
    const merged = mergeDuplicates(cart);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. applyBulkDiscounts — tiered logic
// ─────────────────────────────────────────────────────────────────────────────
describe("applyBulkDiscounts()", () => {
  it("no discount when quantity < 5", () => {
    expect(
      applyBulkDiscounts([{ name: "A", price: 10, quantity: 4 }])[0]
        .discountedPrice,
    ).toBe(10);
  });

  it("8% discount at exactly qty 5", () => {
    expect(
      applyBulkDiscounts([{ name: "B", price: 10, quantity: 5 }])[0]
        .discountedPrice,
    ).toBe(9.2);
  });

  it("8% discount between qty 5–9", () => {
    expect(
      applyBulkDiscounts([{ name: "C", price: 20, quantity: 9 }])[0]
        .discountedPrice,
    ).toBe(18.4);
  });

  it("15% discount at exactly qty 10", () => {
    expect(
      applyBulkDiscounts([{ name: "D", price: 10, quantity: 10 }])[0]
        .discountedPrice,
    ).toBe(8.5);
  });

  it("15% discount above qty 10", () => {
    expect(
      applyBulkDiscounts([{ name: "E", price: 100, quantity: 50 }])[0]
        .discountedPrice,
    ).toBe(85);
  });

  it("applies correct tier per item in a mixed cart", () => {
    const items = [
      { name: "Low", price: 10, quantity: 3 },
      { name: "Mid", price: 10, quantity: 7 },
      { name: "High", price: 10, quantity: 15 },
    ];
    const result = applyBulkDiscounts(items);
    expect(result[0].discountedPrice).toBe(10);
    expect(result[1].discountedPrice).toBe(9.2);
    expect(result[2].discountedPrice).toBe(8.5);
  });

  it("does not mutate original items", () => {
    const items = [{ name: "X", price: 5, quantity: 10 }];
    applyBulkDiscounts(items);
    expect(items[0]).not.toHaveProperty("discountedPrice");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. fetchProduct — async
// ─────────────────────────────────────────────────────────────────────────────
describe("fetchProduct()", () => {
  it("resolves with the correct product for a valid ID", async () => {
    const product = await fetchProduct(1);
    expect(product).toMatchObject({
      id: 1,
      name: "Laptop",
      price: 999.99,
      category: "electronics",
    });
  });

  it("returns all expected fields", async () => {
    const product = await fetchProduct(2);
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("category");
    expect(product).toHaveProperty("stock");
  });

  it("rejects for a non-existent product ID", async () => {
    await expect(fetchProduct(999)).rejects.toThrow(
      "Product with ID 999 not found",
    );
  });

  it("throws for zero or negative IDs", async () => {
    await expect(fetchProduct(0)).rejects.toThrow(
      "Product ID must be a positive number",
    );
    await expect(fetchProduct(-5)).rejects.toThrow(
      "Product ID must be a positive number",
    );
  });

  it("throws for a non-number ID", async () => {
    await expect(fetchProduct("abc")).rejects.toThrow(
      "Product ID must be a positive number",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. fetchMultipleProducts — async concurrency
// ─────────────────────────────────────────────────────────────────────────────
describe("fetchMultipleProducts()", () => {
  it("fetches multiple products in the correct order", async () => {
    const products = await fetchMultipleProducts([1, 3, 4]);
    expect(products).toHaveLength(3);
    expect(products[0].name).toBe("Laptop");
    expect(products[1].name).toBe("Desk Chair");
    expect(products[2].name).toBe("Coffee Mug");
  });

  it("fetches a single product in array form", async () => {
    const products = await fetchMultipleProducts([2]);
    expect(products[0].name).toBe("Headphones");
  });

  it("rejects if any single product ID is not found", async () => {
    await expect(fetchMultipleProducts([1, 999])).rejects.toThrow(
      "Product with ID 999 not found",
    );
  });

  it("throws for an empty IDs array", async () => {
    await expect(fetchMultipleProducts([])).rejects.toThrow(
      "IDs must be a non-empty array",
    );
  });

  it("throws for non-array input", async () => {
    await expect(fetchMultipleProducts(1)).rejects.toThrow(
      "IDs must be a non-empty array",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. validateStock — async
// ─────────────────────────────────────────────────────────────────────────────
describe("validateStock()", () => {
  it("returns valid:true when all quantities are within stock", async () => {
    const result = await validateStock([
      { id: 1, quantity: 2 },
      { id: 2, quantity: 5 },
    ]);
    expect(result.valid).toBe(true);
    expect(result.outOfStock).toEqual([]);
  });

  it("returns valid:false when a quantity exceeds stock", async () => {
    const result = await validateStock([{ id: 3, quantity: 10 }]); // Desk Chair stock=3
    expect(result.valid).toBe(false);
    expect(result.outOfStock[0].name).toBe("Desk Chair");
    expect(result.outOfStock[0].requested).toBe(10);
  });

  it("reports multiple out-of-stock items", async () => {
    const result = await validateStock([
      { id: 1, quantity: 100 },
      { id: 3, quantity: 100 },
    ]);
    expect(result.valid).toBe(false);
    expect(result.outOfStock).toHaveLength(2);
  });

  it("accepts qty exactly equal to stock (boundary)", async () => {
    const result = await validateStock([{ id: 1, quantity: 5 }]); // Laptop stock=5
    expect(result.valid).toBe(true);
  });

  it("throws when cartItems is not an array", async () => {
    await expect(validateStock(null)).rejects.toThrow(
      "Cart items must be an array",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. placeOrder — full async integration
// ─────────────────────────────────────────────────────────────────────────────
describe("placeOrder()", () => {
  it("returns complete order summary with correct fields", async () => {
    const order = await placeOrder([{ id: 4, quantity: 2 }]); // Coffee Mug ×2 = $25.98
    expect(order).toHaveProperty("items");
    expect(order).toHaveProperty("subtotal");
    expect(order).toHaveProperty("discount");
    expect(order).toHaveProperty("shipping");
    expect(order).toHaveProperty("total");
    expect(order.subtotal).toBe(25.98);
    expect(order.discount).toBe(0);
    expect(order.shipping).toBe(5.99);
    expect(order.total).toBe(31.97);
  });

  it("applies SAVE10 and recalculates correctly", async () => {
    const order = await placeOrder([{ id: 2, quantity: 1 }], "SAVE10"); // Headphones $79.99
    expect(order.subtotal).toBe(79.99);
    expect(order.discount).toBe(8);
    expect(order.shipping).toBe(0); // discounted total still ≥ 50
    expect(order.total).toBe(71.99);
  });

  it("gives free shipping when discounted total is still >= 50", async () => {
    const order = await placeOrder([{ id: 3, quantity: 1 }], "HALFOFF"); // Chair $249.99 → $125
    expect(order.shipping).toBe(0);
  });

  it("charges shipping when discount drops total below 50", async () => {
    const order = await placeOrder([{ id: 4, quantity: 3 }], "SAVE20"); // $38.97 → $31.18
    expect(order.shipping).toBe(5.99);
  });

  it("handles a multi-item order correctly", async () => {
    const order = await placeOrder([
      { id: 2, quantity: 1 }, // $79.99
      { id: 4, quantity: 2 }, // $25.98
    ]);
    expect(order.subtotal).toBe(105.97);
    expect(order.shipping).toBe(0);
  });

  it("throws when requested quantity exceeds stock", async () => {
    await expect(placeOrder([{ id: 3, quantity: 50 }])).rejects.toThrow(
      "Out of stock: Desk Chair",
    );
  });

  it("throws for an empty cart", async () => {
    await expect(placeOrder([])).rejects.toThrow("Cart cannot be empty");
  });

  it("throws when cartItems is not an array", async () => {
    await expect(placeOrder(null)).rejects.toThrow("Cart cannot be empty");
  });
});

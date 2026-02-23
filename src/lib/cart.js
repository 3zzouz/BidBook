/**
 * Shopping Cart Business Logic
 * Pure functions — easy to test, easy to reuse in React components.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SYNCHRONOUS FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the total price of items in the cart.
 * @param {Array} items - Array of { name, price, quantity }
 * @returns {number} Total price rounded to 2 decimal places
 */
export function calculateTotal(items) {
  if (!Array.isArray(items)) throw new Error('Items must be an array');
  const total = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number')
      throw new Error('Price and quantity must be numbers');
    if (item.price < 0 || item.quantity < 0)
      throw new Error('Price and quantity must be non-negative');
    return sum + item.price * item.quantity;
  }, 0);
  return parseFloat(total.toFixed(2));
}

/**
 * Applies a discount code to a total.
 * @param {number} total
 * @param {string} code
 * @returns {number} Discounted total
 */
export function applyDiscount(total, code) {
  const discounts = {
    SAVE10: 0.10,
    SAVE20: 0.20,
    HALFOFF: 0.50,
  };
  if (typeof total !== 'number') throw new Error('Total must be a number');
  if (total < 0) throw new Error('Total cannot be negative');
  const rate = discounts[code];
  if (!rate) return total;
  return parseFloat((total * (1 - rate)).toFixed(2));
}

/**
 * Filters items in the cart by category.
 * @param {Array} items
 * @param {string} category
 * @returns {Array}
 */
export function filterByCategory(items, category) {
  if (!Array.isArray(items)) throw new Error('Items must be an array');
  if (typeof category !== 'string' || category.trim() === '')
    throw new Error('Category must be a non-empty string');
  return items.filter(item => item.category === category);
}

/**
 * Checks if the cart is eligible for free shipping (total >= 50).
 * @param {number} total
 * @returns {boolean}
 */
export function isFreeShipping(total) {
  if (typeof total !== 'number') throw new Error('Total must be a number');
  return total >= 50;
}

/**
 * Sorts items by a given field and direction without mutating original.
 * @param {Array} items
 * @param {'price'|'name'|'quantity'} field
 * @param {'asc'|'desc'} direction
 * @returns {Array}
 */
export function sortItems(items, field = 'price', direction = 'asc') {
  if (!Array.isArray(items)) throw new Error('Items must be an array');
  const allowed = ['price', 'name', 'quantity'];
  if (!allowed.includes(field)) throw new Error(`Invalid sort field: ${field}`);
  if (!['asc', 'desc'].includes(direction)) throw new Error(`Invalid direction: ${direction}`);

  return [...items].sort((a, b) => {
    const va = a[field];
    const vb = b[field];
    if (typeof va === 'string') {
      return direction === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return direction === 'asc' ? va - vb : vb - va;
  });
}

/**
 * Merges duplicate items (same name) by summing their quantities.
 * @param {Array} items
 * @returns {Array}
 */
export function mergeDuplicates(items) {
  if (!Array.isArray(items)) throw new Error('Items must be an array');
  const map = new Map();
  for (const item of items) {
    if (map.has(item.name)) {
      map.get(item.name).quantity += item.quantity;
    } else {
      map.set(item.name, { ...item });
    }
  }
  return Array.from(map.values());
}

/**
 * Applies tiered bulk discounts:
 *   qty >= 10 → 15% off, qty >= 5 → 8% off, else no discount.
 * @param {Array} items
 * @returns {Array} Items with discountedPrice field added
 */
export function applyBulkDiscounts(items) {
  if (!Array.isArray(items)) throw new Error('Items must be an array');
  return items.map(item => {
    let rate = 0;
    if (item.quantity >= 10) rate = 0.15;
    else if (item.quantity >= 5) rate = 0.08;
    return {
      ...item,
      discountedPrice: parseFloat((item.price * (1 - rate)).toFixed(2)),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC FUNCTIONS (simulate API/network calls)
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCT_DB = {
  1: { id: 1, name: 'Laptop',      price: 999.99, category: 'electronics', stock: 5  },
  2: { id: 2, name: 'Headphones',  price: 79.99,  category: 'electronics', stock: 20 },
  3: { id: 3, name: 'Desk Chair',  price: 249.99, category: 'furniture',   stock: 3  },
  4: { id: 4, name: 'Coffee Mug',  price: 12.99,  category: 'kitchenware', stock: 50 },
}

/**
 * Simulates fetching a single product by ID (50ms latency).
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function fetchProduct(id) {
  if (typeof id !== 'number' || id <= 0)
    throw new Error('Product ID must be a positive number');

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = PRODUCT_DB[id];
      if (product) resolve({ ...product });
      else reject(new Error(`Product with ID ${id} not found`));
    }, 50);
  });
}

/**
 * Fetches multiple products concurrently.
 * @param {number[]} ids
 * @returns {Promise<Object[]>}
 */
export async function fetchMultipleProducts(ids) {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new Error('IDs must be a non-empty array');
  return Promise.all(ids.map(id => fetchProduct(id)));
}

/**
 * Validates stock availability for cart items.
 * @param {Array} cartItems - Array of { id, quantity }
 * @returns {Promise<{ valid: boolean, outOfStock: Array }>}
 */
export async function validateStock(cartItems) {
  if (!Array.isArray(cartItems)) throw new Error('Cart items must be an array');
  const products = await fetchMultipleProducts(cartItems.map(i => i.id));
  const outOfStock = [];
  for (let i = 0; i < cartItems.length; i++) {
    if (cartItems[i].quantity > products[i].stock) {
      outOfStock.push({ ...products[i], requested: cartItems[i].quantity });
    }
  }
  return { valid: outOfStock.length === 0, outOfStock };
}

/**
 * Places a full order: validates stock → computes total → applies discount → adds shipping.
 * @param {Array} cartItems - Array of { id, quantity }
 * @param {string} [code]   - Optional discount code
 * @returns {Promise<Object>} Order summary
 */
export async function placeOrder(cartItems, code = '') {
  if (!Array.isArray(cartItems) || cartItems.length === 0)
    throw new Error('Cart cannot be empty');

  const { valid, outOfStock } = await validateStock(cartItems);
  if (!valid) {
    const names = outOfStock.map(p => p.name).join(', ');
    throw new Error(`Out of stock: ${names}`);
  }

  const products = await fetchMultipleProducts(cartItems.map(i => i.id));
  const enriched = cartItems.map((item, i) => ({ ...products[i], quantity: item.quantity }));

  const subtotal = calculateTotal(enriched);
  const total    = code ? applyDiscount(subtotal, code) : subtotal;
  const shipping = isFreeShipping(total) ? 0 : 5.99;

  return {
    items:    enriched,
    subtotal,
    discount: parseFloat((subtotal - total).toFixed(2)),
    shipping,
    total:    parseFloat((total + shipping).toFixed(2)),
  };
}

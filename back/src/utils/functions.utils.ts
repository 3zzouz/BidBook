/**
 * Utility functions for testing
 */

/**
 * Transform a string to uppercase
 * @param text - The input string
 * @returns The uppercase string
 */
export function transformer(text: string): string {
  return text.toUpperCase();
}

/**
 * Sort an array of numbers in ascending order
 * @param array - The array to sort
 * @returns The sorted array
 */
export function trier(array: number[]): number[] {
  return array.slice().sort((a, b) => a - b);
}

/**
 * Check if a price is within a given range
 * @param price - The price to check
 * @param min - Minimum price (inclusive)
 * @param max - Maximum price (inclusive)
 * @returns true if price is in range, false otherwise
 */
export function isPriceInRange(price: number, min: number, max: number): boolean {
  return price >= min && price <= max;
}

/**
 * Async function to fetch random user data
 * @returns A promise with user data
 */
export async function fetchRandomUser() {
  const response = await fetch('https://randomuser.me/api/');
  if (!response.ok) {
    throw new Error('Failed to fetch random user');
  }
  const data = await response.json();
  return data.results[0];
}

/**
 * Calculate sum of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns The sum
 */
export function add(a: number, b: number): number {
  return a + b;
}

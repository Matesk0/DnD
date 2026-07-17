/**
 * Tabletop RPG mechanical math helper functions.
 */

/**
 * Calculates the D&D 5e / PF2e ability modifier for a given score.
 * Formula: floor((score - 10) / 2)
 */
export function calculateStatMod(score: number): number {
  if (isNaN(score)) return 0;
  return Math.floor((score - 10) / 2);
}

/**
 * Simulates rolling multiple dice of a specific type.
 */
export function rollDiceString(count: number, sides: number): { results: number[]; total: number } {
  if (count <= 0 || sides <= 0) {
    return { results: [], total: 0 };
  }
  const results: number[] = [];
  let total = 0;
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    results.push(roll);
    total += roll;
  }
  return { results, total };
}

import { calculateStatMod, rollDiceString } from './tabletop-math';

describe('Tabletop Math Calculations', () => {
  describe('calculateStatMod', () => {
    it('calculates D&D modifiers correctly for positive values', () => {
      expect(calculateStatMod(10)).toBe(0);
      expect(calculateStatMod(12)).toBe(1);
      expect(calculateStatMod(15)).toBe(2);
      expect(calculateStatMod(18)).toBe(4);
    });

    it('calculates D&D modifiers correctly for negative values', () => {
      expect(calculateStatMod(8)).toBe(-1);
      expect(calculateStatMod(5)).toBe(-3);
    });

    it('returns 0 for NaN values', () => {
      expect(calculateStatMod(NaN)).toBe(0);
    });
  });

  describe('rollDiceString', () => {
    it('returns empty results if count or sides is 0 or negative', () => {
      expect(rollDiceString(0, 6)).toEqual({ results: [], total: 0 });
      expect(rollDiceString(2, 0)).toEqual({ results: [], total: 0 });
      expect(rollDiceString(-1, 20)).toEqual({ results: [], total: 0 });
    });

    it('returns correct number of rolls and totals within expected boundaries', () => {
      const { results, total } = rollDiceString(5, 6);
      expect(results.length).toBe(5);
      results.forEach((roll) => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(6);
      });
      const sum = results.reduce((acc, r) => acc + r, 0);
      expect(total).toBe(sum);
      expect(total).toBeGreaterThanOrEqual(5);
      expect(total).toBeLessThanOrEqual(30);
    });
  });
});

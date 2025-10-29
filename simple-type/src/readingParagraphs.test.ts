import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { READING_PARAGRAPHS, shuffleArray } from './readingParagraphs';

describe('readingParagraphs', () => {
  describe('READING_PARAGRAPHS', () => {
    it('should contain paragraphs', () => {
      expect(READING_PARAGRAPHS).toBeDefined();
      expect(Array.isArray(READING_PARAGRAPHS)).toBe(true);
      expect(READING_PARAGRAPHS.length).toBeGreaterThan(0);
    });

    it('should have exactly 79 paragraphs', () => {
      expect(READING_PARAGRAPHS.length).toBe(79);
    });

    it('should contain only strings', () => {
      READING_PARAGRAPHS.forEach(paragraph => {
        expect(typeof paragraph).toBe('string');
      });
    });

    it('should have no empty paragraphs', () => {
      READING_PARAGRAPHS.forEach(paragraph => {
        expect(paragraph.length).toBeGreaterThan(0);
      });
    });

    it('should contain age-appropriate content', () => {
      // Check that paragraphs are reasonably short (appropriate for first graders)
      READING_PARAGRAPHS.forEach(paragraph => {
        expect(paragraph.length).toBeLessThan(500); // Reasonable max length
      });
    });

    it('should contain expected sample paragraphs', () => {
      // Test a few known paragraphs to ensure content integrity
      expect(READING_PARAGRAPHS).toContain(
        "I have a brown dog. His name is Max. Max likes to run and play. He can catch a ball."
      );
      expect(READING_PARAGRAPHS).toContain(
        "Mom and I went to the park. We played on the swings. Then we had a picnic. It was a fun day."
      );
      expect(READING_PARAGRAPHS).toContain(
        "I go to school on the bus. The bus is big and yellow. My friends ride with me. We sing songs on the way."
      );
    });
  });

  describe('shuffleArray', () => {
    beforeEach(() => {
      // Mock Math.random for predictable tests
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return an array of the same length', () => {
      const input = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(input);
      expect(shuffled.length).toBe(input.length);
    });

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(input);

      input.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not modify the original array', () => {
      const input = [1, 2, 3, 4, 5];
      const originalCopy = [...input];
      shuffleArray(input);

      expect(input).toEqual(originalCopy);
    });

    it('should shuffle strings correctly', () => {
      const input = ['a', 'b', 'c', 'd', 'e'];
      const shuffled = shuffleArray(input);

      expect(shuffled.length).toBe(input.length);
      input.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should handle empty array', () => {
      const input: number[] = [];
      const shuffled = shuffleArray(input);

      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const input = [42];
      const shuffled = shuffleArray(input);

      expect(shuffled).toEqual([42]);
    });

    it('should produce different orders on different calls (probabilistic test)', () => {
      vi.restoreAllMocks(); // Use real Math.random for this test

      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results: string[] = [];

      // Run shuffle multiple times
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleArray(input);
        results.push(JSON.stringify(shuffled));
      }

      // Check that we got at least 2 different orders
      // (extremely unlikely to get same order 10 times for 10 elements)
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should work with Fisher-Yates algorithm correctly', () => {
      // Mock Math.random to return predictable values
      const randomValues = [0.9, 0.8, 0.7, 0.6, 0.5];
      let callIndex = 0;

      (Math.random as any).mockImplementation(() => {
        return randomValues[callIndex++ % randomValues.length];
      });

      const input = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(input);

      // Should still contain all elements
      expect(shuffled.length).toBe(5);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should work with objects', () => {
      const input = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
      ];

      const shuffled = shuffleArray(input);

      expect(shuffled.length).toBe(3);
      expect(shuffled).toContainEqual({ id: 1, name: 'Alice' });
      expect(shuffled).toContainEqual({ id: 2, name: 'Bob' });
      expect(shuffled).toContainEqual({ id: 3, name: 'Charlie' });
    });
  });
});

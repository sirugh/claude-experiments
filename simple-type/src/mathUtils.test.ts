import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  type Operation,
  type Problem,
  type DifficultyConfig,
  PROBLEM_TYPES,
  getDifficultyConfig,
  generateNumber,
  generateProblem,
  generateTileOptions,
  getOperationSymbol,
} from './mathUtils';

describe('mathUtils', () => {
  describe('PROBLEM_TYPES', () => {
    it('should define all problem types', () => {
      expect(PROBLEM_TYPES.SINGLE_SINGLE).toBeDefined();
      expect(PROBLEM_TYPES.SINGLE_DOUBLE).toBeDefined();
      expect(PROBLEM_TYPES.DOUBLE_SINGLE).toBeDefined();
      expect(PROBLEM_TYPES.DOUBLE_SMALL).toBeDefined();
      expect(PROBLEM_TYPES.DOUBLE_MEDIUM).toBeDefined();
      expect(PROBLEM_TYPES.DOUBLE_LARGE).toBeDefined();
    });

    it('should have correct ranges for SINGLE_SINGLE', () => {
      expect(PROBLEM_TYPES.SINGLE_SINGLE.num1Range).toEqual({ min: 1, max: 9 });
      expect(PROBLEM_TYPES.SINGLE_SINGLE.num2Range).toEqual({ min: 1, max: 9 });
    });

    it('should have correct ranges for DOUBLE_LARGE', () => {
      expect(PROBLEM_TYPES.DOUBLE_LARGE.num1Range).toEqual({ min: 70, max: 99 });
      expect(PROBLEM_TYPES.DOUBLE_LARGE.num2Range).toEqual({ min: 70, max: 99 });
    });
  });

  describe('getDifficultyConfig', () => {
    it('should return level 1 config for score < 10', () => {
      const config = getDifficultyConfig(5, []);
      expect(config.availableProblemTypes).toHaveLength(1);
      expect(config.availableProblemTypes[0]).toEqual(PROBLEM_TYPES.SINGLE_SINGLE);
      expect(config.operations).toEqual(['addition']);
    });

    it('should return level 2 config for score 10-19', () => {
      const config = getDifficultyConfig(15, []);
      expect(config.availableProblemTypes).toHaveLength(1);
      expect(config.availableProblemTypes[0]).toEqual(PROBLEM_TYPES.SINGLE_SINGLE);
      expect(config.operations).toEqual(['addition', 'subtraction']);
    });

    it('should return level 3 config for score 20-34', () => {
      const config = getDifficultyConfig(25, []);
      expect(config.availableProblemTypes).toHaveLength(3);
      expect(config.operations).toEqual(['addition', 'subtraction']);
    });

    it('should return level 4 config for score 35-49', () => {
      const config = getDifficultyConfig(40, []);
      expect(config.availableProblemTypes).toHaveLength(4);
    });

    it('should return level 5 config for score 50-69', () => {
      const config = getDifficultyConfig(60, []);
      expect(config.availableProblemTypes).toHaveLength(5);
    });

    it('should return level 6 config for score >= 70', () => {
      const config = getDifficultyConfig(75, []);
      expect(config.availableProblemTypes).toHaveLength(6);
    });

    it('should reduce difficulty when success rate < 60% with enough history', () => {
      // 4 correct out of 10 = 40% success rate
      const history = [true, false, false, false, true, false, false, true, false, true];
      const config = getDifficultyConfig(75, history); // Would normally be level 6

      // Should have one less problem type
      expect(config.availableProblemTypes).toHaveLength(5);
    });

    it('should not reduce difficulty when success rate is 60% or higher', () => {
      // 7 correct out of 10 = 70% success rate
      const history = [true, true, false, true, true, false, true, false, true, true];
      const config = getDifficultyConfig(75, history);

      // Should still have all 6 problem types
      expect(config.availableProblemTypes).toHaveLength(6);
    });

    it('should not reduce difficulty when performance history is too short', () => {
      const history = [false, false, false]; // Only 3 attempts
      const config = getDifficultyConfig(75, history);

      // Should still have all 6 problem types (not enough data to adjust)
      expect(config.availableProblemTypes).toHaveLength(6);
    });

    it('should not reduce difficulty below 1 problem type', () => {
      const history = [false, false, false, false, false, false, false, false, false, false];
      const config = getDifficultyConfig(5, history); // Level 1 with poor performance

      // Should still have at least 1 problem type
      expect(config.availableProblemTypes.length).toBeGreaterThan(0);
    });

    it('should use only last 10 performance entries', () => {
      // 15 attempts, last 10 are all correct
      const history = [false, false, false, false, false, true, true, true, true, true, true, true, true, true, true];
      const config = getDifficultyConfig(75, history);

      // Should have all 6 problem types (100% recent success)
      expect(config.availableProblemTypes).toHaveLength(6);
    });
  });

  describe('generateNumber', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate number within range', () => {
      vi.restoreAllMocks(); // Use real Math.random

      const range = { min: 1, max: 9 };
      for (let i = 0; i < 100; i++) {
        const num = generateNumber(range);
        expect(num).toBeGreaterThanOrEqual(range.min);
        expect(num).toBeLessThanOrEqual(range.max);
      }
    });

    it('should generate min value when Math.random returns 0', () => {
      (Math.random as any).mockReturnValue(0);
      const range = { min: 5, max: 10 };
      expect(generateNumber(range)).toBe(5);
    });

    it('should generate max value when Math.random returns close to 1', () => {
      (Math.random as any).mockReturnValue(0.999);
      const range = { min: 5, max: 10 };
      expect(generateNumber(range)).toBe(10);
    });

    it('should handle single value range', () => {
      const range = { min: 7, max: 7 };
      const num = generateNumber(range);
      expect(num).toBe(7);
    });
  });

  describe('generateProblem', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate valid addition problem', () => {
      (Math.random as any).mockReturnValue(0.5);

      const config: DifficultyConfig = {
        availableProblemTypes: [PROBLEM_TYPES.SINGLE_SINGLE],
        operations: ['addition']
      };

      const problem = generateProblem(config);

      expect(problem.operation).toBe('addition');
      expect(problem.answer).toBe(problem.num1 + problem.num2);
      expect(problem.num1).toBeGreaterThanOrEqual(1);
      expect(problem.num1).toBeLessThanOrEqual(9);
      expect(problem.num2).toBeGreaterThanOrEqual(1);
      expect(problem.num2).toBeLessThanOrEqual(9);
    });

    it('should generate valid subtraction problem with positive result', () => {
      vi.restoreAllMocks(); // Use real random for this test

      const config: DifficultyConfig = {
        availableProblemTypes: [PROBLEM_TYPES.SINGLE_SINGLE],
        operations: ['subtraction']
      };

      // Test multiple times to ensure consistency
      for (let i = 0; i < 50; i++) {
        const problem = generateProblem(config);

        expect(problem.operation).toBe('subtraction');
        expect(problem.answer).toBeGreaterThanOrEqual(0);
        expect(problem.answer).toBe(problem.num1 - problem.num2);
        expect(problem.num1).toBeGreaterThanOrEqual(problem.num2); // Ensures positive result
      }
    });

    it('should generate valid multiplication problem', () => {
      vi.restoreAllMocks();

      const config: DifficultyConfig = {
        availableProblemTypes: [PROBLEM_TYPES.DOUBLE_LARGE],
        operations: ['multiplication']
      };

      const problem = generateProblem(config);

      expect(problem.operation).toBe('multiplication');
      expect(problem.answer).toBe(problem.num1 * problem.num2);
      // Multiplication limits numbers to max 12 for first graders
      expect(problem.num1).toBeLessThanOrEqual(12);
      expect(problem.num2).toBeLessThanOrEqual(12);
    });

    it('should generate valid division problem with no remainder', () => {
      vi.restoreAllMocks();

      const config: DifficultyConfig = {
        availableProblemTypes: [PROBLEM_TYPES.SINGLE_SINGLE],
        operations: ['division']
      };

      for (let i = 0; i < 50; i++) {
        const problem = generateProblem(config);

        expect(problem.operation).toBe('division');
        expect(problem.num1 % problem.num2).toBe(0); // No remainder
        expect(problem.answer).toBe(problem.num1 / problem.num2);
        expect(problem.num2).toBeGreaterThanOrEqual(2); // Divisor >= 2
        expect(problem.num2).toBeLessThanOrEqual(12); // Divisor <= 12
      }
    });

    it('should select from multiple problem types', () => {
      vi.restoreAllMocks();

      const config: DifficultyConfig = {
        availableProblemTypes: [
          PROBLEM_TYPES.SINGLE_SINGLE,
          PROBLEM_TYPES.SINGLE_DOUBLE,
          PROBLEM_TYPES.DOUBLE_SINGLE,
        ],
        operations: ['addition']
      };

      const results = new Set<string>();

      // Generate many problems and check that we get variety
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem(config);
        const isNum1SingleDigit = problem.num1 < 10;
        const isNum2SingleDigit = problem.num2 < 10;
        results.add(`${isNum1SingleDigit}-${isNum2SingleDigit}`);
      }

      // Should have at least 2 different problem type patterns
      expect(results.size).toBeGreaterThan(1);
    });

    it('should select from multiple operations', () => {
      vi.restoreAllMocks();

      const config: DifficultyConfig = {
        availableProblemTypes: [PROBLEM_TYPES.SINGLE_SINGLE],
        operations: ['addition', 'subtraction']
      };

      const operations = new Set<Operation>();

      // Generate many problems
      for (let i = 0; i < 100; i++) {
        const problem = generateProblem(config);
        operations.add(problem.operation);
      }

      // Should have both operations
      expect(operations.size).toBe(2);
      expect(operations.has('addition')).toBe(true);
      expect(operations.has('subtraction')).toBe(true);
    });
  });

  describe('generateTileOptions', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should generate exactly 4 options', () => {
      vi.restoreAllMocks();

      const options = generateTileOptions(42);
      expect(options).toHaveLength(4);
    });

    it('should include the correct answer', () => {
      vi.restoreAllMocks();

      const correctAnswer = 15;
      const options = generateTileOptions(correctAnswer);

      expect(options).toContain(correctAnswer);
    });

    it('should generate unique options', () => {
      vi.restoreAllMocks();

      const options = generateTileOptions(20);
      const uniqueOptions = new Set(options);

      expect(uniqueOptions.size).toBe(4);
    });

    it('should only generate positive numbers', () => {
      vi.restoreAllMocks();

      // Test with small correct answer where negatives could be generated
      const options = generateTileOptions(5);

      options.forEach(option => {
        expect(option).toBeGreaterThan(0);
      });
    });

    it('should generate plausible incorrect answers within +/- 10', () => {
      vi.restoreAllMocks();

      const correctAnswer = 50;
      const options = generateTileOptions(correctAnswer);

      options.forEach(option => {
        expect(option).toBeGreaterThanOrEqual(correctAnswer - 10);
        expect(option).toBeLessThanOrEqual(correctAnswer + 10);
      });
    });

    it('should shuffle the options (non-deterministic positions)', () => {
      vi.restoreAllMocks();

      const correctAnswer = 25;
      const positions = new Set<number>();

      // Run multiple times and track where correct answer appears
      for (let i = 0; i < 20; i++) {
        const options = generateTileOptions(correctAnswer);
        const index = options.indexOf(correctAnswer);
        positions.add(index);
      }

      // Correct answer should appear in different positions
      expect(positions.size).toBeGreaterThan(1);
    });
  });

  describe('getOperationSymbol', () => {
    it('should return + for addition', () => {
      expect(getOperationSymbol('addition')).toBe('+');
    });

    it('should return - for subtraction', () => {
      expect(getOperationSymbol('subtraction')).toBe('-');
    });

    it('should return × for multiplication', () => {
      expect(getOperationSymbol('multiplication')).toBe('×');
    });

    it('should return ÷ for division', () => {
      expect(getOperationSymbol('division')).toBe('÷');
    });
  });
});

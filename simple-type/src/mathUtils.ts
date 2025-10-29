export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

export interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

export interface NumberRange {
  min: number;
  max: number;
}

export interface ProblemType {
  num1Range: NumberRange;
  num2Range: NumberRange;
  description: string;
}

export interface DifficultyConfig {
  availableProblemTypes: ProblemType[];
  operations: Operation[];
}

// Define all possible problem types
export const PROBLEM_TYPES = {
  // Level 1: Single digit + Single digit
  SINGLE_SINGLE: {
    num1Range: { min: 1, max: 9 },
    num2Range: { min: 1, max: 9 },
    description: 'Single digit + Single digit'
  },
  // Level 2: Single digit + Double digit (or vice versa)
  SINGLE_DOUBLE: {
    num1Range: { min: 1, max: 9 },
    num2Range: { min: 10, max: 99 },
    description: 'Single digit + Double digit'
  },
  DOUBLE_SINGLE: {
    num1Range: { min: 10, max: 99 },
    num2Range: { min: 1, max: 9 },
    description: 'Double digit + Single digit'
  },
  // Level 3: Double digit small + Double digit small
  DOUBLE_SMALL: {
    num1Range: { min: 10, max: 39 },
    num2Range: { min: 10, max: 39 },
    description: 'Double digit small + Double digit small'
  },
  // Level 4: Double digit medium + Double digit medium
  DOUBLE_MEDIUM: {
    num1Range: { min: 40, max: 69 },
    num2Range: { min: 40, max: 69 },
    description: 'Double digit medium + Double digit medium'
  },
  // Level 5: Double digit large + Double digit large
  DOUBLE_LARGE: {
    num1Range: { min: 70, max: 99 },
    num2Range: { min: 70, max: 99 },
    description: 'Double digit large + Double digit large'
  },
} as const;

/**
 * Determines difficulty configuration based on score and recent performance
 * @param score Current player score
 * @param performanceHistory Array of recent correct/incorrect attempts
 * @returns DifficultyConfig with available problem types and operations
 */
export function getDifficultyConfig(score: number, performanceHistory: boolean[]): DifficultyConfig {
  const recentPerformance = performanceHistory.slice(-10);
  const recentSuccessRate = recentPerformance.length > 0
    ? recentPerformance.filter(Boolean).length / recentPerformance.length
    : 0.5;

  let availableProblemTypes: ProblemType[] = [];
  let operations: Operation[] = ['addition'];

  if (score < 10) {
    // Level 1: Single digit + Single digit, addition only
    availableProblemTypes = [PROBLEM_TYPES.SINGLE_SINGLE];
    operations = ['addition'];
  } else if (score < 20) {
    // Level 2: Add subtraction to single digit problems
    availableProblemTypes = [PROBLEM_TYPES.SINGLE_SINGLE];
    operations = ['addition', 'subtraction'];
  } else if (score < 35) {
    // Level 3: Introduce single digit + double digit (both directions)
    availableProblemTypes = [
      PROBLEM_TYPES.SINGLE_SINGLE,
      PROBLEM_TYPES.SINGLE_DOUBLE,
      PROBLEM_TYPES.DOUBLE_SINGLE,
    ];
    operations = ['addition', 'subtraction'];
  } else if (score < 50) {
    // Level 4: Add double digit small + double digit small
    availableProblemTypes = [
      PROBLEM_TYPES.SINGLE_SINGLE,
      PROBLEM_TYPES.SINGLE_DOUBLE,
      PROBLEM_TYPES.DOUBLE_SINGLE,
      PROBLEM_TYPES.DOUBLE_SMALL,
    ];
    operations = ['addition', 'subtraction'];
  } else if (score < 70) {
    // Level 5: Add double digit medium + double digit medium
    availableProblemTypes = [
      PROBLEM_TYPES.SINGLE_SINGLE,
      PROBLEM_TYPES.SINGLE_DOUBLE,
      PROBLEM_TYPES.DOUBLE_SINGLE,
      PROBLEM_TYPES.DOUBLE_SMALL,
      PROBLEM_TYPES.DOUBLE_MEDIUM,
    ];
    operations = ['addition', 'subtraction'];
  } else {
    // Level 6: Add double digit large + double digit large
    availableProblemTypes = [
      PROBLEM_TYPES.SINGLE_SINGLE,
      PROBLEM_TYPES.SINGLE_DOUBLE,
      PROBLEM_TYPES.DOUBLE_SINGLE,
      PROBLEM_TYPES.DOUBLE_SMALL,
      PROBLEM_TYPES.DOUBLE_MEDIUM,
      PROBLEM_TYPES.DOUBLE_LARGE,
    ];
    operations = ['addition', 'subtraction'];
  }

  // Adaptive adjustment: if struggling (< 60% success), remove hardest problem type
  if (recentSuccessRate < 0.6 && recentPerformance.length >= 5 && availableProblemTypes.length > 1) {
    availableProblemTypes = availableProblemTypes.slice(0, -1);
  }
  // If doing very well (> 90% success) and not at max level, can progress faster
  // (This will naturally happen as score increases)

  return {
    availableProblemTypes,
    operations
  };
}

/**
 * Generates a random number within a specified range (inclusive)
 * @param range NumberRange with min and max values
 * @returns Random number between min and max (inclusive)
 */
export function generateNumber(range: NumberRange): number {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

/**
 * Generates a math problem based on difficulty configuration
 * @param config DifficultyConfig with available problem types and operations
 * @returns Problem with two numbers, operation, and correct answer
 */
export function generateProblem(config: DifficultyConfig): Problem {
  // Randomly select a problem type from available types
  const problemType = config.availableProblemTypes[
    Math.floor(Math.random() * config.availableProblemTypes.length)
  ];

  // Randomly select an operation from available operations
  const operation = config.operations[
    Math.floor(Math.random() * config.operations.length)
  ];

  let num1 = generateNumber(problemType.num1Range);
  let num2 = generateNumber(problemType.num2Range);
  let answer: number;

  switch (operation) {
    case 'addition':
      answer = num1 + num2;
      break;
    case 'subtraction':
      // Ensure positive results for first graders
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      break;
    case 'multiplication':
      // Keep multiplication simple for first graders
      num1 = Math.min(num1, 12);
      num2 = Math.min(num2, 12);
      answer = num1 * num2;
      break;
    case 'division':
      // Ensure clean division with no remainders
      num2 = Math.max(2, Math.min(num2, 12));
      answer = generateNumber({ min: 1, max: 12 });
      num1 = num2 * answer;
      break;
  }

  return { num1, num2, operation, answer };
}

/**
 * Generates 4 answer options for tile mode (3 incorrect + 1 correct)
 * @param correctAnswer The correct answer to the problem
 * @returns Array of 4 numbers shuffled (includes the correct answer)
 */
export function generateTileOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);

  // Generate 3 plausible incorrect answers
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10; // Random offset between -10 and +10
    const incorrectAnswer = correctAnswer + offset;

    // Only add positive numbers
    if (incorrectAnswer > 0 && incorrectAnswer !== correctAnswer) {
      options.add(incorrectAnswer);
    }
  }

  // Shuffle the options
  return Array.from(options).sort(() => Math.random() - 0.5);
}

/**
 * Gets the symbol for a math operation
 * @param operation The operation type
 * @returns String symbol for the operation
 */
export function getOperationSymbol(operation: Operation): string {
  switch (operation) {
    case 'addition': return '+';
    case 'subtraction': return '-';
    case 'multiplication': return '×';
    case 'division': return '÷';
  }
}

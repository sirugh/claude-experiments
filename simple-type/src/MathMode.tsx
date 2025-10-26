import { useState, useEffect, useRef } from 'react';
import './MathMode.css';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
type MathMode = 'standard' | 'tiles';

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

interface NumberRange {
  min: number;
  max: number;
}

interface ProblemType {
  num1Range: NumberRange;
  num2Range: NumberRange;
  description: string;
}

interface DifficultyConfig {
  availableProblemTypes: ProblemType[];
  operations: Operation[];
}

interface Config {
  mode: MathMode;
}

const SCORE_KEY = 'app:simple-type:score';
const CONFIG_KEY = 'app:simple-type:math-config';

// Define all possible problem types
const PROBLEM_TYPES = {
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
};

function MathMode() {
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem(SCORE_KEY);
    return savedScore ? parseInt(savedScore, 10) : 0;
  });
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        return {
          mode: parsed.mode ?? 'standard',
        };
      } catch {
        return { mode: 'standard' };
      }
    }
    return { mode: 'standard' };
  });
  const [isStarted, setIsStarted] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<boolean[]>([]);
  const [tileOptions, setTileOptions] = useState<number[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Difficulty progression based on score
  // Each level includes all problem types from previous levels
  const getDifficultyConfig = (): DifficultyConfig => {
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
  };

  const generateNumber = (range: NumberRange): number => {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  };

  const generateProblem = (): Problem => {
    const config = getDifficultyConfig();

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
  };

  // Generate incorrect answer options for tiles mode
  const generateTileOptions = (correctAnswer: number): number[] => {
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
  };

  useEffect(() => {
    if (isStarted) {
      const newProblem = generateProblem();
      setProblem(newProblem);

      if (config.mode === 'tiles') {
        setTileOptions(generateTileOptions(newProblem.answer));
      }
    }
  }, [isStarted]);

  useEffect(() => {
    // Auto-focus input when problem changes (only in standard mode)
    if (inputRef.current && config.mode === 'standard') {
      inputRef.current.focus();
    }
  }, [problem, config.mode]);

  useEffect(() => {
    // Save score to localStorage whenever it changes
    localStorage.setItem(SCORE_KEY, score.toString());
  }, [score]);

  useEffect(() => {
    // Save config to localStorage whenever it changes
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  const getOperationSymbol = (operation: Operation): string => {
    switch (operation) {
      case 'addition': return '+';
      case 'subtraction': return '-';
      case 'multiplication': return '×';
      case 'division': return '÷';
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!problem || userAnswer === '') return;

    const isCorrect = parseInt(userAnswer) === problem.answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setPerformanceHistory([...performanceHistory, isCorrect]);

    if (isCorrect) {
      setScore(score + 1);
    }

    // Clear feedback and generate new problem after delay
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      const newProblem = generateProblem();
      setProblem(newProblem);
    }, 800);
  };

  const handleTileClick = (selectedAnswer: number) => {
    if (!problem || selectedTile !== null) return;

    setSelectedTile(selectedAnswer);
    const isCorrect = selectedAnswer === problem.answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setPerformanceHistory([...performanceHistory, isCorrect]);

    if (isCorrect) {
      setScore(score + 1);

      // Generate new problem after delay (only on correct answer)
      setTimeout(() => {
        setFeedback(null);
        setSelectedTile(null);
        const newProblem = generateProblem();
        setProblem(newProblem);
        setTileOptions(generateTileOptions(newProblem.answer));
      }, 800);
    } else {
      // Allow retry after brief delay
      setTimeout(() => {
        setFeedback(null);
        setSelectedTile(null);
      }, 500);
    }
  };

  const handleReset = () => {
    setScore(0);
    setPerformanceHistory([]);
    localStorage.setItem(SCORE_KEY, '0');
  };

  // Render start screen
  if (!isStarted) {
    return (
      <div className="math-mode">
        <div className="start-screen">
          <h1>Math Practice</h1>
          <p className="instructions">
            Solve math problems to improve your skills!
            <br />
            Choose your preferred mode below.
          </p>

          <div className="config-options">
            <label className="config-option">
              <input
                type="radio"
                name="mode"
                value="standard"
                checked={config.mode === 'standard'}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as MathMode })}
              />
              <span>Standard</span>
              <span className="mode-description">Type the answer</span>
            </label>

            <label className="config-option">
              <input
                type="radio"
                name="mode"
                value="tiles"
                checked={config.mode === 'tiles'}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as MathMode })}
              />
              <span>Tiles</span>
              <span className="mode-description">Choose from 4 options</span>
            </label>
          </div>

          <button className="start-button" onClick={handleStart}>
            Start
          </button>
        </div>
      </div>
    );
  }

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="math-mode">
      <button className="reset-button" onClick={handleReset}>
        Reset
      </button>

      <div className="score-display">Score: {score}</div>

      {config.mode === 'standard' ? (
        <div className={`problem-container ${feedback || ''}`}>
          <form onSubmit={handleSubmit}>
            <div className="problem">
              <div className="problem-line">
                <span className="number">{problem.num1}</span>
              </div>
              <div className="problem-line">
                <span className="operator">{getOperationSymbol(problem.operation)}</span>
                <span className="number">{problem.num2}</span>
              </div>
              <div className="problem-line separator"></div>
              <div className="problem-line">
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="answer-input"
                  autoFocus
                />
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="tiles-mode">
          <div className="tiles-question">
            <span className="tiles-problem">
              {problem.num1} {getOperationSymbol(problem.operation)} {problem.num2} = ?
            </span>
          </div>
          <div className={`tiles-container ${feedback || ''}`}>
            {tileOptions.map((option) => (
              <button
                key={option}
                className={`tile ${
                  selectedTile === option
                    ? option === problem.answer
                      ? 'correct'
                      : 'wrong'
                    : ''
                }`}
                onClick={() => handleTileClick(option)}
                disabled={selectedTile !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MathMode;

import { useState, useEffect, useRef } from 'react';
import './MathMode.css';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

interface DifficultyConfig {
  minDigits: number;
  maxDigits: number;
  operations: Operation[];
}

const SCORE_KEY = 'app:simple-type:score';

function MathMode() {
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem(SCORE_KEY);
    return savedScore ? parseInt(savedScore, 10) : 0;
  });
  const [problem, setProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<boolean[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Difficulty progression based on score and adaptive learning
  const getDifficultyConfig = (): DifficultyConfig => {
    const recentPerformance = performanceHistory.slice(-10);
    const recentSuccessRate = recentPerformance.length > 0
      ? recentPerformance.filter(Boolean).length / recentPerformance.length
      : 0.5;

    // Base difficulty on score
    let config: DifficultyConfig;

    if (score < 10) {
      // Level 1: Single digit addition
      config = {
        minDigits: 1,
        maxDigits: 1,
        operations: ['addition']
      };
    } else if (score < 20) {
      // Level 2: Single digit addition and subtraction
      config = {
        minDigits: 1,
        maxDigits: 1,
        operations: ['addition', 'subtraction']
      };
    } else if (score < 35) {
      // Level 3: Double digit addition and subtraction
      config = {
        minDigits: 1,
        maxDigits: 2,
        operations: ['addition', 'subtraction']
      };
    } else if (score < 50) {
      // Level 4: Add simple multiplication
      config = {
        minDigits: 1,
        maxDigits: 2,
        operations: ['addition', 'subtraction', 'multiplication']
      };
    } else if (score < 75) {
      // Level 5: Triple digits, all operations
      config = {
        minDigits: 1,
        maxDigits: 3,
        operations: ['addition', 'subtraction', 'multiplication', 'division']
      };
    } else {
      // Level 6: Advanced
      config = {
        minDigits: 2,
        maxDigits: 3,
        operations: ['addition', 'subtraction', 'multiplication', 'division']
      };
    }

    // Adaptive adjustment: if struggling (< 60% success), make easier
    if (recentSuccessRate < 0.6 && recentPerformance.length >= 5) {
      config.maxDigits = Math.max(1, config.maxDigits - 1);
    }
    // If doing very well (> 90% success), make slightly harder
    else if (recentSuccessRate > 0.9 && recentPerformance.length >= 5) {
      config.maxDigits = Math.min(3, config.maxDigits + 1);
    }

    return config;
  };

  const generateNumber = (minDigits: number, maxDigits: number): number => {
    const digits = Math.floor(Math.random() * (maxDigits - minDigits + 1)) + minDigits;
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateProblem = (): Problem => {
    const config = getDifficultyConfig();
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)];

    let num1 = generateNumber(config.minDigits, config.maxDigits);
    let num2 = generateNumber(config.minDigits, config.maxDigits);
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
        answer = generateNumber(1, config.maxDigits);
        num1 = num2 * answer;
        break;
    }

    return { num1, num2, operation, answer };
  };

  useEffect(() => {
    setProblem(generateProblem());
  }, []);

  useEffect(() => {
    // Auto-focus input when problem changes
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [problem]);

  useEffect(() => {
    // Save score to localStorage whenever it changes
    localStorage.setItem(SCORE_KEY, score.toString());
  }, [score]);

  const getOperationSymbol = (operation: Operation): string => {
    switch (operation) {
      case 'addition': return '+';
      case 'subtraction': return '-';
      case 'multiplication': return '×';
      case 'division': return '÷';
    }
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
      setProblem(generateProblem());
    }, 800);
  };

  const handleReset = () => {
    setScore(0);
    setPerformanceHistory([]);
    localStorage.setItem(SCORE_KEY, '0');
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="math-mode">
      <button className="reset-button" onClick={handleReset}>
        Reset
      </button>

      <div className="score-display">Score: {score}</div>

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
    </div>
  );
}

export default MathMode;

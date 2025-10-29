import { useState, useEffect, useRef } from 'react';
import './MathMode.css';
import {
  type Problem,
  getDifficultyConfig,
  generateProblem,
  generateTileOptions,
  getOperationSymbol,
} from './mathUtils';

type MathMode = 'standard' | 'tiles';

interface Config {
  mode: MathMode;
}

const SCORE_KEY = 'app:simple-type:score';
const CONFIG_KEY = 'app:simple-type:math-config';

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

  const generateNewProblem = (): Problem => {
    const config = getDifficultyConfig(score, performanceHistory);
    return generateProblem(config);
  };

  useEffect(() => {
    if (isStarted) {
      const newProblem = generateNewProblem();
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

      // Generate new problem after delay (only on correct answer)
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        const newProblem = generateNewProblem();
        setProblem(newProblem);
      }, 800);
    } else {
      // Allow retry after brief delay
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 500);
    }
  };

  const handleTileClick = (selectedAnswer: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!problem || selectedTile !== null) return;

    // Immediately blur the clicked button to prevent focus/highlight persistence
    event.currentTarget.blur();

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
        const newProblem = generateNewProblem();
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
      <div className="math-mode-header">
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="math-mode-content">
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
                  key={`${problem.num1}-${problem.num2}-${problem.operation}-${option}`}
                  className={`tile ${
                    selectedTile === option
                      ? option === problem.answer
                        ? 'correct'
                        : 'wrong'
                      : ''
                  }`}
                  onClick={(e) => handleTileClick(option, e)}
                  disabled={selectedTile !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MathMode;

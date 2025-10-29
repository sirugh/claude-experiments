import { useState, useEffect, useMemo, useRef } from 'react';
import './ReadingMode.css';
import { READING_PARAGRAPHS, shuffleArray } from './readingParagraphs';
import {
  type Config,
  processCharacterInput,
} from './readingUtils';

interface Score {
  correct: number;
  incorrect: number;
  paragraphId: number;
}

interface HistoryEntry {
  date: string;
  score: Score;
  timestamp: number;
}

const HISTORY_KEY = 'app:simple-type:history';
const CONFIG_KEY = 'app:simple-type:reading-config';

function ReadingMode() {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        // Ensure punctuation field exists (for backward compatibility)
        return {
          capitalLetters: parsed.capitalLetters ?? false,
          spaces: parsed.spaces ?? false,
          punctuation: parsed.punctuation ?? false
        };
      } catch {
        return {
          capitalLetters: false,
          spaces: false,
          punctuation: false
        };
      }
    }
    return {
      capitalLetters: false,
      spaces: false,
      punctuation: false
    };
  });

  // Ref for hidden input to trigger mobile keyboard
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Use shuffled pre-written paragraphs
  const paragraphs = useMemo(() => {
    return shuffleArray(READING_PARAGRAPHS);
  }, []);

  // Persist config changes to localStorage
  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

  // Auto-focus hidden input when game starts (for mobile keyboard)
  useEffect(() => {
    if (isStarted && !showScore && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [isStarted, showScore]);

  // Get current paragraph (always display with original capitalization)
  const currentParagraph = useMemo(() => {
    return paragraphs[currentParagraphIndex];
  }, [paragraphs, currentParagraphIndex]);

  // Save score to history
  const saveToHistory = (score: Score) => {
    const historyString = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = historyString ? JSON.parse(historyString) : [];

    const entry: HistoryEntry = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      score: score,
      timestamp: Date.now()
    };

    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  };

  // Handle keypress for typing
  useEffect(() => {
    if (!isStarted || showScore || currentCharIndex >= currentParagraph.length) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default behavior for space and other keys
      if (e.key === ' ' || e.key.length === 1) {
        e.preventDefault();
      }

      const typedChar = e.key;
      const result = processCharacterInput(typedChar, currentCharIndex, currentParagraph, config);

      if (result.isCorrect) {
        setCorrect(prev => prev + 1);
        setCurrentCharIndex(result.nextCharIndex);
      } else {
        setIncorrect(prev => prev + 1);

        // Trigger error animation
        setErrorShake(true);
        setTimeout(() => setErrorShake(false), 400);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentCharIndex, currentParagraph, isStarted, showScore, config.spaces, config.capitalLetters, config.punctuation]);

  // Check if paragraph is complete
  useEffect(() => {
    if (currentCharIndex >= currentParagraph.length && isStarted) {
      const finalScore: Score = {
        correct,
        incorrect,
        paragraphId: currentParagraphIndex
      };
      saveToHistory(finalScore);
      setShowScore(true);
    }
  }, [currentCharIndex, currentParagraph.length, isStarted, correct, incorrect, currentParagraphIndex]);

  // Handle input from hidden input field (for mobile)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || showScore || currentCharIndex >= currentParagraph.length) return;

    const value = e.target.value;
    if (value.length === 0) return;

    // Get the last character typed
    const typedChar = value[value.length - 1];
    const result = processCharacterInput(typedChar, currentCharIndex, currentParagraph, config);

    if (result.isCorrect) {
      setCorrect(prev => prev + 1);
      setCurrentCharIndex(result.nextCharIndex);
    } else {
      setIncorrect(prev => prev + 1);

      // Trigger error animation
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 400);
    }

    // Clear input to allow continuous typing
    e.target.value = '';
  };

  // Handle click on typing area to refocus input (for mobile)
  const handleTypingAreaClick = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleContinue = () => {
    // Move to next paragraph and start immediately
    const nextIndex = (currentParagraphIndex + 1) % paragraphs.length;
    setCurrentParagraphIndex(nextIndex);
    setCurrentCharIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setShowScore(false);
    // Keep isStarted = true so it goes directly to typing
  };

  const handleExit = () => {
    // Reset to home/initial state
    setCurrentParagraphIndex(0);
    setCurrentCharIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setShowScore(false);
    setIsStarted(false);
  };

  // Render score screen
  if (showScore) {
    return (
      <div className="reading-mode">
        <div className="score-screen">
          <h1>Great Job!</h1>
          <div className="score-results">
            <div className="score-item">
              <span className="score-icon">👍</span>
              <span className="score-value">{correct}</span>
            </div>
            <div className="score-item">
              <span className="score-icon">👎</span>
              <span className="score-value">{incorrect}</span>
            </div>
          </div>
          <div className="score-buttons">
            <button className="continue-button" onClick={handleContinue}>
              Continue
            </button>
            <button className="exit-button" onClick={handleExit}>
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render start screen
  if (!isStarted) {
    return (
      <div className="reading-mode">
        <div className="start-screen">
          <h1>Reading Practice</h1>
          <p className="instructions">
            Type the letters as they are highlighted.
            <br />
            Try to type each letter correctly!
          </p>

          <div className="config-options">
            <label className="config-option">
              <input
                type="checkbox"
                checked={config.capitalLetters}
                onChange={(e) => setConfig({ ...config, capitalLetters: e.target.checked })}
              />
              <span>Capital Letters</span>
            </label>

            <label className="config-option">
              <input
                type="checkbox"
                checked={config.spaces}
                onChange={(e) => setConfig({ ...config, spaces: e.target.checked })}
              />
              <span>Spaces</span>
            </label>

            <label className="config-option">
              <input
                type="checkbox"
                checked={config.punctuation}
                onChange={(e) => setConfig({ ...config, punctuation: e.target.checked })}
              />
              <span>Punctuation</span>
            </label>
          </div>

          <button className="start-button" onClick={handleStart}>
            Start
          </button>
        </div>
      </div>
    );
  }

  // Render typing game - group characters by words for proper wrapping
  const renderParagraph = () => {
    const words = currentParagraph.split(' ');
    let charIndex = 0;

    return words.map((word, wordIdx) => {
      const wordChars = word.split('').map((char) => {
        const globalIndex = charIndex++;
        const isCurrent = globalIndex === currentCharIndex;
        return (
          <span
            key={globalIndex}
            className={`char ${
              isCurrent ? 'current' :
              globalIndex < currentCharIndex ? 'completed' : ''
            } ${isCurrent && errorShake ? 'error' : ''}`}
          >
            {char}
          </span>
        );
      });

      // Add space after word (except last word)
      if (wordIdx < words.length - 1) {
        const spaceIndex = charIndex++;
        const isCurrent = spaceIndex === currentCharIndex;

        return (
          <span key={`word-${wordIdx}`} className="word-group">
            {wordChars}
            <span
              className={`char space ${
                isCurrent ? 'current' :
                spaceIndex < currentCharIndex ? 'completed' : ''
              } ${isCurrent && errorShake ? 'error' : ''}`}
            >
              {'\u00A0'}
            </span>
          </span>
        );
      }

      return (
        <span key={`word-${wordIdx}`} className="word-group">
          {wordChars}
        </span>
      );
    });
  };

  return (
    <div className="reading-mode">
      {/* Hidden input for mobile keyboard support */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onChange={handleInputChange}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          left: '-9999px'
        }}
        aria-hidden="true"
      />

      <div className="typing-container" onClick={handleTypingAreaClick}>
        <div className="paragraph">
          {renderParagraph()}
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentCharIndex / currentParagraph.length) * 100}%` }}
        />
      </div>

      <div className="live-score">
        <span className="live-score-item">
          <span className="score-icon-small">👍</span> {correct}
        </span>
        <span className="live-score-item">
          <span className="score-icon-small">👎</span> {incorrect}
        </span>
      </div>
    </div>
  );
}

export default ReadingMode;

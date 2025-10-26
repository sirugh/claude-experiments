import { useState, useEffect, useMemo } from 'react';
import './ReadingMode.css';

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

interface Config {
  capitalLetters: boolean;
  spaces: boolean;
}

const HISTORY_KEY = 'app:simple-type:history';
const CONFIG_KEY = 'app:simple-type:reading-config';

// Base templates for generating sentences
const SENTENCE_TEMPLATES = [
  "The {animal} {verb} on the {place}.",
  "I see a {color} {thing}.",
  "{name} has a {size} {object}.",
  "The {color} {animal} can {verb}.",
  "We go to the {place}.",
  "I like the {size} {thing}.",
  "{name} and I {verb} a {object}.",
  "The {thing} is {color}.",
  "My {animal} can {verb} fast.",
  "The {size} {object} is in the {place}."
];

const WORDS = {
  animal: ['cat', 'dog', 'bird', 'fish', 'frog', 'ant', 'bear', 'bug', 'pig', 'cow'],
  verb: ['sat', 'ran', 'jump', 'play', 'walk', 'hop', 'fly', 'run', 'eat', 'see'],
  place: ['mat', 'park', 'zoo', 'box', 'pond', 'yard', 'hill', 'nest', 'home', 'barn'],
  color: ['red', 'blue', 'tan', 'green', 'brown', 'black', 'white', 'pink', 'gray', 'gold'],
  thing: ['bus', 'car', 'toy', 'hat', 'ball', 'book', 'cup', 'pen', 'sock', 'coat'],
  size: ['big', 'small', 'tall', 'short', 'long', 'tiny', 'fat', 'thin', 'wide', 'new'],
  object: ['bag', 'box', 'cake', 'pie', 'coat', 'boot', 'game', 'kite', 'boat', 'bike'],
  name: ['Tom', 'Sam', 'Ann', 'Ben', 'Mom', 'Dad', 'Sue', 'Jim', 'Kim', 'Max']
};

// Generate a random sentence from templates
const generateSentence = (): string => {
  const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)];
  let sentence = template;

  // Replace all placeholders
  Object.keys(WORDS).forEach(key => {
    const wordList = WORDS[key as keyof typeof WORDS];
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    sentence = sentence.replace(`{${key}}`, randomWord);
  });

  return sentence;
};

// Generate a paragraph with 3-5 sentences
const generateParagraph = (): string => {
  const numSentences = Math.floor(Math.random() * 3) + 3; // 3-5 sentences
  const sentences: string[] = [];

  for (let i = 0; i < numSentences; i++) {
    sentences.push(generateSentence());
  }

  return sentences.join(' ');
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function ReadingMode() {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [config, setConfig] = useState<Config>(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch {
        return {
          capitalLetters: false,
          spaces: false
        };
      }
    }
    return {
      capitalLetters: false,
      spaces: false
    };
  });

  // Generate randomized paragraphs on component mount
  const paragraphs = useMemo(() => {
    const generated: string[] = [];
    for (let i = 0; i < 10; i++) {
      generated.push(generateParagraph());
    }
    return shuffleArray(generated);
  }, []);

  // Persist config changes to localStorage
  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }, [config]);

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

      const expectedChar = currentParagraph[currentCharIndex];

      // If spaces are disabled, skip space characters automatically
      if (!config.spaces && expectedChar === ' ') {
        setCurrentCharIndex(prev => prev + 1);
        return;
      }

      const typedChar = e.key;

      // Check if the typed character matches
      // Case-sensitive if capitalLetters enabled, case-insensitive if disabled
      const isMatch = config.capitalLetters
        ? expectedChar === typedChar
        : expectedChar.toLowerCase() === typedChar.toLowerCase();

      if (isMatch) {
        setCorrect(prev => prev + 1);
        setCurrentCharIndex(prev => prev + 1);

        // Auto-skip next space if spaces are disabled
        if (!config.spaces && currentCharIndex + 1 < currentParagraph.length && currentParagraph[currentCharIndex + 1] === ' ') {
          setTimeout(() => setCurrentCharIndex(prev => prev + 1), 0);
        }
      } else {
        setIncorrect(prev => prev + 1);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentCharIndex, currentParagraph, isStarted, showScore, config.spaces, config.capitalLetters]);

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
        return (
          <span
            key={globalIndex}
            className={`char ${
              globalIndex === currentCharIndex ? 'current' :
              globalIndex < currentCharIndex ? 'completed' : ''
            }`}
          >
            {char}
          </span>
        );
      });

      // Add space after word (except last word)
      if (wordIdx < words.length - 1) {
        const spaceIndex = charIndex++;

        return (
          <span key={`word-${wordIdx}`} className="word-group">
            {wordChars}
            <span
              className={`char space ${
                spaceIndex === currentCharIndex ? 'current' :
                spaceIndex < currentCharIndex ? 'completed' : ''
              }`}
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
      <div className="typing-container">
        <div className="paragraph">
          {renderParagraph()}
        </div>
      </div>

      <div className="live-score">
        <span className="live-score-item">
          <span className="score-icon-small">👍</span> {correct}
        </span>
        <span className="live-score-item">
          <span className="score-icon-small">👎</span> {incorrect}
        </span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentCharIndex / currentParagraph.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default ReadingMode;

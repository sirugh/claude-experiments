import { useState, useEffect } from 'react';
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

const HISTORY_KEY = 'app:simple-type:history';

// First-grader appropriate paragraphs with simple words
const PARAGRAPHS = [
  "The cat sat on the mat. It was a big cat. The cat was tan.",
  "I see a red bus. The bus is big. It can go fast. I like the bus.",
  "The dog ran to the park. He saw a ball. The dog got the ball and ran back.",
  "The sun is up. The sky is blue. I see a bird. The bird can fly high.",
  "Mom has a big bag. In the bag is a toy. I can play with the toy.",
  "We go to the zoo. We see a big bear. The bear is brown. The bear eats fish.",
  "The boy has a pet frog. The frog can hop. The frog is green and wet.",
  "Dad and I bake a cake. The cake is for Mom. We put it in a box.",
  "The ant is small. The ant can walk up the wall. The ant is strong.",
  "I have a new hat. The hat is red. I wear the hat when I go out."
];

function ReadingMode() {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const currentParagraph = PARAGRAPHS[currentParagraphIndex];

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
      const typedChar = e.key;

      // Check if the typed character matches (case-insensitive for letters)
      const isMatch = expectedChar.toLowerCase() === typedChar.toLowerCase();

      if (isMatch) {
        setCorrect(prev => prev + 1);
        setCurrentCharIndex(prev => prev + 1);
      } else {
        setIncorrect(prev => prev + 1);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentCharIndex, currentParagraph, isStarted, showScore]);

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
    // Move to next paragraph
    const nextIndex = (currentParagraphIndex + 1) % PARAGRAPHS.length;
    setCurrentParagraphIndex(nextIndex);
    setCurrentCharIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setShowScore(false);
    setIsStarted(false);
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
          <button className="start-button" onClick={handleStart}>
            Start
          </button>
        </div>
      </div>
    );
  }

  // Render typing game
  return (
    <div className="reading-mode">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(currentCharIndex / currentParagraph.length) * 100}%` }}
        />
      </div>

      <div className="typing-container">
        <div className="paragraph">
          {currentParagraph.split('').map((char, index) => (
            <span
              key={index}
              className={`char ${
                index === currentCharIndex ? 'current' :
                index < currentCharIndex ? 'completed' : ''
              }`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
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
    </div>
  );
}

export default ReadingMode;

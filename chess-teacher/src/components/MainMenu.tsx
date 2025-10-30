import { lessons } from '../utils/lessonData'
import { PIECE_UNICODE, PIECE_NAMES } from '../types/chess'
import './MainMenu.css'

interface MainMenuProps {
  completedLevels: number[]
  onSelectLevel: (level: number) => void
  onPlayComputer: () => void
}

export default function MainMenu({
  completedLevels,
  onSelectLevel,
  onPlayComputer,
}: MainMenuProps) {
  const isLevelUnlocked = (level: number) => {
    return level === 1 || completedLevels.includes(level - 1)
  }

  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1>Chess Teacher</h1>
        <p className="subtitle">Learn chess step by step</p>
      </div>

      <div className="menu-sections">
        <section className="tutorial-section">
          <h2>Tutorial Lessons</h2>
          <p className="section-description">
            Learn how each piece moves with interactive exercises
          </p>

          <div className="lesson-grid">
            {lessons.map((lesson) => {
              const unlocked = isLevelUnlocked(lesson.id)
              const completed = completedLevels.includes(lesson.id)
              const pieceKey = `w${lesson.piece}`

              return (
                <button
                  key={lesson.id}
                  className={`lesson-card ${!unlocked ? 'locked' : ''} ${
                    completed ? 'completed' : ''
                  }`}
                  onClick={() => unlocked && onSelectLevel(lesson.id)}
                  disabled={!unlocked}
                >
                  <div className="lesson-number">Lesson {lesson.id}</div>
                  <div className="lesson-piece">
                    {PIECE_UNICODE[pieceKey]}
                  </div>
                  <div className="lesson-title">{PIECE_NAMES[lesson.piece]}</div>
                  {completed && <div className="completed-badge">✓</div>}
                  {!unlocked && <div className="lock-icon">🔒</div>}
                </button>
              )
            })}
          </div>
        </section>

        <section className="play-section">
          <h2>Play Against Computer</h2>
          <p className="section-description">
            Test your skills against a chess AI
          </p>

          <button
            className="play-computer-button"
            onClick={onPlayComputer}
            disabled={completedLevels.length === 0}
          >
            <span className="button-icon">♔</span>
            <span>Play vs Computer</span>
            {completedLevels.length === 0 && (
              <span className="unlock-hint">
                Complete Lesson 1 to unlock
              </span>
            )}
          </button>
        </section>
      </div>

      <div className="progress-section">
        <h3>Your Progress</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(completedLevels.length / lessons.length) * 100}%` }}
          ></div>
        </div>
        <p>
          {completedLevels.length} of {lessons.length} lessons completed
        </p>
      </div>
    </div>
  )
}

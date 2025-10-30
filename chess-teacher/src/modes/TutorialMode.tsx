import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from '../components/ChessBoard'
import { lessons } from '../utils/lessonData'
import type { Exercise } from '../types/chess'
import './TutorialMode.css'

interface TutorialModeProps {
  currentLevel: number
  onLevelComplete: () => void
  onBack: () => void
}

export default function TutorialMode({
  currentLevel,
  onLevelComplete,
  onBack,
}: TutorialModeProps) {
  const lesson = lessons[currentLevel - 1]
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [exerciseComplete, setExerciseComplete] = useState(false)

  const currentExercise = lesson.exercises[currentExerciseIndex]

  useEffect(() => {
    loadExercise(currentExercise)
  }, [currentExerciseIndex])

  const loadExercise = (exercise: Exercise) => {
    const newGame = new Chess(exercise.fen)
    setGame(newGame)
    setSelectedSquare(null)
    setHighlightedSquares([])
    setMessage('')
    setExerciseComplete(false)
  }

  const handleSquareClick = (square: string) => {
    if (exerciseComplete) return

    if (selectedSquare === null) {
      // Select a piece
      const piece = game.get(square as any)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        const moves = game.moves({ square: square as any, verbose: true })
        const targets = moves.map((m) => m.to)
        setHighlightedSquares(targets)
      }
    } else {
      // Try to make a move
      try {
        const move = game.move({
          from: selectedSquare as any,
          to: square as any,
          promotion: 'q',
        })

        if (move) {
          const moveNotation = move.from + move.to
          const isCorrect = currentExercise.targetMoves?.includes(moveNotation)

          if (isCorrect) {
            setMessage('✓ Correct! Well done!')
            setExerciseComplete(true)
            setGame(new Chess(game.fen()))
          } else {
            setMessage('Not quite. Try again!')
            // Undo the move
            game.undo()
          }
        }
        setSelectedSquare(null)
        setHighlightedSquares([])
      } catch (e) {
        // Invalid move
        setSelectedSquare(null)
        setHighlightedSquares([])
      }
    }
  }

  const handleNext = () => {
    if (currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      onLevelComplete()
    }
  }

  const handleHint = () => {
    if (currentExercise.targetMoves && currentExercise.targetMoves.length > 0) {
      const targetMove = currentExercise.targetMoves[0]
      const fromSquare = targetMove.slice(0, 2)
      const toSquare = targetMove.slice(2, 4)
      setMessage(`Hint: Try moving from ${fromSquare} to ${toSquare}`)
      setSelectedSquare(fromSquare)
      setHighlightedSquares([toSquare])
    }
  }

  return (
    <div className="tutorial-mode">
      <div className="tutorial-header">
        <button onClick={onBack} className="back-button">
          ← Back to Menu
        </button>
        <h1>{lesson.title}</h1>
        <p className="lesson-description">{lesson.description}</p>
      </div>

      <div className="tutorial-content">
        <div className="board-section">
          <ChessBoard
            game={game}
            onSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
            highlightedSquares={highlightedSquares}
          />
        </div>

        <div className="exercise-panel">
          <h2>
            Exercise {currentExerciseIndex + 1} of {lesson.exercises.length}
          </h2>
          <p className="instruction">{currentExercise.instruction}</p>

          {message && (
            <div className={`message ${exerciseComplete ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="exercise-controls">
            {!exerciseComplete && (
              <button onClick={handleHint} className="hint-button">
                💡 Hint
              </button>
            )}
            {exerciseComplete && (
              <button onClick={handleNext} className="next-button">
                {currentExerciseIndex < lesson.exercises.length - 1
                  ? 'Next Exercise →'
                  : 'Complete Lesson ✓'}
              </button>
            )}
          </div>

          <div className="objectives">
            <h3>Learning Objectives:</h3>
            <ul>
              {lesson.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

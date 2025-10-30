import { useState, useEffect } from 'react'
import { Chess } from 'chess.js'
import ChessBoard from '../components/ChessBoard'
import './PlayMode.css'

interface PlayModeProps {
  onBack: () => void
}

export default function PlayMode({ onBack }: PlayModeProps) {
  const [game, setGame] = useState(new Chess())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [highlightedSquares, setHighlightedSquares] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [difficulty, setDifficulty] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState('')

  useEffect(() => {
    if (gameStarted && game.turn() !== playerColor && !gameOver) {
      makeComputerMove()
    }
  }, [game.turn(), gameStarted])

  const makeComputerMove = () => {
    setThinking(true)

    // Simple random move for now (we'll add Stockfish later)
    setTimeout(() => {
      const moves = game.moves({ verbose: true })
      if (moves.length === 0) {
        checkGameEnd()
        setThinking(false)
        return
      }

      const randomMove = moves[Math.floor(Math.random() * moves.length)]
      const newGame = new Chess(game.fen())
      newGame.move(randomMove)
      setGame(newGame)
      setLastMove({ from: randomMove.from, to: randomMove.to })
      setThinking(false)
      checkGameEnd()
    }, 500)
  }

  const checkGameEnd = () => {
    if (game.isCheckmate()) {
      setGameOver(true)
      setResult(game.turn() === playerColor ? 'You lost! Better luck next time.' : 'Checkmate! You won!')
    } else if (game.isDraw()) {
      setGameOver(true)
      setResult('Draw!')
    } else if (game.isStalemate()) {
      setGameOver(true)
      setResult('Stalemate!')
    }
  }

  const handleSquareClick = (square: string) => {
    if (gameOver || thinking || game.turn() !== playerColor) return

    if (selectedSquare === null) {
      const piece = game.get(square as any)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        const moves = game.moves({ square: square as any, verbose: true })
        const targets = moves.map((m) => m.to)
        setHighlightedSquares(targets)
      }
    } else {
      try {
        const move = game.move({
          from: selectedSquare as any,
          to: square as any,
          promotion: 'q',
        })

        if (move) {
          const newGame = new Chess(game.fen())
          setGame(newGame)
          setLastMove({ from: move.from, to: move.to })
          checkGameEnd()
        }
      } catch (e) {
        // Invalid move
      }
      setSelectedSquare(null)
      setHighlightedSquares([])
    }
  }

  const startGame = () => {
    const newGame = new Chess()
    setGame(newGame)
    setGameStarted(true)
    setGameOver(false)
    setResult('')
    setLastMove(null)
    setSelectedSquare(null)
    setHighlightedSquares([])
  }

  const resetGame = () => {
    setGameStarted(false)
    setGame(new Chess())
    setLastMove(null)
    setSelectedSquare(null)
    setHighlightedSquares([])
    setGameOver(false)
    setResult('')
  }

  if (!gameStarted) {
    return (
      <div className="play-mode">
        <div className="setup-screen">
          <h1>Play Against Computer</h1>

          <div className="setup-options">
            <div className="option-group">
              <h3>Choose Your Color</h3>
              <div className="color-selector">
                <button
                  className={`color-button ${playerColor === 'w' ? 'selected' : ''}`}
                  onClick={() => setPlayerColor('w')}
                >
                  ♔ White
                </button>
                <button
                  className={`color-button ${playerColor === 'b' ? 'selected' : ''}`}
                  onClick={() => setPlayerColor('b')}
                >
                  ♚ Black
                </button>
              </div>
            </div>

            <div className="option-group">
              <h3>Difficulty Level</h3>
              <div className="difficulty-selector">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                />
                <div className="difficulty-labels">
                  <span>Easy</span>
                  <span className="current-difficulty">Level {difficulty}</span>
                  <span>Hard</span>
                </div>
              </div>
              <p className="difficulty-note">
                Note: Currently uses random moves. Stockfish AI coming soon!
              </p>
            </div>
          </div>

          <div className="setup-buttons">
            <button onClick={onBack} className="back-button">
              ← Back to Menu
            </button>
            <button onClick={startGame} className="start-button">
              Start Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="play-mode">
      <div className="game-header">
        <button onClick={resetGame} className="back-button">
          ← New Game
        </button>
        <div className="game-status">
          {thinking && <span className="thinking">Computer is thinking...</span>}
          {!thinking && !gameOver && (
            <span>{game.turn() === playerColor ? 'Your turn' : "Computer's turn"}</span>
          )}
          {gameOver && <span className="game-over">{result}</span>}
        </div>
      </div>

      <div className="game-content">
        <ChessBoard
          game={game}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          highlightedSquares={highlightedSquares}
          lastMove={lastMove}
          flip={playerColor === 'b'}
        />

        <div className="game-info">
          <div className="status-panel">
            <h3>Game Status</h3>
            {game.isCheck() && <div className="check-warning">⚠️ Check!</div>}
            <div className="turn-indicator">
              Turn: {game.turn() === 'w' ? 'White ♔' : 'Black ♚'}
            </div>
          </div>

          <div className="move-history">
            <h3>Moves</h3>
            <div className="moves-list">
              {game.history().length === 0 ? (
                <p className="no-moves">No moves yet</p>
              ) : (
                game.history().map((move, i) => (
                  <div key={i} className="move-item">
                    {Math.floor(i / 2) + 1}. {move}
                  </div>
                ))
              )}
            </div>
          </div>

          {gameOver && (
            <button onClick={resetGame} className="play-again-button">
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

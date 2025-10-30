import { Chess } from 'chess.js'
import { PIECE_UNICODE } from '../types/chess'
import { coordsToSquare, isLightSquare } from '../utils/boardUtils'
import './ChessBoard.css'

interface ChessBoardProps {
  game: Chess
  onSquareClick?: (square: string) => void
  selectedSquare?: string | null
  highlightedSquares?: string[]
  lastMove?: { from: string; to: string } | null
  flip?: boolean
}

export default function ChessBoard({
  game,
  onSquareClick,
  selectedSquare,
  highlightedSquares = [],
  lastMove,
  flip = false,
}: ChessBoardProps) {
  const board = game.board()

  const renderSquare = (row: number, col: number) => {
    const square = coordsToSquare(row, col)
    const piece = board[row][col]
    const isLight = isLightSquare(row, col)
    const isSelected = selectedSquare === square
    const isHighlighted = highlightedSquares.includes(square)
    const isLastMoveFrom = lastMove?.from === square
    const isLastMoveTo = lastMove?.to === square

    const classNames = [
      'square',
      isLight ? 'light' : 'dark',
      isSelected ? 'selected' : '',
      isHighlighted ? 'highlighted' : '',
      isLastMoveFrom || isLastMoveTo ? 'last-move' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const pieceSymbol = piece
      ? PIECE_UNICODE[piece.color + piece.type]
      : ''

    return (
      <div
        key={square}
        className={classNames}
        onClick={() => onSquareClick?.(square)}
        data-square={square}
      >
        {piece && <div className="piece">{pieceSymbol}</div>}
        {col === 0 && (
          <div className="rank-label">{8 - row}</div>
        )}
        {row === 7 && (
          <div className="file-label">
            {String.fromCharCode('a'.charCodeAt(0) + col)}
          </div>
        )}
      </div>
    )
  }

  const renderBoard = () => {
    const squares = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = flip ? 7 - row : row
        const displayCol = flip ? 7 - col : col
        squares.push(renderSquare(displayRow, displayCol))
      }
    }
    return squares
  }

  return (
    <div className="chess-board-container">
      <div className="chess-board">{renderBoard()}</div>
    </div>
  )
}

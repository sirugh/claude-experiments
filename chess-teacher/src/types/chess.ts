export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
export type PieceColor = 'w' | 'b'

export interface Square {
  row: number
  col: number
  square: string // e.g., 'e4'
}

export interface Piece {
  type: PieceType
  color: PieceColor
}

export interface Move {
  from: string
  to: string
  promotion?: PieceType
}

export type GameMode = 'tutorial' | 'play' | 'menu'

export interface TutorialProgress {
  completedLevels: number[]
  currentLevel: number
  scores: Record<number, number>
}

export interface LessonContent {
  id: number
  title: string
  piece: PieceType
  description: string
  objectives: string[]
  exercises: Exercise[]
}

export interface Exercise {
  id: string
  fen: string
  instruction: string
  targetSquare?: string
  targetMoves?: string[]
  completed: boolean
}

export const PIECE_UNICODE: Record<string, string> = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
}

export const PIECE_NAMES: Record<PieceType, string> = {
  p: 'Pawn',
  n: 'Knight',
  b: 'Bishop',
  r: 'Rook',
  q: 'Queen',
  k: 'King',
}

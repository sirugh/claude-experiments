export function squareToCoords(square: string): { row: number; col: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0)
  const rank = parseInt(square[1]) - 1
  return { row: 7 - rank, col: file }
}

export function coordsToSquare(row: number, col: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + col)
  const rank = (8 - row).toString()
  return file + rank
}

export function isLightSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 0
}

export function getSquareColor(square: string): 'light' | 'dark' {
  const { row, col } = squareToCoords(square)
  return isLightSquare(row, col) ? 'light' : 'dark'
}

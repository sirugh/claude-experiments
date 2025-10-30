# Chess Teacher

An interactive chess tutorial system that teaches beginners how to play chess through step-by-step lessons and practice games.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://sirugh.github.io/claude-experiments/chess-teacher/)

## Features

### Tutorial Lessons (6 Levels)

Learn how each chess piece moves with interactive exercises:

1. **The Pawn** - Forward movement, first move double-step, diagonal captures
2. **The Knight** - L-shaped movement, jumping over pieces
3. **The Bishop** - Diagonal movement, color-bound pieces
4. **The Rook** - Horizontal and vertical movement
5. **The Queen** - Combined rook and bishop movement (most powerful piece)
6. **The King** - One square movement, castling, and check rules

### Play Against Computer

- Choose your color (White or Black)
- Adjustable difficulty levels (1-5)
- Full chess rules with move validation
- Move history tracking
- Check and checkmate detection

### Progress Tracking

- Completed lessons are saved to local storage
- Unlock new lessons by completing previous ones
- Visual progress indicator

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **chess.js** - Chess game logic and move validation
- **CSS3** - Styling and animations

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## How to Play

### Tutorial Mode

1. Start with Lesson 1 (The Pawn)
2. Read the instructions for each exercise
3. Click on pieces to see their possible moves (highlighted squares)
4. Make the correct move to complete the exercise
5. Use the Hint button if you get stuck
6. Complete all exercises to finish the lesson

### Play Mode

1. Complete at least one tutorial lesson to unlock Play Mode
2. Choose your color and difficulty level
3. Click on your pieces to see legal moves
4. Click on a highlighted square to make your move

## Future Enhancements

- Stockfish AI integration for stronger computer opponent
- Advanced lessons (openings, tactics, endgames)
- Puzzle mode with checkmate exercises
- Multiplayer support
- Game analysis and review

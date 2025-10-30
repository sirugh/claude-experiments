# Chess Teacher System - Implementation Plan

## Overview
A client-side chess teaching application that teaches beginners how to play chess through interactive tutorials and AI-powered practice games.

## Technology Stack

### Core Dependencies
- **React 19** + **TypeScript** - UI framework and type safety
- **Vite** - Build tool and dev server
- **chess.js** - Chess game logic, move validation, and game state management
- **Stockfish.js** - Powerful chess AI running entirely in browser via WebAssembly
- **react-chessboard** (optional) - Pre-built React chess board component, OR custom implementation

### Development Tools
- ESLint - Code linting
- Vitest - Unit testing
- Playwright - E2E testing
- Testing Library - Component testing

## Project Structure

```
chess-teacher/
├── public/
│   └── stockfish/          # Stockfish WASM files
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx            # Main app component
│   ├── App.css            # Main styles
│   ├── components/
│   │   ├── ChessBoard.tsx         # Chess board UI component
│   │   ├── PieceSelector.tsx      # Piece selection for tutorials
│   │   ├── MoveHighlighter.tsx    # Visual move highlighting
│   │   ├── LevelSelector.tsx      # Level/mode selection
│   │   └── GameControls.tsx       # Reset, hints, navigation
│   ├── modes/
│   │   ├── TutorialMode.tsx       # Tutorial levels 1-6
│   │   ├── PlayMode.tsx           # Play against computer
│   │   └── FreePlayMode.tsx       # Free play mode (optional)
│   ├── lessons/
│   │   ├── PawnLesson.tsx         # Level 1: Pawn tutorial
│   │   ├── KnightLesson.tsx       # Level 2: Knight tutorial
│   │   ├── BishopLesson.tsx       # Level 3: Bishop tutorial
│   │   ├── RookLesson.tsx         # Level 4: Rook tutorial
│   │   ├── QueenLesson.tsx        # Level 5: Queen tutorial
│   │   └── KingLesson.tsx         # Level 6: King + castling tutorial
│   ├── engine/
│   │   ├── stockfishWorker.ts     # Stockfish Web Worker wrapper
│   │   └── engineInterface.ts     # Engine communication interface
│   ├── utils/
│   │   ├── chessUtils.ts          # Chess helper functions
│   │   ├── boardUtils.ts          # Board rendering utilities
│   │   └── lessonData.ts          # Tutorial content and data
│   └── types/
│       └── chess.d.ts             # TypeScript type definitions
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Feature Breakdown

### Phase 1: Core Infrastructure
**Goal:** Set up project foundation and basic chess board

1. **Project Setup**
   - Create `chess-teacher/` directory
   - Initialize React + TypeScript + Vite project
   - Install dependencies: chess.js, stockfish.js
   - Configure build and dev environment

2. **Chess Board Component**
   - Render 8x8 chess board with proper styling
   - Display pieces using Unicode chess symbols or SVG
   - Handle piece selection and movement
   - Visual feedback for selected pieces
   - Coordinate labels (a-h, 1-8)

3. **Game State Management**
   - Integrate chess.js for game logic
   - Track current position (FEN string)
   - Validate legal moves
   - Track game history

### Phase 2: Tutorial System (Levels 1-6)

**Goal:** Create interactive lessons teaching each piece

#### Level 1: The Pawn
- **Learning Objectives:**
  - Pawns move forward one square (two on first move)
  - Pawns capture diagonally
  - Introduction to board coordinates
- **Exercises:**
  - Highlight all valid pawn moves from various positions
  - Practice moving pawns forward
  - Practice pawn captures
  - Introduction to en passant (advanced)

#### Level 2: The Knight
- **Learning Objectives:**
  - Knights move in "L" shape (2+1 or 1+2)
  - Knights can jump over pieces
  - Knight movement pattern visualization
- **Exercises:**
  - Show all possible knight moves from center/edge/corner
  - Practice knight movement on empty board
  - Practice knight captures
  - Knight fork exercises

#### Level 3: The Bishop
- **Learning Objectives:**
  - Bishops move diagonally any number of squares
  - Bishops cannot jump over pieces
  - Light-square vs dark-square bishops
- **Exercises:**
  - Highlight diagonal movement paths
  - Practice moving bishops across the board
  - Understanding bishop limitations (color-bound)
  - Bishop captures

#### Level 4: The Rook
- **Learning Objectives:**
  - Rooks move horizontally/vertically any number of squares
  - Rooks cannot jump over pieces
  - Rook power and value
- **Exercises:**
  - Highlight rank and file movement
  - Practice rook movement
  - Rook captures
  - Introduction to back-rank concepts

#### Level 5: The Queen
- **Learning Objectives:**
  - Queen combines rook + bishop movement
  - Queen is the most powerful piece
  - Queen movement patterns
- **Exercises:**
  - Show all possible queen moves (8 directions)
  - Practice queen movement and captures
  - Queen power visualization

#### Level 6: The King
- **Learning Objectives:**
  - King moves one square in any direction
  - King cannot move into check
  - Castling rules (kingside and queenside)
  - Check, checkmate, stalemate concepts
- **Exercises:**
  - Practice king movement
  - Understanding check and illegal king moves
  - Castling practice (both sides)
  - Simple checkmate puzzles (1-move mates)

#### Tutorial Features
- **Progress tracking:** Save completed levels to localStorage
- **Interactive highlighting:** Click a piece to see all legal moves
- **Step-by-step guidance:** Text explanations with visual demos
- **Practice exercises:** Specific positions to practice concepts
- **Completion criteria:** Must complete exercises to unlock next level
- **Hint system:** Show hints for stuck students

### Phase 3: Stockfish Integration

**Goal:** Implement AI opponent using Stockfish.js

1. **Stockfish Setup**
   - Load Stockfish as Web Worker (prevent UI blocking)
   - Initialize engine with UCI protocol
   - Handle engine communication (position, go, bestmove)
   - Implement difficulty levels via depth/time limits

2. **Engine Interface**
   ```typescript
   interface StockfishEngine {
     init(): Promise<void>
     setDifficulty(level: 1-10): void
     getBestMove(fen: string): Promise<string>
     stop(): void
     evaluate(fen: string): Promise<number>
   }
   ```

3. **Difficulty Levels**
   - **Level 1 (Beginner):** Depth 1, random moves occasionally
   - **Level 2-3:** Depth 3-5
   - **Level 4-6:** Depth 8-10
   - **Level 7-8:** Depth 12-15
   - **Level 9-10:** Depth 18-20, full strength

### Phase 4: Play Against Computer

**Goal:** Implement full game mode with AI opponent

1. **Game Mode Interface**
   - Choose color (white/black)
   - Select difficulty level (1-10)
   - Full chess board with all pieces
   - Move history display
   - Captured pieces display
   - Timer (optional)

2. **Game Flow**
   - Player makes move → validate → update board
   - If player's turn is over, send position to Stockfish
   - Stockfish returns best move → animate → update board
   - Check for game end conditions (checkmate/stalemate/draw)
   - Display result and offer rematch

3. **Game Features**
   - **Undo/Redo:** Take back moves (training mode)
   - **Hints:** Ask Stockfish for suggested move
   - **Analysis:** Show evaluation bar
   - **Move highlighting:** Show last move made
   - **Legal move preview:** Highlight valid squares on piece selection
   - **Sound effects:** Optional move sounds

### Phase 5: UI/UX Polish

**Goal:** Create engaging, beginner-friendly interface

1. **Visual Design**
   - Clean, colorful chess board (light/dark themes)
   - Large, clear piece symbols (Unicode or SVG)
   - Smooth animations for piece movement
   - Highlight colors for:
     - Selected piece
     - Legal moves
     - Last move
     - Check/checkmate squares
   - Responsive design (mobile-friendly)

2. **Navigation**
   - Main menu with mode selection
   - Level selector with progress indicators
   - Settings panel (board theme, piece style, sounds)
   - Progress tracking UI

3. **Accessibility**
   - Keyboard navigation support
   - Screen reader friendly (ARIA labels)
   - High contrast mode option
   - Scalable font sizes

### Phase 6: Testing & Deployment

1. **Unit Tests**
   - Chess utility functions
   - Move validation logic
   - Stockfish wrapper functions
   - Component rendering

2. **Integration Tests**
   - Full game flow (player vs AI)
   - Tutorial completion flow
   - Level progression
   - LocalStorage persistence

3. **E2E Tests**
   - Complete tutorial from level 1-6
   - Play full game against AI
   - Settings and preferences
   - Browser compatibility

4. **Deployment**
   - Build optimized bundle
   - Deploy to GitHub Pages
   - Update main index.html with chess-teacher link
   - Configure PR preview workflow

## Data Models

### Game State
```typescript
interface GameState {
  fen: string              // Current position
  pgn: string              // Move history
  turn: 'white' | 'black'  // Current turn
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
}
```

### Tutorial Progress
```typescript
interface TutorialProgress {
  completedLevels: number[]
  currentLevel: number
  scores: Record<number, number>
}
```

### Lesson Content
```typescript
interface Lesson {
  id: number
  title: string
  piece: 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king'
  description: string
  objectives: string[]
  exercises: Exercise[]
}

interface Exercise {
  id: string
  fen: string              // Starting position
  instruction: string      // What to do
  targetMoves: string[]    // Correct moves (optional)
  validation: (move: string) => boolean
}
```

## Implementation Timeline

### Week 1: Foundation
- Day 1-2: Project setup, dependencies, basic chess board
- Day 3-4: Chess.js integration, move validation, board interaction
- Day 5-7: First tutorial level (Pawn) - proof of concept

### Week 2: Tutorials
- Day 1: Knight lesson
- Day 2: Bishop lesson
- Day 3: Rook lesson
- Day 4: Queen lesson
- Day 5-7: King lesson (including castling, check, checkmate)

### Week 3: AI Integration
- Day 1-2: Stockfish.js setup and Web Worker
- Day 3-4: Engine interface and difficulty levels
- Day 5-7: Play mode implementation and testing

### Week 4: Polish & Testing
- Day 1-2: UI/UX improvements, animations, themes
- Day 3-4: Testing (unit, integration, E2E)
- Day 5-7: Documentation, deployment, bug fixes

## Technical Considerations

### Performance
- **Stockfish in Web Worker:** Prevents UI blocking during AI calculations
- **Lazy loading:** Load Stockfish only when needed (play mode)
- **Debouncing:** Prevent rapid position updates
- **Memoization:** Cache calculated legal moves

### Storage
- **localStorage:** Save tutorial progress, settings, game history
- **Session storage:** Temporary game state

### Browser Compatibility
- Modern browsers with WebAssembly support (Chrome, Firefox, Safari, Edge)
- Fallback message for unsupported browsers

### Mobile Considerations
- Touch-friendly piece dragging
- Responsive board sizing
- Prevent zoom on double-tap
- Landscape mode optimization

## Success Metrics

1. **Learning Progression:** Users complete all 6 tutorial levels
2. **Engagement:** Average time spent per session
3. **Retention:** Users return to practice against AI
4. **Difficulty Curve:** Users gradually increase AI difficulty level
5. **Performance:** Smooth animations, responsive AI (< 2s response time)

## Future Enhancements (Post-MVP)

1. **Opening Library:** Teach common chess openings
2. **Tactics Trainer:** Checkmate puzzles, fork/pin/skewer exercises
3. **Game Analysis:** Review completed games with Stockfish analysis
4. **Multiplayer:** Play against other humans (WebRTC or server-based)
5. **Endgame Trainer:** King+Queen vs King, King+Rook vs King, etc.
6. **Piece themes:** Different visual styles for pieces
7. **Board themes:** Multiple color schemes
8. **Achievement system:** Badges for milestones
9. **Game database:** Save and review past games
10. **PGN import/export:** Load games from standard chess notation

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "chess.js": "^1.0.0",
    "stockfish.js": "^10.0.2"
  },
  "devDependencies": {
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "typescript": "~5.9.3",
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7",
    "vitest": "^4.0.4",
    "@playwright/test": "^1.56.1",
    "eslint": "^9.36.0"
  }
}
```

## References

- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [Stockfish.js GitHub](https://github.com/nmrugg/stockfish.js)
- [UCI Protocol](http://wbec-ridderkerk.nl/html/UCIProtocol.html)
- [Chess Programming Wiki](https://www.chessprogramming.org/)

---

## Getting Started (Post-Implementation)

```bash
# Navigate to project
cd chess-teacher

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Notes

- Start with simple, clear tutorials before adding complexity
- Focus on visual feedback - beginners learn best by seeing
- Keep AI response time fast (use appropriate depth limits)
- Make it fun and encouraging (positive feedback on progress)
- Ensure mobile-friendliness from the start

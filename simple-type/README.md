# Simple Type - Educational Web App

An educational web application designed for first graders, featuring adaptive learning for math and reading skills.

## Features

### Math Mode

- **Fill-in-the-blank math problems** with instant feedback
- **Progressive difficulty scaling**:
  - Level 1 (0-9 correct): Single digit addition
  - Level 2 (10-19 correct): Single digit addition & subtraction
  - Level 3 (20-34 correct): Double digit addition & subtraction
  - Level 4 (35-49 correct): Adds simple multiplication
  - Level 5 (50-74 correct): Triple digits, all operations
  - Level 6 (75+ correct): Advanced problems
- **Adaptive learning**: Adjusts difficulty based on recent performance
  - If struggling (< 60% success rate), problems become easier
  - If excelling (> 90% success rate), problems become more challenging
- **Visual feedback**:
  - Green flash for correct answers
  - Red flash for incorrect answers
- **Blinking cursor** on the answer input for visual focus
- **Score tracking** that only increases on correct answers

### Reading Mode

- **Typing practice** with age-appropriate paragraphs
- **Character-by-character highlighting** to guide typing progression
- **Real-time feedback**:
  - Correct characters move the highlight forward
  - Incorrect attempts are tracked but don't block progress
- **Progress tracking** with visual progress bar
- **Score display** showing:
  - 👍 Thumbs up: Number of correctly typed characters
  - 👎 Thumbs down: Number of incorrect attempts
- **Historical score storage**: All reading sessions are saved to local storage for future progress tracking
- **Continue or Exit options** after completing each paragraph
- **10 different paragraphs** with simple, first-grade vocabulary

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
```

## Technology Stack

- React 18
- TypeScript
- Vite
- CSS3 with animations

## Usage

The app starts in Math mode by default. Click the mode toggle in the top-left corner to switch between Math and Reading modes.

### Math Mode Controls

1. Type your answer in the input field
2. Press Enter to submit
3. Watch your score increase with correct answers
4. Problems automatically adjust to your skill level

### Reading Mode Controls

1. Click "Start" to begin a reading exercise
2. Type each character as it's highlighted
3. The highlight moves forward only when you type the correct character
4. Wrong attempts are counted but don't prevent progress
5. Complete the paragraph to see your score
6. Choose "Continue" for the next paragraph or "Exit" to return to the start screen

## Design Philosophy

The application is designed specifically for first graders with:
- Large, readable text
- Simple, distraction-free interface
- Positive reinforcement (score only goes up)
- Adaptive difficulty to maintain engagement
- Visual feedback for immediate learning

## Data Storage

The app uses browser localStorage to persist data:

### Math Mode Storage
- **Key**: `app:simple-type:score`
- **Format**: String representation of score number
- **Example**: `"42"`

### Reading Mode Historical Storage
- **Key**: `app:simple-type:history`
- **Format**: JSON array of historical entries
- **Structure**:
  ```json
  [
    {
      "date": "2025-10-26",
      "score": {
        "correct": 58,
        "incorrect": 5,
        "paragraphId": 0
      },
      "timestamp": 1729900000000
    }
  ]
  ```

This storage design allows for future implementation of a score/profile page to display historical progress and statistics.

## Development

This project uses Vite for fast development and Hot Module Replacement (HMR). The codebase is fully typed with TypeScript for reliability and maintainability.

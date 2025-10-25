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

Coming soon! Will feature reading exercises and comprehension activities.

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

## Design Philosophy

The application is designed specifically for first graders with:
- Large, readable text
- Simple, distraction-free interface
- Positive reinforcement (score only goes up)
- Adaptive difficulty to maintain engagement
- Visual feedback for immediate learning

## Development

This project uses Vite for fast development and Hot Module Replacement (HMR). The codebase is fully typed with TypeScript for reliability and maintainability.

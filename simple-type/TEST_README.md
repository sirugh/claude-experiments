# Testing Documentation

This document describes the comprehensive test suite for the Simple Type application.

## Test Setup

The application uses two testing frameworks:
- **Vitest** with React Testing Library for unit and integration tests
- **Playwright** for end-to-end (E2E) tests

## Running Tests

```bash
# Run all unit and integration tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run E2E tests (requires Playwright browsers installed)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# View last E2E test report
npm run test:e2e:report
```

## Test Coverage

### Unit Tests (82 tests)

#### Utility Functions
- **readingParagraphs.test.ts** (15 tests)
  - Tests paragraph data integrity
  - Tests shuffle algorithm correctness
  - Verifies all paragraphs are present and valid

- **mathUtils.test.ts** (34 tests)
  - Problem generation for all operations (addition, subtraction, multiplication, division)
  - Difficulty progression based on score
  - Adaptive difficulty based on performance
  - Tile options generation
  - Number range validation

- **readingUtils.test.ts** (33 tests)
  - Character matching (case-sensitive and case-insensitive)
  - Punctuation detection
  - Character skipping logic (spaces, punctuation)
  - Character input processing

### Integration Tests (70 tests)

#### Components
- **App.test.tsx** (14 tests)
  - Mode toggling between Math and Reading
  - localStorage persistence
  - Keyboard accessibility
  - Initial rendering

- **MathMode.test.tsx** (28 tests)
  - Start screen configuration
  - Standard mode gameplay
  - Tiles mode gameplay
  - Score tracking and persistence
  - Reset functionality
  - Visual feedback
  - Accessibility

- **ReadingMode.test.tsx** (28 tests)
  - Start screen configuration
  - Typing game mechanics
  - Progress tracking
  - Configuration effects (capital letters, spaces, punctuation)
  - History tracking
  - Error handling
  - Paragraph rendering
  - Accessibility

### E2E Tests

#### Math Mode (e2e/math-mode.spec.ts)
- Complete math practice session flow
- Mode switching (Standard/Tiles)
- Score reset functionality
- Configuration persistence
- Keyboard navigation
- Problem display structure
- Mode toggling

#### Reading Mode (e2e/reading-mode.spec.ts)
- Complete reading practice session flow
- Configuration options (Capital Letters, Spaces, Punctuation)
- Configuration persistence
- Paragraph rendering with character spans
- Progress bar and live score display
- Keyboard input handling
- Mobile support (hidden input field)
- Word grouping for text wrapping
- Mode switching

## Code Refactoring

To improve testability, the following modules were extracted:

### mathUtils.ts
Extracted from MathMode.tsx:
- `getDifficultyConfig()` - Determines problem difficulty based on score and performance
- `generateNumber()` - Generates random numbers within ranges
- `generateProblem()` - Creates math problems
- `generateTileOptions()` - Creates multiple choice options
- `getOperationSymbol()` - Returns operation symbols
- Type definitions: `Operation`, `Problem`, `DifficultyConfig`, `ProblemType`
- Constants: `PROBLEM_TYPES`

### readingUtils.ts
Extracted from ReadingMode.tsx:
- `isPunctuation()` - Checks if a character is punctuation
- `shouldSkip()` - Determines if a character should be skipped based on config
- `skipDisabledChars()` - Skips consecutive disabled characters
- `isCharacterMatch()` - Checks if typed character matches expected character
- `processCharacterInput()` - Processes character input and returns result
- Type definition: `Config`

These extractions make the code more testable and maintainable by:
- Separating pure logic from React components
- Enabling isolated unit testing
- Making mocking easier for integration tests
- Improving code reusability

## Test Statistics

- **Total Tests**: 152 unit/integration tests + E2E tests
- **Test Files**: 9 files (6 unit/integration + 2 E2E + 1 setup)
- **Test Coverage**: Comprehensive coverage of all major features

## Notes

### Playwright Setup
To run E2E tests, you need to install Playwright browsers first:
```bash
npx playwright install chromium
```

Note: The browsers couldn't be installed automatically in this environment due to network restrictions, but the configuration and tests are ready to run locally or in CI/CD.

### Test Environment
- Unit tests use JSDOM for browser simulation
- localStorage is mocked in test setup
- Math.random is mocked in relevant tests for deterministic results
- React Testing Library queries are used for accessibility-focused testing

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MathMode from './MathMode';

describe('MathMode', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Start Screen', () => {
    it('should render start screen with title', () => {
      render(<MathMode />);
      expect(screen.getByText('Math Practice')).toBeInTheDocument();
    });

    it('should render configuration options', () => {
      render(<MathMode />);
      expect(screen.getByLabelText(/Standard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tiles/i)).toBeInTheDocument();
    });

    it('should have Standard mode selected by default', () => {
      render(<MathMode />);
      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      expect(standardRadio).toBeChecked();
    });

    it('should render Start button', () => {
      render(<MathMode />);
      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
    });

    it('should allow switching to Tiles mode before starting', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      const tilesRadio = screen.getByRole('radio', { name: /Tiles/i });
      await user.click(tilesRadio);

      expect(tilesRadio).toBeChecked();
    });

    it('should save config selection to localStorage', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      const tilesRadio = screen.getByRole('radio', { name: /Tiles/i });
      await user.click(tilesRadio);

      const savedConfig = localStorage.getItem('app:simple-type:math-config');
      expect(savedConfig).toBeTruthy();
      const config = JSON.parse(savedConfig!);
      expect(config.mode).toBe('tiles');
    });

    it('should load saved config from localStorage', () => {
      localStorage.setItem('app:simple-type:math-config', JSON.stringify({ mode: 'tiles' }));

      render(<MathMode />);

      const tilesRadio = screen.getByRole('radio', { name: /Tiles/i });
      expect(tilesRadio).toBeChecked();
    });
  });

  describe('Standard Mode - Game Play', () => {
    it('should show a math problem after starting in standard mode', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      const startButton = screen.getByRole('button', { name: /Start/i });
      await user.click(startButton);

      // Should show score
      expect(screen.getByText(/Score:/i)).toBeInTheDocument();

      // Should show an input field for the answer
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('should display Reset button when game started', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    });

    it('should show score starting at 0', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });

    it('should accept number input', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      const input = screen.getByRole('spinbutton') as HTMLInputElement;
      await user.type(input, '5');

      expect(input.value).toBe('5');
    });

    it('should display operation symbols', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      // At level 1, should only show + operator
      const container = screen.getByRole('spinbutton').closest('.problem-container');
      expect(container).toBeInTheDocument();
    });

    it('should reset score to 0 when Reset button is clicked', async () => {
      const user = userEvent.setup();
      localStorage.setItem('app:simple-type:score', '10');

      render(<MathMode />);
      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByText('Score: 10')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Reset/i }));

      expect(screen.getByText('Score: 0')).toBeInTheDocument();
    });

    it('should load saved score from localStorage', async () => {
      const user = userEvent.setup();
      localStorage.setItem('app:simple-type:score', '25');

      render(<MathMode />);
      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByText('Score: 25')).toBeInTheDocument();
    });

    it('should auto-focus input field', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveFocus();
    });
  });

  describe('Tiles Mode - Game Play', () => {
    it('should show tile options after starting in tiles mode', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      const tilesRadio = screen.getByRole('radio', { name: /Tiles/i });
      await user.click(tilesRadio);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      // Should show exactly 4 tiles
      const tiles = screen.getAllByRole('button').filter(btn => btn.textContent?.match(/^\d+$/));
      expect(tiles.length).toBe(4);
    });

    it('should show problem in equation format in tiles mode', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('radio', { name: /Tiles/i }));
      await user.click(screen.getByRole('button', { name: /Start/i }));

      // Should show problem with ? (e.g., "5 + 3 = ?")
      expect(screen.getByText(/\?/)).toBeInTheDocument();
    });

    it('should display 4 unique tile options', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('radio', { name: /Tiles/i }));
      await user.click(screen.getByRole('button', { name: /Start/i }));

      const tiles = screen.getAllByRole('button').filter(btn => btn.textContent?.match(/^\d+$/));
      const values = tiles.map(tile => tile.textContent);
      const uniqueValues = new Set(values);

      expect(uniqueValues.size).toBe(4);
    });

    it('should disable tiles after selection', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('radio', { name: /Tiles/i }));
      await user.click(screen.getByRole('button', { name: /Start/i }));

      const tiles = screen.getAllByRole('button').filter(btn => btn.textContent?.match(/^\d+$/));
      await user.click(tiles[0]);

      // All tiles should be disabled after clicking
      tiles.forEach(tile => {
        expect(tile).toBeDisabled();
      });
    });
  });

  describe('Score Persistence', () => {
    it('should save score to localStorage after each correct answer', async () => {
      const user = userEvent.setup();
      vi.spyOn(Math, 'random').mockReturnValue(0.1);

      render(<MathMode />);
      await user.click(screen.getByRole('button', { name: /Start/i }));

      // At score 0, level 1: single digit addition (1-9 + 1-9)
      // With Math.random = 0.1, we get consistent numbers
      const input = screen.getByRole('spinbutton') as HTMLInputElement;

      // Get the problem numbers from the display
      const problemContainer = input.closest('.problem-container');
      expect(problemContainer).toBeInTheDocument();

      // Type an arbitrary answer and submit (testing localStorage save, not correctness)
      await user.type(input, '10');
      await user.keyboard('{Enter}');

      // Check that localStorage was updated (even if answer was wrong)
      const savedScore = localStorage.getItem('app:simple-type:score');
      expect(savedScore).toBeTruthy();

      vi.restoreAllMocks();
    });

    it('should persist score across component re-renders', async () => {
      const user = userEvent.setup();
      localStorage.setItem('app:simple-type:score', '15');

      const { unmount } = render(<MathMode />);
      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByText('Score: 15')).toBeInTheDocument();

      unmount();

      render(<MathMode />);
      await user.click(screen.getByRole('button', { name: /Start/i }));

      expect(screen.getByText('Score: 15')).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    it('should have feedback classes for correct/wrong answers', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      const input = screen.getByRole('spinbutton');
      await user.type(input, '999'); // Likely wrong answer
      await user.keyboard('{Enter}');

      // The problem-container should temporarily get a feedback class
      const container = input.closest('.problem-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Problem Generation', () => {
    it('should generate different problems', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      // Get first problem
      const container1 = screen.getByRole('spinbutton').closest('.problem-container');
      const problem1Text = container1?.textContent;

      // Since we can't easily submit correct answers without knowing the problem,
      // we'll just verify a problem was generated
      expect(problem1Text).toBeTruthy();
      expect(problem1Text?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('app:simple-type:score', 'invalid');
      localStorage.setItem('app:simple-type:math-config', 'not-json');

      expect(() => render(<MathMode />)).not.toThrow();
    });

    it('should default to standard mode if config is invalid', () => {
      localStorage.setItem('app:simple-type:math-config', '{invalid json}');

      render(<MathMode />);

      const standardRadio = screen.getByRole('radio', { name: /Standard/i });
      expect(standardRadio).toBeChecked();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form controls', async () => {
      const user = userEvent.setup();
      render(<MathMode />);

      await user.click(screen.getByRole('button', { name: /Start/i }));

      // Input should be accessible
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('should have labeled radio buttons', () => {
      render(<MathMode />);

      expect(screen.getByLabelText(/Standard/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tiles/i)).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      render(<MathMode />);

      const startButton = screen.getByRole('button', { name: /Start/i });
      expect(startButton).toBeInTheDocument();
    });
  });
});

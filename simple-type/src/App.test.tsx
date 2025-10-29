import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the child components to simplify testing
vi.mock('./MathMode', () => ({
  default: () => <div data-testid="math-mode">Math Mode Component</div>
}));

vi.mock('./ReadingMode', () => ({
  default: () => <div data-testid="reading-mode">Reading Mode Component</div>
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      render(<App />);
      expect(screen.getByLabelText('Toggle between Reading and Math modes')).toBeInTheDocument();
    });

    it('should render Math mode by default', () => {
      render(<App />);
      expect(screen.getByTestId('math-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('reading-mode')).not.toBeInTheDocument();
    });

    it('should render toggle button with correct initial state', () => {
      render(<App />);
      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      expect(toggle).toHaveClass('math');
    });

    it('should render Reading and Math labels', () => {
      render(<App />);
      const labels = screen.getAllByText(/Reading|Math/i);
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Mode Toggle', () => {
    it('should switch from Math to Reading mode when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      await user.click(toggle);

      expect(screen.getByTestId('reading-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('math-mode')).not.toBeInTheDocument();
    });

    it('should switch from Reading to Math mode when toggle is clicked twice', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');

      // First click - switch to Reading
      await user.click(toggle);
      expect(screen.getByTestId('reading-mode')).toBeInTheDocument();

      // Second click - switch back to Math
      await user.click(toggle);
      expect(screen.getByTestId('math-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('reading-mode')).not.toBeInTheDocument();
    });

    it('should update toggle button class when mode changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      expect(toggle).toHaveClass('math');

      await user.click(toggle);
      expect(toggle).toHaveClass('reading');

      await user.click(toggle);
      expect(toggle).toHaveClass('math');
    });
  });

  describe('localStorage Integration', () => {
    it('should save mode to localStorage when changed', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      await user.click(toggle);

      expect(localStorage.getItem('app:simple-type:mode')).toBe('reading');
    });

    it('should load mode from localStorage on mount', () => {
      localStorage.setItem('app:simple-type:mode', 'reading');

      render(<App />);

      expect(screen.getByTestId('reading-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('math-mode')).not.toBeInTheDocument();
    });

    it('should default to math mode if localStorage has invalid value', () => {
      localStorage.setItem('app:simple-type:mode', 'invalid-mode');

      render(<App />);

      expect(screen.getByTestId('math-mode')).toBeInTheDocument();
      expect(screen.queryByTestId('reading-mode')).not.toBeInTheDocument();
    });

    it('should default to math mode if localStorage is empty', () => {
      render(<App />);

      expect(screen.getByTestId('math-mode')).toBeInTheDocument();
      expect(localStorage.getItem('app:simple-type:mode')).toBe('math');
    });

    it('should persist mode across re-renders', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      await user.click(toggle);

      unmount();

      // Re-render the component
      render(<App />);

      // Should maintain reading mode
      expect(screen.getByTestId('reading-mode')).toBeInTheDocument();
    });
  });

  describe('Toggle Button Accessibility', () => {
    it('should have accessible label', () => {
      render(<App />);
      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');
      expect(toggle).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggle = screen.getByLabelText('Toggle between Reading and Math modes');

      // Focus the toggle button
      toggle.focus();
      expect(toggle).toHaveFocus();

      // Press Enter key
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('reading-mode')).toBeInTheDocument();
    });
  });
});

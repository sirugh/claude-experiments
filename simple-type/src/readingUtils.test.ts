import { describe, it, expect } from 'vitest';
import {
  type Config,
  isPunctuation,
  shouldSkip,
  skipDisabledChars,
  isCharacterMatch,
  processCharacterInput,
} from './readingUtils';

describe('readingUtils', () => {
  describe('isPunctuation', () => {
    it('should return true for common punctuation marks', () => {
      expect(isPunctuation('.')).toBe(true);
      expect(isPunctuation(',')).toBe(true);
      expect(isPunctuation('!')).toBe(true);
      expect(isPunctuation('?')).toBe(true);
      expect(isPunctuation(';')).toBe(true);
      expect(isPunctuation(':')).toBe(true);
      expect(isPunctuation("'")).toBe(true);
      expect(isPunctuation('"')).toBe(true);
      expect(isPunctuation('-')).toBe(true);
    });

    it('should return true for brackets and parentheses', () => {
      expect(isPunctuation('(')).toBe(true);
      expect(isPunctuation(')')).toBe(true);
      expect(isPunctuation('[')).toBe(true);
      expect(isPunctuation(']')).toBe(true);
      expect(isPunctuation('{')).toBe(true);
      expect(isPunctuation('}')).toBe(true);
    });

    it('should return false for letters', () => {
      expect(isPunctuation('a')).toBe(false);
      expect(isPunctuation('Z')).toBe(false);
      expect(isPunctuation('m')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isPunctuation('1')).toBe(false);
      expect(isPunctuation('9')).toBe(false);
      expect(isPunctuation('0')).toBe(false);
    });

    it('should return false for spaces', () => {
      expect(isPunctuation(' ')).toBe(false);
    });
  });

  describe('shouldSkip', () => {
    it('should skip spaces when config.spaces is false', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: true
      };

      expect(shouldSkip(' ', config)).toBe(true);
    });

    it('should not skip spaces when config.spaces is true', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(shouldSkip(' ', config)).toBe(false);
    });

    it('should skip punctuation when config.punctuation is false', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: false
      };

      expect(shouldSkip('.', config)).toBe(true);
      expect(shouldSkip(',', config)).toBe(true);
      expect(shouldSkip('!', config)).toBe(true);
      expect(shouldSkip('?', config)).toBe(true);
    });

    it('should not skip punctuation when config.punctuation is true', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(shouldSkip('.', config)).toBe(false);
      expect(shouldSkip(',', config)).toBe(false);
    });

    it('should not skip letters', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      expect(shouldSkip('a', config)).toBe(false);
      expect(shouldSkip('Z', config)).toBe(false);
    });

    it('should skip both spaces and punctuation when both are disabled', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      expect(shouldSkip(' ', config)).toBe(true);
      expect(shouldSkip('.', config)).toBe(true);
      expect(shouldSkip(',', config)).toBe(true);
    });
  });

  describe('skipDisabledChars', () => {
    it('should skip consecutive spaces when spaces are disabled', () => {
      const paragraph = 'Hello   World';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: true
      };

      const result = skipDisabledChars(paragraph, 5, config);
      expect(result).toBe(8); // Should skip 3 spaces
      expect(paragraph[result]).toBe('W');
    });

    it('should skip consecutive punctuation when punctuation is disabled', () => {
      const paragraph = 'Hello... World';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: false
      };

      const result = skipDisabledChars(paragraph, 5, config);
      expect(result).toBe(8); // Should skip 3 dots
      expect(paragraph[result]).toBe(' ');
    });

    it('should skip mixed spaces and punctuation', () => {
      const paragraph = 'Hello, . ! World';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      const result = skipDisabledChars(paragraph, 5, config);
      expect(result).toBe(11); // Should skip ', . ! '
      expect(paragraph[result]).toBe('W');
    });

    it('should return same index when no characters to skip', () => {
      const paragraph = 'Hello World';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      const result = skipDisabledChars(paragraph, 6, config);
      expect(result).toBe(6); // No skipping needed
    });

    it('should return paragraph length when reaching end', () => {
      const paragraph = 'Hello   ';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: true
      };

      const result = skipDisabledChars(paragraph, 5, config);
      expect(result).toBe(paragraph.length);
    });

    it('should handle start of paragraph', () => {
      const paragraph = '   Hello';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: true
      };

      const result = skipDisabledChars(paragraph, 0, config);
      expect(result).toBe(3);
      expect(paragraph[result]).toBe('H');
    });
  });

  describe('isCharacterMatch', () => {
    it('should match exact characters when capitalLetters is true', () => {
      const config: Config = {
        capitalLetters: true,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch('a', 'a', config)).toBe(true);
      expect(isCharacterMatch('A', 'A', config)).toBe(true);
      expect(isCharacterMatch('a', 'A', config)).toBe(false);
      expect(isCharacterMatch('A', 'a', config)).toBe(false);
    });

    it('should match case-insensitively when capitalLetters is false', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch('a', 'A', config)).toBe(true);
      expect(isCharacterMatch('A', 'a', config)).toBe(true);
      expect(isCharacterMatch('z', 'Z', config)).toBe(true);
      expect(isCharacterMatch('M', 'm', config)).toBe(true);
    });

    it('should match exact same lowercase when capitalLetters is false', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch('a', 'a', config)).toBe(true);
      expect(isCharacterMatch('z', 'z', config)).toBe(true);
    });

    it('should not match different letters regardless of config', () => {
      const configCaseSensitive: Config = {
        capitalLetters: true,
        spaces: true,
        punctuation: true
      };

      const configCaseInsensitive: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch('a', 'b', configCaseSensitive)).toBe(false);
      expect(isCharacterMatch('a', 'b', configCaseInsensitive)).toBe(false);
    });

    it('should match spaces', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch(' ', ' ', config)).toBe(true);
    });

    it('should match punctuation', () => {
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      expect(isCharacterMatch('.', '.', config)).toBe(true);
      expect(isCharacterMatch('!', '!', config)).toBe(true);
    });
  });

  describe('processCharacterInput', () => {
    it('should process correct character input', () => {
      const paragraph = 'Hello';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      const result = processCharacterInput('h', 0, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(1);
    });

    it('should process incorrect character input', () => {
      const paragraph = 'Hello';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      const result = processCharacterInput('a', 0, paragraph, config);

      expect(result.isCorrect).toBe(false);
      expect(result.nextCharIndex).toBe(0); // Should not advance
    });

    it('should skip disabled spaces automatically', () => {
      const paragraph = 'Hello World';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: true
      };

      // At the space character
      const result = processCharacterInput('x', 5, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(6); // Should skip space and go to 'W'
    });

    it('should skip disabled punctuation automatically', () => {
      const paragraph = 'Hello.World';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: false
      };

      // At the period character
      const result = processCharacterInput('x', 5, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(6); // Should skip period and go to 'W'
    });

    it('should skip multiple consecutive disabled characters', () => {
      const paragraph = 'Hello... World';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      // At position 5 (first period)
      const result = processCharacterInput('x', 5, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(9); // Should skip '... '
    });

    it('should handle case-sensitive matching', () => {
      const paragraph = 'Hello';
      const config: Config = {
        capitalLetters: true,
        spaces: true,
        punctuation: true
      };

      const correctResult = processCharacterInput('H', 0, paragraph, config);
      expect(correctResult.isCorrect).toBe(true);
      expect(correctResult.nextCharIndex).toBe(1);

      const incorrectResult = processCharacterInput('h', 0, paragraph, config);
      expect(incorrectResult.isCorrect).toBe(false);
      expect(incorrectResult.nextCharIndex).toBe(0);
    });

    it('should handle case-insensitive matching', () => {
      const paragraph = 'Hello';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      const lowerResult = processCharacterInput('h', 0, paragraph, config);
      expect(lowerResult.isCorrect).toBe(true);
      expect(lowerResult.nextCharIndex).toBe(1);

      const upperResult = processCharacterInput('H', 0, paragraph, config);
      expect(upperResult.isCorrect).toBe(true);
      expect(upperResult.nextCharIndex).toBe(1);
    });

    it('should advance and skip disabled chars after correct input', () => {
      const paragraph = 'Hi, World';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      // Typing 'i' at position 1
      const result = processCharacterInput('i', 1, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(4); // Should skip ', ' and go to 'W'
    });

    it('should handle end of paragraph', () => {
      const paragraph = 'Hi';
      const config: Config = {
        capitalLetters: false,
        spaces: true,
        punctuation: true
      };

      // Typing last character
      const result = processCharacterInput('i', 1, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(2); // End of paragraph
    });

    it('should handle paragraph with trailing disabled characters', () => {
      const paragraph = 'Hi...';
      const config: Config = {
        capitalLetters: false,
        spaces: false,
        punctuation: false
      };

      // Typing last enabled character
      const result = processCharacterInput('i', 1, paragraph, config);

      expect(result.isCorrect).toBe(true);
      expect(result.nextCharIndex).toBe(5); // Should skip to end
    });
  });
});

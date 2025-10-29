export interface Config {
  capitalLetters: boolean;
  spaces: boolean;
  punctuation: boolean;
}

/**
 * Checks if a character is punctuation
 * @param char The character to check
 * @returns true if the character is punctuation
 */
export function isPunctuation(char: string): boolean {
  return /[.,!?;:'"\-()[\]{}]/.test(char);
}

/**
 * Checks if a character should be skipped based on config
 * @param char The character to check
 * @param config The user's configuration settings
 * @returns true if the character should be skipped
 */
export function shouldSkip(char: string, config: Config): boolean {
  return (!config.spaces && char === ' ') || (!config.punctuation && isPunctuation(char));
}

/**
 * Skips consecutive disabled characters in the paragraph
 * @param paragraph The full paragraph text
 * @param startIndex The index to start skipping from
 * @param config The user's configuration settings
 * @returns The index of the next non-skipped character
 */
export function skipDisabledChars(paragraph: string, startIndex: number, config: Config): number {
  let index = startIndex;
  while (index < paragraph.length && shouldSkip(paragraph[index], config)) {
    index++;
  }
  return index;
}

/**
 * Checks if a typed character matches the expected character
 * @param typedChar The character that was typed
 * @param expectedChar The expected character from the paragraph
 * @param config The user's configuration settings
 * @returns true if the characters match
 */
export function isCharacterMatch(typedChar: string, expectedChar: string, config: Config): boolean {
  return config.capitalLetters
    ? expectedChar === typedChar
    : expectedChar.toLowerCase() === typedChar.toLowerCase();
}

/**
 * Processes a character input and returns the result
 * @param typedChar The character that was typed
 * @param currentCharIndex The current position in the paragraph
 * @param paragraph The full paragraph text
 * @param config The user's configuration settings
 * @returns Object with isCorrect flag and nextCharIndex
 */
export function processCharacterInput(
  typedChar: string,
  currentCharIndex: number,
  paragraph: string,
  config: Config
): { isCorrect: boolean; nextCharIndex: number } {
  let expectedChar = paragraph[currentCharIndex];

  // Skip all consecutive disabled characters (spaces and/or punctuation)
  if (shouldSkip(expectedChar, config)) {
    const nextIndex = skipDisabledChars(paragraph, currentCharIndex, config);
    return { isCorrect: true, nextCharIndex: nextIndex };
  }

  // Check if the typed character matches
  const isCorrect = isCharacterMatch(typedChar, expectedChar, config);

  if (isCorrect) {
    const nextIndex = currentCharIndex + 1;
    // Skip all consecutive disabled characters after this one
    const finalIndex = skipDisabledChars(paragraph, nextIndex, config);
    return { isCorrect: true, nextCharIndex: finalIndex };
  }

  // Incorrect match - don't advance
  return { isCorrect: false, nextCharIndex: currentCharIndex };
}

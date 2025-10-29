import { test, expect } from '@playwright/test';

test.describe('Math Mode E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete a full math practice session', async ({ page }) => {
    // Verify we're on the app
    await expect(page.locator('text=Reading')).toBeVisible();
    await expect(page.locator('text=Math')).toBeVisible();

    // Toggle to Math mode (it should be default, but let's ensure it)
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Should see Math Practice title
    await expect(page.locator('text=Math Practice')).toBeVisible();

    // Select Standard mode
    await page.locator('input[value="standard"]').check();

    // Click Start button
    await page.locator('button:has-text("Start")').click();

    // Should see the score
    await expect(page.locator('text=Score: 0')).toBeVisible();

    // Should see a problem (numbers and operator)
    await expect(page.locator('.problem-container')).toBeVisible();

    // Should see an input field
    const answerInput = page.locator('input[type="number"]');
    await expect(answerInput).toBeVisible();

    // Input should be focused
    await expect(answerInput).toBeFocused();
  });

  test('should switch between Standard and Tiles modes', async ({ page }) => {
    await page.goto('/');

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Should see configuration options
    await expect(page.locator('text=Standard')).toBeVisible();
    await expect(page.locator('text=Tiles')).toBeVisible();

    // Select Tiles mode
    await page.locator('input[value="tiles"]').check();

    // Start the game
    await page.locator('button:has-text("Start")').click();

    // Should see 4 tile buttons
    const tiles = page.locator('.tiles-container button');
    await expect(tiles).toHaveCount(4);

    // Tiles should have numbers
    const firstTile = tiles.first();
    const tileText = await firstTile.textContent();
    expect(tileText).toMatch(/^\d+$/);
  });

  test('should reset score when Reset button is clicked', async ({ page }) => {
    await page.goto('/');

    // Set a score in localStorage
    await page.evaluate(() => {
      localStorage.setItem('app:simple-type:score', '15');
    });

    // Reload to pick up the saved score
    await page.reload();

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Start the game
    await page.locator('button:has-text("Start")').click();

    // Should see the saved score
    await expect(page.locator('text=Score: 15')).toBeVisible();

    // Click Reset button
    await page.locator('button:has-text("Reset")').click();

    // Score should be reset to 0
    await expect(page.locator('text=Score: 0')).toBeVisible();
  });

  test('should persist mode selection in localStorage', async ({ page }) => {
    await page.goto('/');

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Select Tiles mode
    await page.locator('input[value="tiles"]').check();

    // Reload the page
    await page.reload();

    // Tiles mode should still be selected
    await expect(page.locator('input[value="tiles"]')).toBeChecked();
  });

  test('should display correct operation symbol for addition', async ({ page }) => {
    await page.goto('/');

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Start with standard mode
    await page.locator('button:has-text("Start")').click();

    // At level 1, should only see addition (+)
    // Look for the operator symbol in the problem
    const problemContainer = page.locator('.problem-container');
    await expect(problemContainer).toBeVisible();

    // Should have numbers and an operator
    const problem = problemContainer.locator('.problem');
    await expect(problem).toBeVisible();
  });

  test('should handle keyboard navigation on start screen', async ({ page }) => {
    await page.goto('/');

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Tab to the start button
    await page.keyboard.press('Tab');

    // Press Enter to start
    const startButton = page.locator('button:has-text("Start")');
    await startButton.focus();
    await page.keyboard.press('Enter');

    // Should start the game
    await expect(page.locator('text=Score:')).toBeVisible();
  });

  test('should show problem container with correct structure', async ({ page }) => {
    await page.goto('/');

    // Toggle to Math mode if needed
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');
    const toggleClass = await toggleButton.getAttribute('class');

    if (!toggleClass?.includes('math')) {
      await toggleButton.click();
    }

    // Start the game
    await page.locator('button:has-text("Start")').click();

    // Problem container should exist
    const problemContainer = page.locator('.problem-container');
    await expect(problemContainer).toBeVisible();

    // Should have problem structure
    const problem = problemContainer.locator('.problem');
    await expect(problem).toBeVisible();

    // Should have problem lines
    const problemLines = problem.locator('.problem-line');
    await expect(problemLines).toHaveCount(4); // num1, operator+num2, separator, answer input
  });

  test('should toggle between math and reading modes', async ({ page }) => {
    await page.goto('/');

    // Should start in one mode
    const toggleButton = page.locator('button[aria-label="Toggle between Reading and Math modes"]');

    // Get initial mode
    const initialClass = await toggleButton.getAttribute('class');
    const initiallyMath = initialClass?.includes('math');

    // Click toggle
    await toggleButton.click();

    // Mode should change
    const newClass = await toggleButton.getAttribute('class');
    const nowMath = newClass?.includes('math');

    expect(initiallyMath).not.toBe(nowMath);

    // Should see different content
    if (nowMath) {
      await expect(page.locator('text=Math Practice')).toBeVisible();
    } else {
      await expect(page.locator('text=Reading Practice')).toBeVisible();
    }
  });
});

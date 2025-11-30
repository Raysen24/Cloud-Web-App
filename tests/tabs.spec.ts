import { test, expect } from '@playwright/test';

/**
 * Test A:
 * - One tab
 * - Generate HTML
 * - Check that the HTML contains the title + content
 */
test('Tabs builder generates HTML for a single tab', async ({ page }) => {
  await page.goto('/tabs');

  // first input is the tab title
  const titleInput = page.locator('input').first();
  await titleInput.fill('Home');

  // the editable textarea (NOT readOnly) is the tab content
  const editor = page.locator('textarea:not([readonly])').first();
  await editor.fill('Welcome to the Home tab.');

  // generate code
  await page.getByRole('button', { name: 'Generate Code' }).click();

  const output = await page.locator('textarea[readonly]').inputValue();

  expect(output).toContain('<!doctype html>');
  expect(output).toContain('Tabs Export');
  expect(output).toContain('Home');
  expect(output).toContain('Welcome to the Home tab.');
});

/**
 * Test B:
 * - Three tabs
 * - Generate HTML
 * - Check that all three titles appear in the exported code
 */
test('Tabs builder exports HTML with three tabs', async ({ page }) => {
  await page.goto('/tabs');

  // Start from the default first tab
  const titleInput = page.locator('input').first();
  await titleInput.fill('Tab A');

  // Add two more tabs
  await page.getByRole('button', { name: '+ Add tab' }).click();
  await page.getByRole('button', { name: '+ Add tab' }).click();

  const titleInputs = page.locator('ul li input');
  await titleInputs.nth(1).fill('Tab B');
  await titleInputs.nth(2).fill('Tab C');

  // Select Tab C and give it some content
  const selectButtons = page.getByRole('button', { name: 'Select' });
  await selectButtons.nth(2).click();

  const editor = page.locator('textarea:not([readonly])').first();
  await editor.fill('Content for Tab C.');

  await page.getByRole('button', { name: 'Generate Code' }).click();
  const output = await page.locator('textarea[readonly]').inputValue();

  expect(output).toContain('Tab A');
  expect(output).toContain('Tab B');
  expect(output).toContain('Tab C');
  expect(output).toContain('Content for Tab C.');
});

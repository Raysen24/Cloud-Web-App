import { test, expect } from '@playwright/test';

/**
 * Test 1:
 * - Escape room page loads
 * - Difficulty title + buttons are visible
 */
test('Escape Room landing shows difficulty selection', async ({ page }) => {
  await page.goto('/escape-room');

  // Title
  await expect(
    page.getByText('Coding Escape – Choose Difficulty')
  ).toBeVisible();

  // Difficulty buttons – use .first() so we use the big main buttons,
  // not any other "easy"/"medium"/"hard" text.
  await expect(
    page.getByRole('button', { name: 'Easy', exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Medium', exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Hard', exact: true }).first()
  ).toBeVisible();
});

/**
 * Test 2:
 * - Start game on Easy
 * - Solve ALL 6 stages by auto-filling valid code for each puzzle
 * - For each room, check that the success message appears
 *
 * This covers:
 *  - Format code correctly (room1)
 *  - Debug console (room2)
 *  - Generate numbers 0..1000 (room3)
 *  - Port CSV -> JSON (room4)
 *  - Compute lock code from string (room5)
 *  - Final escape() function (room6)
 */
test('Player can solve all six rooms and escape', async ({ page }) => {
  await page.goto('/escape-room');

  // Start on Easy
  await page
    .getByRole('button', { name: 'Easy', exact: true })
    .first()
    .click();

  // Reusable handle for the main code editor
  const textarea = page.locator('textarea.escape-code-textarea');

  // Helper: click the CONTROL "Connect puzzle" button,
  // not the gear hotspot (which also has aria-label "Connect puzzle")
  async function clickConnectPuzzle() {
    await page
      .locator('button.escape-btn-secondary', { hasText: 'Connect puzzle' })
      .click();
  }

  // ---------- ROOM 1 – FORMAT ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 1 – Format the code' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room1Code = `
function formatDoorCode() {
  const doorId = [1, 2, 3, 4].find((id) => id === 4);
  return doorId;
}
  `.trim();

  await textarea.fill(room1Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'Code formatted and readable. Panel accepts your function!'
    )
  ).toBeVisible();

  // Door to next room
  await page.getByRole('button', { name: 'Next room' }).click();

  // ---------- ROOM 2 – DEBUG ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 2 – Debug the console' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room2Code = `
function getFirstEvenDoorId(ids) {
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] % 2 === 0) {
      return ids[i];
    }
  }
  return -1;
}
  `.trim();

  await textarea.fill(room2Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'You fixed the logic! The console returns the first even door id.'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'Next room' }).click();

  // ---------- ROOM 3 – GENERATE 0..1000 ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 3 – Generate 0 to 1000' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room3Code = `
function generateSequence() {
  const result: number[] = [];
  for (let i = 0; i <= 1000; i = i + 1) {
    result.push(i);
  }
  return result;
}
  `.trim();

  await textarea.fill(room3Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'Loop looks correct — every integer from 0 to 1000 is generated.'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'Next room' }).click();

  // ---------- ROOM 4 – CSV to JSON ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 4 – CSV to JSON' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room4Code = `
function parseCsv(csvText: string) {
  const lines = csvText.trim().split("\\n");
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const [name, scoreStr] = line.split(",");
    return { name, score: Number(scoreStr) };
  });
}
  `.trim();

  await textarea.fill(room4Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'Nice! You are splitting CSV and mapping rows into objects.'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'Next room' }).click();

  // ---------- ROOM 5 – COMPUTE LOCK CODE ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 5 – Compute the lock code' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room5Code = `
function computeLockCode(input: string): string {
  const example = "LAB-451";
  const digits = example.slice(example.indexOf("-") + 1);
  return digits.padStart(4, "0");
}
  `.trim();

  await textarea.fill(room5Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'You computed the lock code correctly. The keypad glows green.'
    )
  ).toBeVisible();

  await page.getByRole('button', { name: 'Next room' }).click();

  // ---------- ROOM 6 – FINAL ESCAPE ----------
  await expect(
    page.getByRole('heading', { name: 'Stage 6 – Final escape system' })
  ).toBeVisible();

  await clickConnectPuzzle();

  const room6Code = `
function escape(): string {
  // combine everything and ESCAPED
  return "ESCAPED";
}
  `.trim();

  await textarea.fill(room6Code);
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  await expect(
    page.getByText(
      'Final check passed! The main exit door slides open — you escaped.'
    )
  ).toBeVisible();

  // At this point your EndScreen should show success + final time.
});

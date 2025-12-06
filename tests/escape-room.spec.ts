import { test, expect } from '@playwright/test';

// Helper: click the main difficulty button by label.
// The page only has one "Easy" / "Medium" / "Hard" button with that exact label
// (leaderboard filters are lowercase), so we can safely click .first() and
// let the rest of the test wait for the run UI (Connect puzzle, headings, etc).
async function clickDifficultyButton(
  page: any,
  difficultyLabel: 'Easy' | 'Medium' | 'Hard'
) {
  // Ensure we are on the landing screen
  await expect(
    page.getByText('Coding Escape – Choose Difficulty')
  ).toBeVisible({ timeout: 15000 });

  const button = page
    .getByRole('button', { name: difficultyLabel, exact: true })
    .first();

  await expect(button).toBeVisible({ timeout: 15000 });
  await button.click();
}

// Mock noisy APIs so that Next.js route handlers don't try to parse empty bodies
// and spam "Unexpected end of JSON input" in the dev terminal.
test.beforeEach(async ({ page }) => {
  // Swallow /api/sessions completely – tests don't depend on this endpoint.
  await page.route('**/api/sessions**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  // Swallow ONLY "bad" /api/save POSTs that don't have a JSON body.
  // Real "Save progress" calls with JSON are allowed through.
  await page.route('**/api/save**', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      // GET /api/save or anything else – let the app handle it.
      await route.continue();
      return;
    }

    const postData = request.postData();
    const headers = request.headers();
    const contentType =
      headers['content-type'] || headers['Content-Type'] || '';

    const looksLikeJson = contentType.includes('application/json');

    // If there's no body or it's not marked as JSON, it's the "bad" call
    // that would cause `request.json()` to throw. Swallow it.
    if (!postData || !looksLikeJson) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    // Otherwise, let the real /api/save route run for genuine save progress.
    await route.continue();
  });
});

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

  // Difficulty buttons – just assert visibility; we don't care which exact one.
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
 */
test('Player can solve all six rooms and escape', async ({ page }) => {
  await page.goto('/escape-room');

  // Start on Easy — try all "Easy" buttons until Stage 1 appears.
  await clickDifficultyButton(page, 'Easy');

  // Reusable handle for the main code editor
  const textarea = page.locator('textarea.escape-code-textarea');

  // Helper: click the CONTROL "Connect puzzle" button,
  // not the gear hotspot (which also has aria-label "Connect puzzle")
  async function clickConnectPuzzle() {
    const connectBtn = page
      .locator('button.escape-btn-secondary', { hasText: 'Connect puzzle' })
      .first();

    await expect(connectBtn).toBeVisible({ timeout: 15000 });
    await connectBtn.click();
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
});

/**
 * Test 3:
 * - Sign up
 * - Complete Easy run
 * - Medium: play, save at stage 3, leave, resume, finish
 * - Hard: play, save at stage 5, logout/login, resume, finish
 * - Finally delete account
 */
test('User can sign up, save & resume runs across difficulties, then delete account', async ({
  page,
}) => {
  await page.goto('/escape-room');

  // --- Generate unique test user credentials ---
  const runId = Date.now();
  const email = `playwright+${runId}@example.com`;
  const password = 'pw-escape-123!';
  const displayName = 'Playwright Escape';

  // --- Auth: Sign up (register) ---
  await page
    .getByRole('button', { name: 'Need an account? Sign up' })
    .click();

  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByPlaceholder('Display name').fill(displayName);

  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.getByText(displayName)).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();

  // --- Common helpers for the game ---
  const textarea = page.locator('textarea.escape-code-textarea');

  async function clickConnectPuzzle() {
    const connectBtn = page
      .locator('button.escape-btn-secondary', { hasText: 'Connect puzzle' })
      .first();

    await expect(connectBtn).toBeVisible({ timeout: 15000 });
    await connectBtn.click();
  }

  async function goNextRoom() {
    await page.getByRole('button', { name: 'Next room' }).click();
  }

  // EASY puzzle code
  const easyRoom1Code = `
function formatDoorCode() {
  const doorId = [1, 2, 3, 4].find((id) => id === 4);
  return doorId;
}
  `.trim();

  const easyRoom2Code = `
function getFirstEvenDoorId(ids) {
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] % 2 === 0) {
      return ids[i];
    }
  }
  return -1;
}
  `.trim();

  const easyRoom3Code = `
function generateSequence() {
  const result: number[] = [];
  for (let i = 0; i <= 1000; i = i + 1) {
    result.push(i);
  }
  return result;
}
  `.trim();

  const easyRoom4Code = `
function parseCsv(csvText: string) {
  const lines = csvText.trim().split("\\n");
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const [name, scoreStr] = line.split(",");
    return { name, score: Number(scoreStr) };
  });
}
  `.trim();

  const easyRoom5Code = `
function computeLockCode(input: string): string {
  const example = "LAB-451";
  const digits = example.slice(example.indexOf("-") + 1);
  return digits.padStart(4, "0");
}
  `.trim();

  // MEDIUM puzzle code
  const mediumRoom1Code = `
export function formatAccessToken(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  const parts = cleaned.match(/.{1,4}/g) || [];
  return parts.join('-');
}
  `.trim();

  const mediumRoom2Code = `
export function averageTwoDecimals(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, n) => acc + n, 0);
  const avg = sum / nums.length;
  return Math.round(avg * 100) / 100;
}
  `.trim();

  const mediumRoom3Code = `
export function* primesUpTo(limit: number): Generator<number> {
  outer: for (let n = 2; n <= limit; n++) {
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) {
        continue outer;
      }
    }
    yield n;
  }
}
  `.trim();

  const mediumRoom4Code = `
export type Row = { name: string; score: number; passed: boolean };
export function tsvToJson(tsv: string): Row[] {
  const lines = tsv.trim().split("\\n");
  const headers = lines[0].split("\\t");
  return lines.slice(1).map((line) => {
    const [name, scoreStr, passedStr] = line.split("\\t");
    return {
      name,
      score: Number(scoreStr),
      passed: passedStr === 'true',
    };
  });
}
  `.trim();

  const mediumRoom5Code = `
export function computeLockBase36(s: string): string {
  let sum = 0;
  for (const ch of s) {
    sum += ch.charCodeAt(0);
  }
  const base36 = sum.toString(36).toUpperCase();
  return base36.padStart(4, '0').slice(-4);
}
  `.trim();

  // HARD puzzle code
  const hardRoom1Code = `
/** Deep-freeze an object recursively */
export function deepFreeze<T>(o: T): Readonly<T> {
  Object.freeze(o);
  for (const key in o as any) {
    const value = (o as any)[key];
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return o as Readonly<T>;
}
  `.trim();

  const hardRoom2Code = `
export function sumCurrency2dp(values: number[]): string {
  const cents = values.map((v) => Math.round(v * 100));
  const totalCents = cents.reduce((acc, v) => acc + v, 0);
  return (totalCents / 100).toFixed(2);
}
  `.trim();

  const hardRoom3Code = `
export function sieve(limit: number): number[] {
  const isPrime = new Uint8Array(limit + 1);
  isPrime.fill(1);
  const result: number[] = [];
  for (let p = 2; p * p <= limit; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= limit; m += p) {
        isPrime[m] = 0;
      }
    }
  }
  for (let i = 2; i <= limit; i++) {
    if (isPrime[i]) result.push(i);
  }
  return result;
}
  `.trim();

  const hardRoom4Code = `
export type Rec = { name: string; score: number; date: Date };
export function robustCsv(csv: string): Rec[] {
  let inQuotes = false;
  let current = "";
  const rows: string[] = [];

  for (const ch of csv) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      current += '\\t';
    } else {
      current += ch;
    }
  }

  const lines = current.trim().split("\\n");
  const headers = lines[0].split("\\t");
  return lines.slice(1).map((line) => {
    const [name, scoreStr, dateStr] = line.split("\\t");
    return {
      name,
      score: Number(scoreStr),
      date: new Date(dateStr),
    };
  });
}
  `.trim();

  const hardRoom5Code = `
export function hashLock(s: string): string {
  let h = 0;
  for (const ch of s) {
    h = (h * 131 + ch.charCodeAt(0)) % 1_000_000;
  }
  return h.toString().padStart(6, '0');
}
  `.trim();

  // Stage 6 code that satisfies all difficulties
  const room6Code = `
export function escape(config: { seed: string }): string {
  const seed = config.seed;
  if (seed && seed.length > 0) {
    return "ESCAPED";
  }
  return "ESCAPED";
}
  `.trim();

  async function solveRoom1(difficulty: 'easy' | 'medium' | 'hard') {
    // We assume we are already in a started run. Just connect puzzle and
    // wait for editor + EXECUTE.
    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    let code: string;
    let successText: string;

    if (difficulty === 'easy') {
      code = easyRoom1Code;
      successText =
        'Code formatted and readable. Panel accepts your function!';
    } else if (difficulty === 'medium') {
      code = mediumRoom1Code;
      successText = 'Token normalized.';
    } else {
      code = hardRoom1Code;
      successText = 'deepFreeze<T> formatted & typed.';
    }

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  async function solveRoom2(difficulty: 'easy' | 'medium' | 'hard') {
    await expect(
      page.getByRole('heading', { name: /Stage 2/ })
    ).toBeVisible({ timeout: 15000 });

    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    let code: string;
    let successText: string;

    if (difficulty === 'easy') {
      code = easyRoom2Code;
      successText =
        'You fixed the logic! The console returns the first even door id.';
    } else if (difficulty === 'medium') {
      code = mediumRoom2Code;
      successText = 'Stable average computed.';
    } else {
      code = hardRoom2Code;
      successText = 'Currency summed safely.';
    }

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  async function solveRoom3(difficulty: 'easy' | 'medium' | 'hard') {
    await expect(
      page.getByRole('heading', { name: /Stage 3/ })
    ).toBeVisible({ timeout: 15000 });

    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    let code: string;
    let successText: string;

    if (difficulty === 'easy') {
      code = easyRoom3Code;
      successText =
        'Loop looks correct — every integer from 0 to 1000 is generated.';
    } else if (difficulty === 'medium') {
      code = mediumRoom3Code;
      successText = 'Generator yields primes.';
    } else {
      code = hardRoom3Code;
      successText = 'Sieve implemented.';
    }

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  async function solveRoom4(difficulty: 'easy' | 'medium' | 'hard') {
    await expect(
      page.getByRole('heading', { name: /Stage 4/ })
    ).toBeVisible({ timeout: 15000 });

    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    let code: string;
    let successText: string;

    if (difficulty === 'easy') {
      code = easyRoom4Code;
      successText =
        'Nice! You are splitting CSV and mapping rows into objects.';
    } else if (difficulty === 'medium') {
      code = mediumRoom4Code;
      successText = 'TSV parsed & typed.';
    } else {
      code = hardRoom4Code;
      successText = 'Quoted CSV handled.';
    }

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  async function solveRoom5(difficulty: 'easy' | 'medium' | 'hard') {
    await expect(
      page.getByRole('heading', { name: /Stage 5/ })
    ).toBeVisible({ timeout: 15000 });

    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    let code: string;
    let successText: string;

    if (difficulty === 'easy') {
      code = easyRoom5Code;
      successText =
        'You computed the lock code correctly. The keypad glows green.';
    } else if (difficulty === 'medium') {
      code = mediumRoom5Code;
      successText = 'Base36 lock computed.';
    } else {
      code = hardRoom5Code;
      successText = 'Rolling hash accepted.';
    }

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  async function solveRoom6(difficulty: 'easy' | 'medium' | 'hard') {
    await expect(
      page.getByRole('heading', { name: /Stage 6/ })
    ).toBeVisible({ timeout: 15000 });

    await clickConnectPuzzle();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('button', { name: 'EXECUTE' })
    ).toBeVisible({ timeout: 15000 });

    const code = room6Code;
    const successText =
      difficulty === 'easy'
        ? 'Final check passed! The main exit door slides open — you escaped.'
        : difficulty === 'medium'
        ? 'Pipeline composed.'
        : 'Typed, pure orchestrator.';

    await textarea.fill(code);
    await page.getByRole('button', { name: 'EXECUTE' }).click();
    await expect(page.getByText(successText)).toBeVisible();
  }

  // --- EASY run ---
  await clickDifficultyButton(page, 'Easy');

  await solveRoom1('easy');
  await goNextRoom();

  await solveRoom2('easy');
  await goNextRoom();

  await solveRoom3('easy');
  await goNextRoom();

  await solveRoom4('easy');
  await goNextRoom();

  await solveRoom5('easy');
  await goNextRoom();

  await solveRoom6('easy');

  await expect(page.getByText('You escaped! 🎉')).toBeVisible();

  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(
    page.getByText('Coding Escape – Choose Difficulty')
  ).toBeVisible();

  // --- MEDIUM: Stage 1–3, save, leave, resume, finish ---
  await clickDifficultyButton(page, 'Medium');

  await solveRoom1('medium');
  await goNextRoom();

  await solveRoom2('medium');
  await goNextRoom();

  await solveRoom3('medium');

  await page.getByRole('button', { name: 'Save progress' }).click();
  await expect(
    page.getByText('Progress saved successfully.')
  ).toBeVisible();

  await page.goto('/');

  await page.goto('/escape-room');

  await expect(
    page.getByRole('button', { name: /Continue last run/ })
  ).toBeVisible();
  await page.getByRole('button', { name: /Continue last run/ }).click();

  await goNextRoom(); // to Stage 4
  await solveRoom4('medium');
  await goNextRoom();

  await solveRoom5('medium');
  await goNextRoom();

  await solveRoom6('medium');

  await expect(page.getByText('You escaped! 🎉')).toBeVisible();

  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(
    page.getByText('Coding Escape – Choose Difficulty')
  ).toBeVisible();

  // --- HARD: Stage 1–5, save, leave ---
  await clickDifficultyButton(page, 'Hard');

  await solveRoom1('hard');
  await goNextRoom();

  await solveRoom2('hard');
  await goNextRoom();

  await solveRoom3('hard');
  await goNextRoom();

  await solveRoom4('hard');
  await goNextRoom();

  await solveRoom5('hard');

  await page.getByRole('button', { name: 'Save progress' }).click();
  await expect(
    page.getByText('Progress saved successfully.')
  ).toBeVisible();

  await page.goto('/');

  // --- Re-enter, log out, log in, resume, finish, delete account ---
  await page.goto('/escape-room');

  await page.getByRole('button', { name: 'Log out' }).click();

  await expect(page.getByPlaceholder('Email')).toBeVisible();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText(displayName)).toBeVisible();

  const continueButton = page.getByRole('button', {
    name: /Continue last run/,
  });
  await expect(continueButton).toBeVisible();
  await continueButton.click();

  await goNextRoom(); // to Stage 6 (hard)
  await solveRoom6('hard');
  await expect(page.getByText('You escaped! 🎉')).toBeVisible();

  await page.goto('/escape-room');

  const dialogHandler = async (dialog: any) => {
    await dialog.accept();
  };
  page.on('dialog', dialogHandler);

  await page.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByPlaceholder('Email')).toBeVisible();

  page.off('dialog', dialogHandler);
});

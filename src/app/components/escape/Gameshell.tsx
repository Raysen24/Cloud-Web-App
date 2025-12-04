'use client';

import React, { useEffect, useMemo, useState } from 'react';
import DifficultySelect from './DifficultySelect';
import EndScreen from './EndScreen';
import SoundManager from './SoundManager';

type Difficulty = 'easy' | 'medium' | 'hard';

type RoomId =
  | 'room1'
  | 'room2'
  | 'room3'
  | 'room4'
  | 'room5'
  | 'room6';

type PuzzleType =
  | 'format'
  | 'debug'
  | 'generator'
  | 'csv2json'
  | 'lock'
  | 'final';

type RoomConfig = {
  id: RoomId;
  title: string;
  subtitle: string;
  hintSubtitle: string;
  puzzleType: PuzzleType;
  closedImage: string;
  openImage: string;
  hintImage: string;
  hotspots: {
    eye: { left: number; top: number };
    gear: { left: number; top: number };
    door: { left: number; top: number };
  };
};

type RoomState = {
  editorCode: string;
  consoleLines: string[];
  puzzleConnected: boolean;
};

// --- DIFFICULTY AWARE METADATA (titles, subtitles, hint text, puzzle family) ---
type DiffMeta = Record<
  Difficulty,
  Partial<Record<
    RoomId,
    Partial<Pick<RoomConfig, 'title' | 'subtitle' | 'hintSubtitle' | 'puzzleType'>>
  >>
>;

const DIFF_META: DiffMeta = {
  easy: {}, // keep your current text/logic
  medium: {
    room1: {
      title: 'Stage 1 – Normalize access token',
      subtitle:
        'Clean a messy token: uppercase hex, strip junk, group as 4-4-4.',
      hintSubtitle:
        'Pipeline: trim → toUpperCase → keep [0-9A-F] → chunk(4) → join("-").',
      puzzleType: 'format',
    },
    room2: {
      title: 'Stage 2 – Stable average (2dp)',
      subtitle:
        'Return mean rounded to 2 decimals without float drift.',
      hintSubtitle: 'Do Math.round(avg * 100) / 100.',
      puzzleType: 'debug',
    },
    room3: {
      title: 'Stage 3 – Prime generator (yield)',
      subtitle: 'Use function* and yield primes up to the limit.',
      hintSubtitle: 'Check divisors up to √n; use yield.',
      puzzleType: 'generator',
    },
    room4: {
      title: 'Stage 4 – TSV → JSON (typed)',
      subtitle:
        'Header row → { name, score:number, passed:boolean } objects.',
      hintSubtitle: 'Split by \\t; cast score:Number, passed:Boolean.',
      puzzleType: 'csv2json',
    },
    room5: {
      title: 'Stage 5 – Base36 lock',
      subtitle:
        'Sum char codes → base36 → upper → padStart(4) → last 4 chars.',
      hintSubtitle: 'sum→toString(36)→toUpperCase→pad→slice',
      puzzleType: 'lock',
    },
    room6: {
      title: 'Stage 6 – Compose clean helpers',
      subtitle: 'Pure, tiny helpers composed together; return ESCAPED.',
      hintSubtitle: 'No globals; simple composition is enough.',
      puzzleType: 'final',
    },
  },
  hard: {
    room1: {
      title: 'Stage 1 – deepFreeze<T> (format + types + docs)',
      subtitle:
        'Reformat & type a generic deepFreeze<T> with JSDoc.',
      hintSubtitle: 'Generic + Readonly<T> + short JSDoc.',
      puzzleType: 'format',
    },
    room2: {
      title: 'Stage 2 – Safe currency sum',
      subtitle:
        'Sum to 2dp accurately using cents (integers) or BigInt.',
      hintSubtitle: 'Map to cents; round; sum; /100; toFixed(2).',
      puzzleType: 'debug',
    },
    room3: {
      title: 'Stage 3 – Sieve up to 100000',
      subtitle: 'Eratosthenes sieve; start at p*p; fast.',
      hintSubtitle: 'Boolean/Uint8Array; mark multiples.',
      puzzleType: 'generator',
    },
    room4: {
      title: 'Stage 4 – Robust CSV parser (quoted)',
      subtitle:
        'Quoted fields, embedded commas, escaped quotes; typed mapping.',
      hintSubtitle: 'State machine inQuotes; trim; headers.',
      puzzleType: 'csv2json',
    },
    room5: {
      title: 'Stage 5 – Rolling hash lock (6 digits)',
      subtitle:
        'Base 131 rolling hash, mod 1e6, padStart(6).',
      hintSubtitle: 'h=(h*131+code)%1e6; padStart(6).',
      puzzleType: 'lock',
    },
    room6: {
      title: 'Stage 6 – Typed, pure orchestrator',
      subtitle:
        'Compose helpers; no side-effects; return ESCAPED.',
      hintSubtitle: 'Typed inputs; no DOM; pure.',
      puzzleType: 'final',
    },
  },
};

// Map difficulty → correct image path set
function imgPath(level: Difficulty, roomId: RoomId, kind: 'closed'|'open'|'hint'): string {
  const base = level === 'easy' ? '/escape' : `/escape/${level}`;
  // roomId like 'room3' -> "room3_closed.png"
  return `${base}/${roomId}_${kind}.png`;
}

// Merge base (easy) room with difficulty text + images
function resolveRoom(base: RoomConfig, level: Difficulty): RoomConfig {
  const over = (DIFF_META[level]?.[base.id]) ?? {};
  return {
    ...base,
    ...over,
    closedImage: imgPath(level, base.id, 'closed'),
    openImage:   imgPath(level, base.id, 'open'),
    hintImage:   imgPath(level, base.id, 'hint'),
  };
}

function themedIconPath(
  kind: 'eye' | 'gear' | 'door',
  level: Difficulty | null
): string {
  if (!level || level === 'easy') {
    // keep your current easy icons
    return `/escape/icon_${kind}.svg`;
  }
  const themeFolder = level === 'medium' ? 'purple' : 'red';
  return `/escape/icons/${themeFolder}/${kind}.svg`;
}

const ROOMS: RoomConfig[] = [
  {
    id: 'room1',
    title: 'Stage 1 – Format the code',
    subtitle: 'Make the messy function readable so the panel accepts it.',
    hintSubtitle:
      'Compare how the unformatted function on the left becomes readable on the right. Structure and whitespace matter.',
    puzzleType: 'format',
    closedImage: '/escape/room1_closed.png',
    openImage: '/escape/room1_open.png',
    hintImage: '/escape/room1_hint.png',
    hotspots: {
      eye: { left: 18, top: 38 },
      gear: { left: 48, top: 58 },
      door: { left: 80, top: 48 },
    },
  },
  {
    id: 'room2',
    title: 'Stage 2 – Debug the console',
    subtitle:
      'Fix the condition that decides whether a door id is valid or not.',
    hintSubtitle:
      'The hologram emphasises the difference between ODD and EVEN checks. Your code should return the first even id.',
    puzzleType: 'debug',
    closedImage: '/escape/room2_closed.png',
    openImage: '/escape/room2_open.png',
    hintImage: '/escape/room2_hint.png',
    hotspots: {
      eye: { left: 18, top: 30 },
      gear: { left: 48, top: 60 },
      door: { left: 82, top: 50 },
    },
  },
  {
    id: 'room3',
    title: 'Stage 3 – Generate 0 to 1000',
    subtitle: 'Write a loop that generates all integers from 0 to 1000.',
    hintSubtitle:
      'Start at 0 and stop when the counter reaches 1000. A classic for-loop is perfect here.',
    puzzleType: 'generator',
    closedImage: '/escape/room3_closed.png',
    openImage: '/escape/room3_open.png',
    hintImage: '/escape/room3_hint.png',
    hotspots: {
      eye: { left: 22, top: 35 },
      gear: { left: 48, top: 60 },
      door: { left: 80, top: 52 },
    },
  },
  {
    id: 'room4',
    title: 'Stage 4 – CSV to JSON',
    subtitle:
      'Port CSV data into an array of objects so the data gateway accepts it.',
    hintSubtitle:
      'Think in two steps: split the CSV into lines, then for each line split by comma and build { name, score } objects.',
    puzzleType: 'csv2json',
    closedImage: '/escape/room4_closed.png',
    openImage: '/escape/room4_open.png',
    hintImage: '/escape/room4_hint.png',
    hotspots: {
      eye: { left: 18, top: 38 },
      gear: { left: 48, top: 58 },
      door: { left: 80, top: 48 },
    },
  },
  {
    id: 'room5',
    title: 'Stage 5 – Compute the lock code',
    subtitle:
      'Derive a 4-digit code from an input string such as "LAB-451".',
    hintSubtitle:
      'Extract the numeric portion of the string. From there you can pad or re-order digits to match the lock rules.',
    puzzleType: 'lock',
    closedImage: '/escape/room5_closed.png',
    openImage: '/escape/room5_open.png',
    hintImage: '/escape/room5_hint.png',
    hotspots: {
      eye: { left: 22, top: 34 },
      gear: { left: 48, top: 58 },
      door: { left: 80, top: 53 },
    },
  },
  {
    id: 'room6',
    title: 'Stage 6 – Final escape system',
    subtitle:
      'Combine everything you’ve learned into one escape() function.',
    hintSubtitle:
      'Format, debug, loop, convert and unlock: all of the earlier skills feed into the final system.',
    puzzleType: 'final',
    closedImage: '/escape/room6_closed.png',
    openImage: '/escape/room6_open.png',
    hintImage: '/escape/room6_hint.png',
    hotspots: {
      eye: { left: 24, top: 36 },
      gear: { left: 50, top: 60 },
      door: { left: 80, top: 50 },
    },
  },
];

const difficultySettings: Record<
  Difficulty,
  { time: number; hints: number }
> = {
  easy: { time: 10 * 60, hints: 6 },
  medium: { time: 8 * 60, hints: 3 },
  hard: { time: 5 * 60, hints: 0 },
};

type ValidationResult = {
  ok: boolean;
  message: string;
  consoleLines: string[];
};

function validateCode(
  room: RoomConfig,
  code: string,
  difficulty: Difficulty
): ValidationResult {
  const t = code.trim();
  const has = (...snips: string[]) => snips.some((s) => t.includes(s));
  const all = (...snips: string[]) => snips.every((s) => t.includes(s));

  if (difficulty === 'medium') {
    switch (room.id) {
      case 'room1': {
        const ok =
          all('formatAccessToken') &&
          has('toUpperCase(') &&
          has('/[^0-9A-F]/g') &&
          has("match(/.{1,4}/g") &&
          has("join('-')");
        return ok
          ? {
              ok: true,
              message: 'Token normalized.',
              consoleLines: ['> normalize', 'OK ✅'],
            }
          : {
              ok: false,
              message:
                'Trim, uppercase, strip non-hex, group 4-4-4 with hyphens.',
              consoleLines: ['> normalize', 'Missing steps.'],
            };
      }
      case 'room2': {
        const ok = all('averageTwoDecimals', 'Math.round', '* 100', '/ 100');
        return ok
          ? {
              ok: true,
              message: 'Stable average computed.',
              consoleLines: ['> avg', '2dp ✅'],
            }
          : {
              ok: false,
              message: 'Use Math.round(avg*100)/100.',
              consoleLines: ['> avg', 'Unstable rounding.'],
            };
      }
      case 'room3': {
        const ok = all('function*', 'yield') && has('primesUpTo');
        return ok
          ? {
              ok: true,
              message: 'Generator yields primes.',
              consoleLines: ['> primes', 'Generator ✅'],
            }
          : {
              ok: false,
              message: 'Use function* and yield.',
              consoleLines: ['> primes', 'Not a generator.'],
            };
      }
      case 'room4': {
        const ok =
          all('tsvToJson', '\\t', 'headers') && has('Number(') && has("=== 'true'");
        return ok
          ? {
              ok: true,
              message: 'TSV parsed & typed.',
              consoleLines: ['> tsv', 'Typed ✅'],
            }
          : {
              ok: false,
              message:
                'Header row; split by \\t; cast score Number & passed Boolean.',
              consoleLines: ['> tsv', 'Missing conversions.'],
            };
      }
      case 'room5': {
        const ok =
          all('computeLockBase36', 'charCodeAt', 'toString(36)', 'toUpperCase') &&
          has('padStart(4');
        return ok
          ? {
              ok: true,
              message: 'Base36 lock computed.',
              consoleLines: ['> lock', 'OK ✅'],
            }
          : {
              ok: false,
              message: 'sum→base36→upper→pad4→last4.',
              consoleLines: ['> lock', 'Pipeline incomplete.'],
            };
      }
      case 'room6': {
        const ok = has('escape(') && t.toUpperCase().includes('ESCAPED');
        return ok
          ? {
              ok: true,
              message: 'Pipeline composed.',
              consoleLines: ['> escape', 'ESCAPED ✅'],
            }
          : {
              ok: false,
              message: 'Return "ESCAPED". Compose helpers (pure).',
              consoleLines: ['> escape', 'Missing token.'],
            };
      }
    }
  }

  if (difficulty === 'hard') {
    switch (room.id) {
      case 'room1': {
        const ok = all('deepFreeze<', '/**') && has('Readonly<');
        return ok
          ? {
              ok: true,
              message: 'deepFreeze<T> formatted & typed.',
              consoleLines: ['> lint', 'Types & docs ✅'],
            }
          : {
              ok: false,
              message: 'Use generics, Readonly<T>, and JSDoc.',
              consoleLines: ['> lint', 'Insufficient typing/docs.'],
            };
      }
      case 'room2': {
        const ok =
          (all('Math.round', '* 100', ' / 100') || has('BigInt')) &&
          has('toFixed(2)');
        return ok
          ? {
              ok: true,
              message: 'Currency summed safely.',
              consoleLines: ['> money', '2dp ✅'],
            }
          : {
              ok: false,
              message: 'Sum as cents (or BigInt) then toFixed(2).',
              consoleLines: ['> money', 'Float drift detected.'],
            };
      }
      case 'room3': {
        const ok =
          has('sieve(') &&
          (has('Uint8Array') || all('Array(', 'fill(')) &&
          has('p * p <=') &&
          has('+= p');
        return ok
          ? {
              ok: true,
              message: 'Sieve implemented.',
              consoleLines: ['> sieve', 'Fast ✅'],
            }
          : {
              ok: false,
              message: 'Use sieve: boolean array, start at p*p.',
              consoleLines: ['> sieve', 'Not sieve-like.'],
            };
      }
      case 'room4': {
        const ok =
          has('robustCsv') &&
          (has('inQuotes') || has('state')) &&
          has('trim(') &&
          has('headers') &&
          (has('Number(') || has('parseFloat')) &&
          has('new Date(');
        return ok
          ? {
              ok: true,
              message: 'Quoted CSV handled.',
              consoleLines: ['> csv', 'Quoted fields ✅'],
            }
          : {
              ok: false,
              message: 'State machine for quotes; trim; headers; type cast.',
              consoleLines: ['> csv', 'Quoted commas not handled.'],
            };
      }
      case 'room5': {
        const ok =
          has('hashLock') && has('* 131') && has('% 1_000_000') && has('padStart(6');
        return ok
          ? {
              ok: true,
              message: 'Rolling hash accepted.',
              consoleLines: ['> lock', '6 digits ✅'],
            }
          : {
              ok: false,
              message: 'Use base 131 rolling hash; mod 1e6; padStart(6).',
              consoleLines: ['> lock', 'Wrong scheme.'],
            };
      }
      case 'room6': {
        const ok =
          has('escape(') &&
          has(': { seed: string }') &&
          !has('window.') &&
          !has('document.') &&
          t.toUpperCase().includes('ESCAPED');
        return ok
          ? {
              ok: true,
              message: 'Typed, pure orchestrator.',
              consoleLines: ['> escape', 'All green ✅'],
            }
          : {
              ok: false,
              message:
                'Typed signature, pure (no DOM), return "ESCAPED".',
              consoleLines: ['> escape', 'Not pure/typed.'],
            };
      }
    }
  }

  // EASY = your original rules (unchanged)
  return ((): ValidationResult => {
    const trimmed = code.trim();
    switch (room.puzzleType) {
      case 'format': {
        const hasFunctionName = trimmed.includes('formatDoorCode');
        const hasNewlines = trimmed.split('\n').length >= 4;
        const hasBraces = trimmed.includes('{') && trimmed.includes('}');
        const hasReturn = trimmed.includes('return ');
        if (hasFunctionName && hasNewlines && hasBraces && hasReturn) {
          return {
            ok: true,
            message: 'Code formatted and readable. Panel accepts your function!',
            consoleLines: ['> lint formatDoorCode.ts', 'No issues found – nice formatting.', 'Door control: OK ✅'],
          };
        }
        return {
          ok: false,
          message:
            'Formatting not good enough. Keep the name formatDoorCode and use multiple lines with braces and a return.',
          consoleLines: ['> lint formatDoorCode.ts', 'Issues: missing newlines / braces or function name.'],
        };
      }
      case 'debug': {
        const hasEvenCheck = trimmed.includes('% 2 === 0') || trimmed.includes('%2===0');
        const hasLoop = trimmed.includes('for') || trimmed.includes('while');
        if (hasEvenCheck && hasLoop) {
          return {
            ok: true,
            message: 'You fixed the logic! The console returns the first even door id.',
            consoleLines: ['> run getFirstEvenDoorId([3,5,4,7])', 'Output: 4', 'Expected: 4 — tests passed ✅'],
          };
        }
        return {
          ok: false,
          message: 'The function should return the first even id. Use a loop and check ids[i] % 2 === 0.',
          consoleLines: ['> run getFirstEvenDoorId([3,5,4,7])', 'Output: ?? (still wrong)'],
        };
      }
      case 'generator': {
        const mentionsLoop = trimmed.includes('for') || trimmed.includes('while');
        const mentionsBounds = trimmed.includes('<= 1000') || trimmed.includes('<=1000');
        const mentionsStart = trimmed.includes('= 0') || trimmed.includes('=0');
        if (mentionsLoop && mentionsBounds && mentionsStart) {
          return {
            ok: true,
            message: 'Loop looks correct — every integer from 0 to 1000 is generated.',
            consoleLines: ['> run generateSequence()', 'Output length: 1001', 'First: 0, Last: 1000 — tests passed ✅'],
          };
        }
        return {
          ok: false,
          message: 'Hint: use a for-loop starting at 0 and continuing while i <= 1000.',
          consoleLines: ['> run generateSequence()', 'Tests failed — loop bounds or start index incorrect.'],
        };
      }
      case 'csv2json': {
        const usesSplit = trimmed.includes('.split(');
        const usesMap = trimmed.includes('.map(') || trimmed.includes('map(');
        const usesCurly = trimmed.includes('{') && trimmed.includes('}');
        if (usesSplit && usesMap && usesCurly) {
          return {
            ok: true,
            message: 'Nice! You are splitting CSV and mapping rows into objects.',
            consoleLines: ['> run parseCsv(csvText)', 'Parsed 3 records.', 'First: { name: "Alice", score: 98 } — tests passed ✅'],
          };
        }
        return {
          ok: false,
          message: 'Split the CSV into lines, then split each line by comma and build { name, score } objects in an array.',
          consoleLines: ['> run parseCsv(csvText)', 'Tests failed — missing split/map/object construction.'],
        };
      }
      case 'lock': {
        const hasFunctionName = trimmed.includes('computeLockCode');
        const expected =
          trimmed.includes('"LAB-451"') || trimmed.includes("'LAB-451'");
        const usesSliceOrSubstring =
          trimmed.includes('.slice') || trimmed.includes('.substring');
        if (hasFunctionName && expected && usesSliceOrSubstring) {
          return {
            ok: true,
            message: 'You computed the lock code correctly. The keypad glows green.',
            consoleLines: ['> run computeLockCode("LAB-451")', 'Output: "0451"', 'Door lock: ACCEPTED ✅'],
          };
        }
        return {
          ok: false,
          message:
            'Use the input string "LAB-451" and extract a 4-digit code using slice/substring and maybe padStart.',
          consoleLines: ['> run computeLockCode("LAB-451")', 'Door lock: REJECTED — code mismatch.'],
        };
      }
      case 'final': {
        const hasEscapeFn = trimmed.includes('escape');
        const returnsEscaped = trimmed.toUpperCase().includes('ESCAPED');
        if (hasEscapeFn && returnsEscaped) {
          return {
            ok: true,
            message: 'Final check passed! The main exit door slides open — you escaped.',
            consoleLines: ['> run escape()', 'Output: "ESCAPED"', 'All integration tests passed ✅'],
          };
        }
        return {
          ok: false,
          message: 'Write an escape() function that returns a string like "ESCAPED". The word ESCAPED must appear in your return value.',
          consoleLines: ['> run escape()', 'Tests failed — ensure escape() exists and returns "ESCAPED".'],
        };
      }
      default:
        return { ok: false, message: 'Unknown puzzle type.', consoleLines: ['No validator configured.'] };
    }
  })();
}

function hotspotStyle(leftPerc: number, topPerc: number, color = '#f8fafc'): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${leftPerc}%`,
    top: `${topPerc}%`,
    transform: 'translate(-50%, -50%)',
    borderRadius: 999,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'rgba(15,23,42,0.7)',
    border: `2px solid ${color}`,
    boxShadow: `0 0 10px ${color}88, 0 0 22px ${color}55`,
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
  };
}

function baseConsoleLines(): string[] {
  return [
    '// Click the eye icon in the room to view a holographic hint.',
    '// Then click the gear icon to connect the puzzle to this editor.',
  ];
}

function createInitialRoomStates(): Record<RoomId, RoomState> {
  const baseState: RoomState = {
    editorCode: '',
    consoleLines: baseConsoleLines(),
    puzzleConnected: false,
  };
  return {
    room1: { ...baseState },
    room2: { ...baseState },
    room3: { ...baseState },
    room4: { ...baseState },
    room5: { ...baseState },
    room6: { ...baseState },
  };
}

export default function GameShell() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [baseTime, setBaseTime] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(0);

  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [solvedRooms, setSolvedRooms] = useState<Record<RoomId, boolean>>(
    {} as Record<RoomId, boolean>
  );

  const [showHint, setShowHint] = useState(false);

  const [roomStates, setRoomStates] = useState<Record<RoomId, RoomState>>(
    () => createInitialRoomStates()
  );

  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const [muted, setMuted] = useState(false);
  const sound = useMemo(() => new SoundManager(), []);

  const [sessionRecorded, setSessionRecorded] = useState(false);
  const [activeSaveId, setActiveSaveId] = useState<number | null>(null); // NEW: which run we are updating

  const [codeTheme, setCodeTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const detect = () => {
      setCodeTheme(root.classList.contains('dark') ? 'dark' : 'light');
    };
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const baseRoom = ROOMS[currentRoomIndex];
  const currentRoom = useMemo(
    () => resolveRoom(baseRoom, (difficulty ?? 'easy') as Difficulty),
    [baseRoom, difficulty]
  );
  const currentState = roomStates[currentRoom.id];

  const solvedCount = ROOMS.filter((r) => solvedRooms[r.id]).length;
  const totalRooms = ROOMS.length;
  const gameFinished = solvedCount >= totalRooms || timeLeft <= 0;

  // NEW: start a completely fresh game
  function startNewGame(level: Difficulty) {
    const { time, hints } = difficultySettings[level];
    setDifficulty(level);
    setBaseTime(time);
    setTimeLeft(time);
    setHintsLeft(hints);
    setCurrentRoomIndex(0);
    setSolvedRooms({} as Record<RoomId, boolean>);
    setShowHint(false);
    setRoomStates(createInitialRoomStates());
    setLastMessage(null);
    setSessionRecorded(false);
    setActiveSaveId(null); // NEW: this will make the next save create a new run
  }

  // NEW: handle resume from saved state
    // NEW: handle resume from saved state
  function handleResume(save: any) {
    // Remember which run this is so future saves update it,
    // instead of creating a brand‑new row.
    if (save && typeof save.id === 'number') {
      setActiveSaveId(save.id);
    } else {
      setActiveSaveId(null);
    }

    const diff = (save.difficulty ?? 'easy') as Difficulty;
    const { time, hints } = difficultySettings[diff];

    // solved rooms
    const rawSolved = (save.solvedRooms || {}) as Record<string, boolean>;
    const mappedSolved: Record<RoomId, boolean> = {
      room1: !!rawSolved.room1,
      room2: !!rawSolved.room2,
      room3: !!rawSolved.room3,
      room4: !!rawSolved.room4,
      room5: !!rawSolved.room5,
      room6: !!rawSolved.room6,
    };

    // room states
    const fromServer = (save.roomStates || {}) as Record<
      string,
      Partial<RoomState>
    >;
    const base = createInitialRoomStates();
    const merged: Record<RoomId, RoomState> = {
      room1: {
        ...base.room1,
        ...(fromServer.room1 as any),
        consoleLines:
          (fromServer.room1?.consoleLines as string[] | undefined) ??
          base.room1.consoleLines,
      },
      // ... rest unchanged ...
      room2: {
        ...base.room2,
        ...(fromServer.room2 as any),
        consoleLines:
          (fromServer.room2?.consoleLines as string[] | undefined) ??
          base.room2.consoleLines,
      },
      room3: {
        ...base.room3,
        ...(fromServer.room3 as any),
        consoleLines:
          (fromServer.room3?.consoleLines as string[] | undefined) ??
          base.room3.consoleLines,
      },
      room4: {
        ...base.room4,
        ...(fromServer.room4 as any),
        consoleLines:
          (fromServer.room4?.consoleLines as string[] | undefined) ??
          base.room4.consoleLines,
      },
      room5: {
        ...base.room5,
        ...(fromServer.room5 as any),
        consoleLines:
          (fromServer.room5?.consoleLines as string[] | undefined) ??
          base.room5.consoleLines,
      },
      room6: {
        ...base.room6,
        ...(fromServer.room6 as any),
        consoleLines:
          (fromServer.room6?.consoleLines as string[] | undefined) ??
          base.room6.consoleLines,
      },
    };

    setDifficulty(diff);
    setBaseTime(time);
    setTimeLeft(
      typeof save.timeLeft === 'number' && save.timeLeft > 0
        ? save.timeLeft
        : time
    );
    setHintsLeft(hints); // if you want to persist hints, also store them
    setCurrentRoomIndex(save.currentRoom ?? 0);
    setSolvedRooms(mappedSolved);
    setRoomStates(merged);
    setShowHint(false);
    setSessionRecorded(false);
    setLastMessage('Resumed last run.');
  }

  // timer countdown
  useEffect(() => {
    if (!difficulty) return;
    if (gameFinished) return;

    const id = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          sound.playFail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [difficulty, gameFinished, sound]);

  // control audio based on mute + game running
  useEffect(() => {
    if (!difficulty) {
      sound.stopAmbient();
      return;
    }
    if (muted) {
      sound.mute();
    } else {
      sound.unmute();
      sound.playAmbient();
    }
  }, [difficulty, muted, sound]);

  // stop audio on unmount
  useEffect(() => {
    return () => {
      sound.stopAmbient();
      sound.mute();
    };
  }, [sound]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timePercent = baseTime
    ? Math.max(0, Math.min(100, (timeLeft / baseTime) * 100))
    : 0;

  function handleMuteToggle() {
    setMuted((prev) => !prev);
  }

  function handleEyeClick() {
    sound.playClick();
    setShowHint(true);
  }

  function getStarterCode(room: RoomConfig, level: Difficulty): string {
    if (level === 'medium') {
      switch (room.id) {
        case 'room1':
          return `export function formatAccessToken(input: string): string {
    // trim -> toUpperCase -> keep [0-9A-F] -> chunk(4) -> join('-')
    return "";
  }`;
        case 'room2':
          return `export function averageTwoDecimals(nums: number[]): number {
    // avg rounded to 2dp without float drift
    return 0;
  }`;
        case 'room3':
          return `export function* primesUpTo(limit: number): Generator<number> {
    // function* + yield primes ≤ limit
  }`;
        case 'room4':
          return `export type Row = { name: string; score: number; passed: boolean };
  export function tsvToJson(tsv: string): Row[] {
    // header row; split by \\t; cast score & passed
    return [];
  }`;
        case 'room5':
          return `export function computeLockBase36(s: string): string {
    // sum charCode -> toString(36) -> upper -> padStart(4) -> last 4
    return "";
  }`;
        case 'room6':
          return `export function escape(): string {
    // compose helpers (pure)
    return "ESCAPED";
  }`;
      }
    }

    if (level === 'hard') {
      switch (room.id) {
        case 'room1':
          return `/** Deep-freeze an object recursively */
  export function deepFreeze<T>(o:T): Readonly<T>{Object.freeze(o);for(const k in o){const v:(any)=(o as any)[k];if(v&&typeof v==="object"&&!Object.isFrozen(v))deepFreeze(v);}return o as Readonly<T>;}`;
        case 'room2':
          return `export function sumCurrency2dp(values: number[]): string {
    // use cents (Math.round(v*100)); then toFixed(2)
    return "0.00";
  }`;
        case 'room3':
          return `export function sieve(limit: number): number[] {
    // boolean/Uint8Array sieve; start at p*p
    return [];
  }`;
        case 'room4':
          return `export type Rec = { name: string; score: number; date: Date };
  export function robustCsv(csv: string): Rec[] {
    // state machine; quotes/commas; trim; headers; type cast
    return [];
  }`;
        case 'room5':
          return `export function hashLock(s: string): string {
    // rolling hash base 131, mod 1_000_000, padStart(6)
    return "";
  }`;
        case 'room6':
          return `export function escape(_config: { seed: string }): string {
    // typed, pure composition
    return "ESCAPED";
  }`;
      }
    }

    // Default: keep your Easy starter code
    switch (room.puzzleType) {
      case 'format':
        return `// TODO: make this function nicely formatted and readable.
  function formatDoorCode(){const doorId=[1,2,3,4].find((id)=>id===4);return doorId}`;
      case 'debug':
        return `// TODO: fix the logic so this returns the first even id.
  function getFirstEvenDoorId(ids) {
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] % 2 === 1) { // BUG: this should check for even
        return ids[i];
      }
    }
    return -1;
  }`;
      case 'generator':
        return `// TODO: generate all integers from 0 to 1000 (inclusive).
  function generateSequence() {
    const result: number[] = [];
    // write your loop here
    return result;
  }`;
      case 'csv2json':
        return `// TODO: convert CSV text into an array of { name, score } objects.
  function parseCsv(csvText: string) {
    // CSV example:
    // name,score
    // Alice,98
    // Bob,76
    const rows = csvText.trim().split("\\n");
    const result: { name: string; score: number }[] = [];
    // fill result
    return result;
  }`;
      case 'lock':
        return `// TODO: return a 4-digit code computed from the input string.
  function computeLockCode(input: string): string {
    // HINT: input might look like "LAB-451"
    // Use slice/substring and maybe padStart to build something like "0451".
    return "";
  }`;
      case 'final':
        return `// TODO: final escape function – combine ideas from the other rooms.
  function escape(): string {
    // Return a string that proves you are ready to escape.
    return "";
  }`;
      default:
        return '// No starter code for this room yet.';
    }
  }

  function connectPuzzle() {
    if (!currentRoom) return;
    sound.playClick();
    setRoomStates((prev) => ({
      ...prev,
      [currentRoom.id]: {
        ...prev[currentRoom.id],
        editorCode: getStarterCode(currentRoom, difficulty as Difficulty),
        puzzleConnected: true,
        consoleLines: [
          ...prev[currentRoom.id].consoleLines,
          '',
          `// Connected puzzle for ${currentRoom.title}`,
        ],
      },
    }));
    setLastMessage(`Connected puzzle for ${currentRoom.title}.`);
  }

  function handleGearClick() {
    connectPuzzle();
  }

  function runCode() {
    if (!currentRoom) return;
    sound.playClick();

    if (!currentState.puzzleConnected) {
      setRoomStates((prev) => ({
        ...prev,
        [currentRoom.id]: {
          ...prev[currentRoom.id],
          consoleLines: [
            ...prev[currentRoom.id].consoleLines,
            '',
            '// Connect the puzzle first (gear icon in the room).',
          ],
        },
      }));
      setLastMessage('Connect the puzzle first using the gear icon.');
      return;
    }

    const result = validateCode(currentRoom, currentState.editorCode, difficulty as Difficulty);
    setRoomStates((prev) => ({
      ...prev,
      [currentRoom.id]: {
        ...prev[currentRoom.id],
        consoleLines: [
          ...prev[currentRoom.id].consoleLines,
          '',
          `// Executing ${currentRoom.title}`,
          ...result.consoleLines,
        ],
      },
    }));
    setLastMessage(result.message);

    if (result.ok) {
      sound.playWin();
      setSolvedRooms((prev) => ({
        ...prev,
        [currentRoom.id]: true,
      }));
    } else {
      sound.playFail();
    }
  }

  function goNextRoom() {
    if (!currentRoom) return;
    if (!solvedRooms[currentRoom.id]) {
      setLastMessage('Solve the current puzzle before opening the door.');
      return;
    }
    sound.playClick();
    if (currentRoomIndex < ROOMS.length - 1) {
      const nextIndex = currentRoomIndex + 1;
      setCurrentRoomIndex(nextIndex);
      setLastMessage(null);
      setRoomStates((prev) => ({
        ...prev,
        [ROOMS[nextIndex].id]: {
          ...prev[ROOMS[nextIndex].id],
          consoleLines: [
            ...prev[ROOMS[nextIndex].id].consoleLines,
            '',
            `// Entered ${ROOMS[nextIndex].title}`,
            '// Use the eye icon for a hint; gear icon to connect puzzle.',
          ],
        },
      }));
    }
  }

  function goPreviousRoom() {
    if (currentRoomIndex === 0) return;
    sound.playClick();
    const prevIndex = currentRoomIndex - 1;
    setCurrentRoomIndex(prevIndex);
    setLastMessage(null);
  }

  function useHint() {
    if (hintsLeft <= 0) {
      setLastMessage('No hints left.');
      return;
    }
    setHintsLeft((prev) => prev - 1);
  }

  async function saveProgress() {
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          timeLeft,
          currentRoom: currentRoomIndex,
          solvedRooms,
          roomStates,
          saveId: activeSaveId, // NEW: tells backend whether to update or create
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setLastMessage('Log in to save your progress.');
        } else {
          setLastMessage('Failed to save progress.');
        }
        return;
      }

      // If this was a brand-new run, the server just created it and
      // returned its id. Capture it so subsequent saves update.
      const data = (await res.json()) as { id?: number };
      if (data && typeof data.id === 'number') {
        setActiveSaveId(data.id);
      }

      setLastMessage('Progress saved successfully.');
      setRoomStates((prev) => ({
        ...prev,
        [currentRoom.id]: {
          ...prev[currentRoom.id],
          consoleLines: [
            ...prev[currentRoom.id].consoleLines,
            '',
            '// Progress saved to server.',
          ],
        },
      }));
    } catch {
      setLastMessage('Error while saving progress.');
    }
  }

  // confirm before leaving page while game running
  useEffect(() => {
    if (!difficulty) return;

    const handler = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      )
        return;
      if (href === '/escape-room') return;

      const gameActive = timeLeft > 0 && solvedCount < totalRooms;
      if (!gameActive) {
        sound.stopAmbient();
        return;
      }

      const ok = window.confirm(
        'Leave the escape room and lose your current progress?'
      );
      if (!ok) {
        ev.preventDefault();
        ev.stopPropagation();
      } else {
        sound.stopAmbient();
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [difficulty, timeLeft, solvedCount, totalRooms, sound]);

  // record a session when user escapes – ONLY ONCE
    // record a session when user escapes – ONLY ONCE
  useEffect(() => {
    if (!difficulty) return;

    const allSolved = solvedCount >= totalRooms;
    if (!allSolved) return;
    if (timeLeft <= 0) return;
    if (sessionRecorded) return;

    const timeTaken = baseTime - timeLeft;
    setSessionRecorded(true);

    (async () => {
      try {
        // 1) Record leaderboard / session
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            difficulty,
            timeTaken,
          }),
        });

        // 2) Auto-save final state so it appears in run history
        await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            difficulty,
            timeLeft,
            currentRoom: currentRoomIndex,
            solvedRooms,
            roomStates,
            saveId: activeSaveId, // update existing run if present, or create a new one
          }),
        });
      } catch {
        // ignore errors here – leaderboard and history are "nice to have"
      }
    })();
  }, [
    solvedCount,
    totalRooms,
    timeLeft,
    baseTime,
    difficulty,
    sessionRecorded,
    currentRoomIndex,
    solvedRooms,
    roomStates,
    activeSaveId,
  ]);

  // ---------- RENDER ----------

  if (!difficulty) {
    return (
      <div className="escape-root">
        <DifficultySelect
          onSelect={startNewGame}
          onResume={handleResume}
        />
      </div>
    );
  }

  const codeBg = codeTheme === 'dark' ? '#020617' : '#f9fafb';
  const codeFg = codeTheme === 'dark' ? '#e5e7eb' : '#0f172a';
  const consoleBg = codeTheme === 'dark' ? '#020617' : '#f3f4f6';
  
  const hotspotColor =
    !difficulty || difficulty === 'easy'
      ? 'rgba(248,250,252,0.9)' // original
      : difficulty === 'medium'
      ? '#c084fc' // purple glow
      : '#f87171'; // red glow

  return (
    <div className="escape-root">
      {/* Header / HUD */}
      <header className="escape-hud">
        <div>
          <strong>Coding Escape · {currentRoom.title}</strong>
          <div className="escape-meta">
            Room {currentRoomIndex + 1} of {ROOMS.length} · Difficulty:{' '}
            {difficulty}
          </div>
          <div className="escape-meta">Hints left: {hintsLeft}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {currentRoomIndex > 0 && (
            <button
              type="button"
              onClick={goPreviousRoom}
              className="escape-btn-secondary"
            >
              ← Previous room
            </button>
          )}
          <button
            type="button"
            onClick={handleMuteToggle}
            className="escape-btn-secondary"
          >
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        <div className="escape-timer">
          <div className="escape-meta">Time left</div>
          <div className="escape-timer-label">
            {minutes}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="escape-timer-bar">
            <div
              className="escape-timer-fill"
              style={{
                width: `${timePercent}%`,
                background: timeLeft < 30 ? '#ef4444' : '#22c55e',
              }}
            />
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="escape-main">
        {/* LEFT – room view */}
        <section className="escape-room-card hud-card">
          <img
            src={
              solvedRooms[currentRoom.id]
                ? currentRoom.openImage
                : currentRoom.closedImage
            }
            alt={currentRoom.title}
            className="escape-room-image"
          />

          <div className="hud-scanlines" />

          {/* Eye hotspot */}
          <button
            type="button"
            onClick={() => {
              handleEyeClick();
              if (hintsLeft > 0) useHint();
            }}
            style={hotspotStyle(
              currentRoom.hotspots.eye.left,
              currentRoom.hotspots.eye.top,
              hotspotColor
            )}
            aria-label="Hint"
          >
            <img
              src={themedIconPath('eye', difficulty)}
              alt="Hint"
              className="escape-hotspot-icon"
            />
          </button>

          {/* Gear hotspot */}
          <button
            type="button"
            onClick={handleGearClick}
            style={hotspotStyle(
              currentRoom.hotspots.gear.left,
              currentRoom.hotspots.gear.top,
              hotspotColor
            )}
            aria-label="Connect puzzle"
          >
            <img
              src={themedIconPath('gear', difficulty)}
              alt="Puzzle"
              className="escape-hotspot-icon"
            />
          </button>

          {/* Door hotspot */}
          <button
            type="button"
            onClick={goNextRoom}
            style={{
              ...hotspotStyle(
                currentRoom.hotspots.door.left,
                currentRoom.hotspots.door.top,
                hotspotColor
              ),
              opacity: solvedRooms[currentRoom.id] ? 1 : 0.35,
            }}
            aria-label="Next room"
          >
            <img
              src={themedIconPath('door', difficulty)}
              alt="Open door"
              className="escape-hotspot-icon"
            />
          </button>

          {/* Progress HUD */}
          <div className="escape-progress-pill">
            Progress: {solvedCount}/{totalRooms}
          </div>
        </section>

        {/* RIGHT – code editor & console */}
        <section className="escape-editor-card hud-card">
          <header className="escape-editor-header">
            <h2>{currentRoom.title}</h2>
            <p>{currentRoom.subtitle}</p>
          </header>

          <div className="escape-editor-status">
            {currentState.puzzleConnected ? (
              <span>
                Puzzle connected. Edit the code and click{' '}
                <strong>EXECUTE</strong>.
              </span>
            ) : (
              <span>
                Puzzle not connected. Click the{' '}
                <strong>gear icon</strong> in the room to load starter
                code.
              </span>
            )}
          </div>

          <div className="escape-editor-flex">
            {/* Code editor */}
            <div
              className="escape-code-wrapper"
              style={{ background: codeBg, color: codeFg }}
            >
              <div className="escape-code-header">
                <span>
                  {currentRoom.id}.ts ·{' '}
                  <span className="escape-code-theme">
                    {codeTheme} theme
                  </span>
                </span>
                <span className="escape-meta">
                  press EXECUTE to run tests
                </span>
              </div>
              <textarea
                value={currentState.editorCode}
                onChange={(e) => {
                  const value = e.target.value;
                  setRoomStates((prev) => ({
                    ...prev,
                    [currentRoom.id]: {
                      ...prev[currentRoom.id],
                      editorCode: value,
                    },
                  }));
                }}
                className="escape-code-textarea"
                spellCheck={false}
              />
              <div className="hud-scanlines" />
            </div>

            {/* Controls */}
            <div className="escape-controls-row">
              <div className="escape-controls-left">
                {!currentState.puzzleConnected && (
                  <button
                    type="button"
                    onClick={connectPuzzle}
                    className="escape-btn-secondary"
                  >
                    Connect puzzle
                  </button>
                )}
                <button
                  type="button"
                  onClick={runCode}
                  className="escape-btn-primary"
                  disabled={gameFinished}
                >
                  EXECUTE
                </button>
                <button
                  type="button"
                  onClick={saveProgress}
                  className="escape-btn-secondary"
                  disabled={gameFinished}
                >
                  Save progress
                </button>
              </div>
              <div className="escape-meta" style={{ textAlign: 'right' }}>
                Door will open when tests pass.
              </div>
            </div>

            {/* Console output */}
            <div
              className="escape-console"
              style={{
                background: consoleBg,
                color: codeTheme === 'dark' ? '#e5e7eb' : '#111827',
              }}
            >
              {currentState.consoleLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
              <div className="hud-scanlines" />
            </div>

            {lastMessage && (
              <div className="escape-last-message">{lastMessage}</div>
            )}
          </div>
        </section>
      </main>

      {/* Hint overlay */}
      {showHint && (
        <div
          className="escape-hint-overlay"
          onClick={() => setShowHint(false)}
        >
          <div
            className="escape-hint-card hud-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="escape-hint-header">
              <h3>Hint · {currentRoom.title}</h3>
              <button
                type="button"
                onClick={() => setShowHint(false)}
                className="escape-btn-circle"
                aria-label="Close hint"
              >
                ✕
              </button>
            </div>
            <p className="escape-meta">{currentRoom.hintSubtitle}</p>
            <div className="escape-hint-image-wrapper">
              <img
                src={currentRoom.hintImage}
                alt={`Hint for ${currentRoom.title}`}
                className="escape-hint-image"
              />
              <div className="hud-scanlines" />
            </div>
            <p className="escape-meta">
              Use this hologram as guidance, then edit your code in the
              right-hand editor and press EXECUTE.
            </p>
          </div>
        </div>
      )}

      {/* End game overlay */}
      {gameFinished && (
        <EndScreen
          success={solvedCount >= totalRooms}
          timeTaken={
            solvedCount >= totalRooms ? baseTime - timeLeft : baseTime
          }
        />
      )}
    </div>
  );
}

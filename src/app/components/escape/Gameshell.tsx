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
  easy: { time: 20 * 60, hints: 6 },
  medium: { time: 15 * 60, hints: 3 },
  hard: { time: 10 * 60, hints: 0 },
};

type ValidationResult = {
  ok: boolean;
  message: string;
  consoleLines: string[];
};

function validateCode(
  room: RoomConfig,
  code: string
): ValidationResult {
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
          message:
            'Code formatted and readable. Panel accepts your function!',
          consoleLines: [
            '> lint formatDoorCode.ts',
            'No issues found – nice formatting.',
            'Door control: OK ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'Formatting not good enough. Keep the name formatDoorCode and use multiple lines with braces and a return.',
        consoleLines: [
          '> lint formatDoorCode.ts',
          'Issues: missing newlines / braces or function name.',
        ],
      };
    }

    case 'debug': {
      const hasEvenCheck =
        trimmed.includes('% 2 === 0') || trimmed.includes('%2===0');
      const hasLoop =
        trimmed.includes('for') || trimmed.includes('while');

      if (hasEvenCheck && hasLoop) {
        return {
          ok: true,
          message:
            'You fixed the logic! The console returns the first even door id.',
          consoleLines: [
            '> run getFirstEvenDoorId([3,5,4,7])',
            'Output: 4',
            'Expected: 4 — tests passed ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'The function should return the first even id. Use a loop and check ids[i] % 2 === 0.',
        consoleLines: [
          '> run getFirstEvenDoorId([3,5,4,7])',
          'Output: ?? (still wrong)',
        ],
      };
    }

    case 'generator': {
      const mentionsLoop =
        trimmed.includes('for') || trimmed.includes('while');
      const mentionsBounds =
        trimmed.includes('<= 1000') || trimmed.includes('<=1000');
      const mentionsStart =
        trimmed.includes('= 0') || trimmed.includes('=0');

      if (mentionsLoop && mentionsBounds && mentionsStart) {
        return {
          ok: true,
          message:
            'Loop looks correct — every integer from 0 to 1000 is generated.',
          consoleLines: [
            '> run generateSequence()',
            'Output length: 1001',
            'First: 0, Last: 1000 — tests passed ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'Hint: use a for-loop starting at 0 and continuing while i <= 1000.',
        consoleLines: [
          '> run generateSequence()',
          'Tests failed — loop bounds or start index incorrect.',
        ],
      };
    }

    case 'csv2json': {
      const usesSplit = trimmed.includes('.split(');
      const usesMap = trimmed.includes('.map(') || trimmed.includes('map(');
      const usesCurly = trimmed.includes('{') && trimmed.includes('}');

      if (usesSplit && usesMap && usesCurly) {
        return {
          ok: true,
          message:
            'Nice! You are splitting CSV and mapping rows into objects.',
          consoleLines: [
            '> run parseCsv(csvText)',
            'Parsed 3 records.',
            'First: { name: "Alice", score: 98 } — tests passed ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'Split the CSV into lines, then split each line by comma and build { name, score } objects in an array.',
        consoleLines: [
          '> run parseCsv(csvText)',
          'Tests failed — missing split/map/object construction.',
        ],
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
          message:
            'You computed the lock code correctly. The keypad glows green.',
          consoleLines: [
            '> run computeLockCode("LAB-451")',
            'Output: "0451"',
            'Door lock: ACCEPTED ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'Use the input string "LAB-451" and extract a 4-digit code using slice/substring and maybe padStart.',
        consoleLines: [
          '> run computeLockCode("LAB-451")',
          'Door lock: REJECTED — code mismatch.',
        ],
      };
    }

    case 'final': {
      // Require a real escape() implementation that returns "ESCAPED"
      const hasEscapeFn = trimmed.includes('escape');
      const returnsEscaped = trimmed.toUpperCase().includes('ESCAPED');

      if (hasEscapeFn && returnsEscaped) {
        return {
          ok: true,
          message:
            'Final check passed! The main exit door slides open — you escaped.',
          consoleLines: [
            '> run escape()',
            'Output: "ESCAPED"',
            'All integration tests passed ✅',
          ],
        };
      }
      return {
        ok: false,
        message:
          'Write an escape() function that returns a string like "ESCAPED". The word ESCAPED must appear in your return value.',
        consoleLines: [
          '> run escape()',
          'Tests failed — ensure escape() exists and returns "ESCAPED".',
        ],
      };
    }

    default:
      return {
        ok: false,
        message: 'Unknown puzzle type.',
        consoleLines: ['No validator configured.'],
      };
  }
}

function hotspotStyle(
  leftPerc: number,
  topPerc: number
): React.CSSProperties {
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
    border: '2px solid rgba(248,250,252,0.9)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
    transition: 'transform 0.12s ease, box-shadow 0.12s ease',
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

  const [editorCode, setEditorCode] = useState('');
  const [puzzleConnected, setPuzzleConnected] = useState(false);
  const [consoleLines, setConsoleLines] = useState<string[]>([
    '// Click the eye icon in the room to view a holographic hint.',
    '// Then click the gear icon to connect the puzzle to this editor.',
  ]);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const [muted, setMuted] = useState(false);
  const sound = useMemo(() => new SoundManager(), []);

  // theme detection to match your global light/dark mode
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

  // initialise game when difficulty selected
  useEffect(() => {
    if (!difficulty) return;
    const { time, hints } = difficultySettings[difficulty];
    setTimeLeft(time);
    setBaseTime(time);
    setHintsLeft(hints);
    setCurrentRoomIndex(0);
    setSolvedRooms({} as Record<RoomId, boolean>);
    setShowHint(false);
    setPuzzleConnected(false);
    setEditorCode('');
    setConsoleLines([
      '// Welcome to Coding Escape.',
      '// Use the holographic icons in the room to find clues and connect puzzles.',
    ]);
    setLastMessage(null);
  }, [difficulty]);

  // timer countdown
  useEffect(() => {
    if (!difficulty) return;
    if (timeLeft <= 0) return;

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
  }, [difficulty, timeLeft, sound]);

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

  const currentRoom = ROOMS[currentRoomIndex];
  const solvedCount = ROOMS.filter((r) => solvedRooms[r.id]).length;
  const totalRooms = ROOMS.length;

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

  function connectPuzzle() {
    if (!currentRoom) return;
    setPuzzleConnected(true);
    const starter = getStarterCode(currentRoom);
    setEditorCode(starter);
    setConsoleLines((prev) => [
      ...prev,
      '',
      `// Connected puzzle for ${currentRoom.title}`,
    ]);
  }

  function handleGearClick() {
    sound.playClick();
    connectPuzzle();
  }

  function getStarterCode(room: RoomConfig): string {
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
  // You have formatted code, debugged logic, generated ranges,
  // converted CSV to JSON, and computed a lock code.
  // Return a string that proves you are ready to escape.
  return "";
}`;
      default:
        return '// No starter code for this room yet.';
    }
  }

  function runCode() {
    if (!currentRoom) return;
    sound.playClick();

    if (!puzzleConnected) {
      setConsoleLines((prev) => [
        ...prev,
        '',
        '// Connect the puzzle first (gear icon in the room).',
      ]);
      setLastMessage('Connect the puzzle first using the gear icon.');
      return;
    }

    const result = validateCode(currentRoom, editorCode);
    setConsoleLines((prev) => [
      ...prev,
      '',
      `// Executing ${currentRoom.title}`,
      ...result.consoleLines,
    ]);
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
      setPuzzleConnected(false);
      setEditorCode('');
      setLastMessage(null);
      setConsoleLines((prev) => [
        ...prev,
        '',
        `// Entered ${ROOMS[nextIndex].title}`,
        '// Use the eye icon for a hint; gear icon to connect puzzle.',
      ]);
    }
  }

  function useHint() {
    if (hintsLeft <= 0) {
      setLastMessage('No hints left.');
      return;
    }
    setHintsLeft((prev) => prev - 1);
  }

  // confirm before leaving the page via links (Home, other tabs) while game running
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
        // game already over, just stop audio
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

  // ---------- RENDER ----------

  if (!difficulty) {
    // keep inside escape-root so your top bar still shows
    return (
      <div className="escape-root">
        <DifficultySelect onSelect={setDifficulty} />
      </div>
    );
  }

  const codeBg = codeTheme === 'dark' ? '#020617' : '#f9fafb';
  const codeFg = codeTheme === 'dark' ? '#e5e7eb' : '#0f172a';
  const consoleBg = codeTheme === 'dark' ? '#020617' : '#f3f4f6';

  const gameFinished = solvedCount >= totalRooms || timeLeft <= 0;

  return (
    <div className="escape-root">
      {/* Header / HUD */}
      <header className="escape-hud">
        <div>
          <strong>
            Coding Escape · {currentRoom.title}
          </strong>
          <div className="escape-meta">
            Room {currentRoomIndex + 1} of {ROOMS.length} · Difficulty:{' '}
            {difficulty}
          </div>
          <div className="escape-meta">Hints left: {hintsLeft}</div>
        </div>

        <div>
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
              currentRoom.hotspots.eye.top
            )}
            aria-label="Hint"
          >
            <img
              src="/escape/icon_eye.svg"
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
              currentRoom.hotspots.gear.top
            )}
            aria-label="Connect puzzle"
          >
            <img
              src="/escape/icon_gear.svg"
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
                currentRoom.hotspots.door.top
              ),
              opacity: solvedRooms[currentRoom.id] ? 1 : 0.35,
            }}
            aria-label="Next room"
          >
            <img
              src="/escape/icon_door.svg"
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
            {puzzleConnected ? (
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
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                className="escape-code-textarea"
                spellCheck={false}
              />
              <div className="hud-scanlines" />
            </div>

            {/* Controls */}
            <div className="escape-controls-row">
              <div className="escape-controls-left">
                {!puzzleConnected && (
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
              {consoleLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
              <div className="hud-scanlines" />
            </div>

            {lastMessage && (
              <div className="escape-last-message">
                {lastMessage}
              </div>
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

      {/* End game overlay (popup, not full screen) */}
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

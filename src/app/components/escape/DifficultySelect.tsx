'use client';
import { url } from 'inspector';
import React from 'react';

type Props = {
  onSelect: (lvl: 'easy' | 'medium' | 'hard') => void;
};

export default function DifficultySelect({ onSelect }: Props) {
  return (
    <div
      style={{
        position: 'absolute',          // only inside escape-root, top bar still works
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        pointerEvents: 'auto',
        backgroundImage: 'url(/escape/escape_root_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // backgroundColor: '#020617',
      }}
    >
      {/* Outer card with background image + rounded corners */}
      <div
        style={{
          width: '100%',
          maxWidth: 1120,
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 80px rgba(15,23,42,0.9)',
          // backgroundImage: 'url(/escape/room1_closed.png)', // 🔹 use your sci-fi image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // border: '10px solid red',
        }}
      >
        {/* Dark gradient overlay so text is readable */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '36px 40px 32px',
            backdropFilter: 'blur(3px)',
            background: 
            ' linear-gradient(90deg,rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.6)',
            // background:
            //   'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.8))',
            // border: '10px solid blue',
            border: '1px solid rgba(59, 130, 246, 0.55)',
            // box-shadow:
            //   '0 0 0 1px rgba(15, 23, 42, 0.9),
            //   0 0 30px rgba(37, 99, 235, 0.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 32,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              color: '#e5e7eb',
              // border: '10px solid red',
            }}
          >
            {/* LEFT: title + difficulty buttons */}
            <div style={{ flex: '1 1 260px', minWidth: 260 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                Coding Escape – Choose Difficulty
              </h1>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 20,
                  fontSize: 14,
                  maxWidth: 460,
                  opacity: 0.9,
                }}
              >
                Solve coding puzzles to escape 6 futuristic rooms before the
                timer hits zero. Each difficulty sets your total time and number
                of hints.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginBottom: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelect('easy')}
                  style={btnPrimary}
                >
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => onSelect('medium')}
                  style={btnPrimary}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => onSelect('hard')}
                  style={btnPrimary}
                >
                  Hard
                </button>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  opacity: 0.85,
                }}
              >
                Easy gives more time and hints; hard gives less time and no
                hints.
              </p>
            </div>

            {/* RIGHT: How to play */}
            <div
              style={{
                flex: '1 1 260px',
                minWidth: 260,
                padding: '8px 12px',
                borderRadius: 18,
                background: 'rgba(15,23,42,0.9)',
                border: '1px solid rgba(148,163,184,0.6)',
                fontSize: 13,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: 6,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                How to Play
              </h2>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  listStyleType: 'disc',
                  lineHeight: 1.5,
                }}
              >
                <li>
                  <strong>Select a difficulty</strong> above. This sets your
                  total time and how many hints you can use.
                </li>
                <li>
                  You start in <strong>Room 1</strong>. Each room has a puzzle
                  on the right and an interactive scene on the left.
                </li>
                <li>
                  Click the <strong>eye icon</strong> in the room to open a
                  holographic <em>hint screen</em>.
                </li>
                <li>
                  Click the <strong>gear icon</strong> to{' '}
                  <em>connect the puzzle</em> and load starter code into the
                  editor.
                </li>
                <li>
                  Edit the code in the editor, then press{' '}
                  <strong>EXECUTE</strong> to run tests. The console below shows
                  feedback.
                </li>
                <li>
                  When tests pass, the <strong>door icon</strong> becomes
                  active — click it to enter the next room.
                </li>
                <li>
                  If the timer reaches zero, you lose. Solve all 6 rooms before
                  time runs out to <strong>escape</strong>.
                </li>
              </ul>
              <p
                style={{
                  marginTop: 8,
                  marginBottom: 0,
                  fontSize: 12,
                  opacity: 0.9,
                }}
              >
                Tip: Hard mode disables hints. Try Easy first to learn the room
                mechanics, then come back on Hard.
              </p>
            </div>
          </div>
        </div>

        {/* optional scanline overlay if you use .hud-scanlines */}
        <div className="hud-scanlines" />
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 22px',
  background: '#2563eb',
  color: '#f9fafb',
  border: 'none',
  borderRadius: 999,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 600,
  boxShadow: '0 10px 30px rgba(15,23,42,0.9)',
  transition: 'transform .12s ease, box-shadow .12s ease, background .12s',
};

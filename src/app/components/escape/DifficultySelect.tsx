'use client';

import React, { useEffect, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

type Props = {
  onSelect: (lvl: Difficulty) => void;
  onResume?: (save: ResumeSave) => void;
};

type User = {
  id: number;
  email: string;
  displayName: string;
};

type LeaderboardRow = {
  rank: number;
  player: string;
  timeTaken: number;
  finishedAt: string;
};

type RoomStateLite = {
  editorCode: string;
  consoleLines: string[];
  puzzleConnected?: boolean;
};

type ResumeSave = {
  id: number;
  difficulty: Difficulty;
  timeLeft: number;
  currentRoom: number;
  solvedRooms: Record<string, boolean>;
  roomStates?: Record<string, RoomStateLite>;
};

type SaveHistoryItem = {
  id: number;
  difficulty: Difficulty;
  timeLeft: number;
  currentRoom: number;
  solvedRooms: Record<string, boolean>;
  roomStates?: Record<string, RoomStateLite>;
  createdAt: string;
};

export default function DifficultySelect({ onSelect, onResume }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const [boardDifficulty, setBoardDifficulty] =
    useState<Difficulty>('easy');
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);

  const [resumeSave, setResumeSave] = useState<ResumeSave | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // history modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<SaveHistoryItem[]>([]);
  const [selectedSave, setSelectedSave] = useState<SaveHistoryItem | null>(
    null
  );

  // ----- load current user -----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.id) setUser(data);
      } catch {
        // ignore
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // ----- load leaderboard whenever boardDifficulty changes -----
  useEffect(() => {
    (async () => {
      try {
        setBoardLoading(true);
        const res = await fetch(
          `/api/leaderboard?difficulty=${boardDifficulty}`,
          { cache: 'no-store' }
        );
        if (!res.ok) {
          setLeaderboard([]);
          return;
        }
        const data = await res.json();
        setLeaderboard(data.leaderboard ?? []);
      } catch {
        setLeaderboard([]);
      } finally {
        setBoardLoading(false);
      }
    })();
  }, [boardDifficulty]);

  // ----- load latest save when a user is logged in -----
  useEffect(() => {
    if (!user) {
      setResumeSave(null);
      return;
    }
    (async () => {
      try {
        setResumeLoading(true);
        const res = await fetch('/api/save/latest', {
          cache: 'no-store',
        });
        if (!res.ok) {
          setResumeSave(null);
          return;
        }
        const data = await res.json();
        if (data && data.save) {
          setResumeSave({
            ...data.save,
            difficulty: data.save.difficulty as Difficulty,
          });
        } else {
          setResumeSave(null);
        }
      } catch {
        setResumeSave(null);
      } finally {
        setResumeLoading(false);
      }
    })();
  }, [user]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error ?? 'Registration failed');
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data);
    } else {
      const err = await res.json().catch(() => null);
      alert(err?.error ?? 'Login failed');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setResumeSave(null);
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        'This will delete your account, saved progress and leaderboard scores. Continue?'
      )
    ) {
      return;
    }
    const res = await fetch('/api/users/me', { method: 'DELETE' });
    if (res.ok) {
      setUser(null);
      setResumeSave(null);
      alert('Account deleted.');
    } else {
      alert('Failed to delete account.');
    }
  }

  async function openHistory() {
    if (!user) {
      alert('Log in to view your history.');
      return;
    }
    setHistoryOpen(true);
    setHistoryLoading(true);
    setSelectedSave(null);
    try {
      const res = await fetch('/api/save/history', { cache: 'no-store' });
      if (!res.ok) {
        setHistoryItems([]);
        return;
      }
      const data = await res.json();
      setHistoryItems(
        (data.history ?? []).map((item: any) => ({
          ...item,
          difficulty: item.difficulty as Difficulty,
        }))
      );
    } catch {
      setHistoryItems([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleResumeClick() {
    if (resumeSave) {
      onResume?.(resumeSave);   // send data only
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        pointerEvents: 'auto',
        backgroundImage: 'url(/escape/escape_root_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* dark overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '32px 40px 28px',
            backdropFilter: 'blur(3px)',
            background:
              'linear-gradient(90deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.6))',
            color: '#e5e7eb',
            border: '1px solid rgba(59, 130, 246, 0.55)',
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
            }}
          >
            {/* LEFT: title + difficulty */}
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>
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
                timer hits zero. Each difficulty sets your total time and
                number of hints.
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

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid rgba(148,163,184,0.5)',
                  margin: '18px 0 12px',
                }}
              />

              <h3
                style={{
                  margin: 0,
                  fontSize: 15,
                  marginBottom: 6,
                }}
              >
                How to play
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  listStyleType: 'disc',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <li>
                  Select a difficulty. This sets the timer and number of hints.
                </li>
                <li>
                  Each room has <strong>eye</strong> and <strong>gear</strong>{' '}
                  icons. Eye shows a hint; gear connects the puzzle to the
                  code editor.
                </li>
                <li>
                  Edit the code on the right and press <strong>EXECUTE</strong>{' '}
                  to run tests. If tests pass, the door unlocks.
                </li>
                <li>
                  Click the <strong>door</strong> icon to advance to the next
                  room.
                </li>
                <li>
                  Escape all 6 rooms before the timer reaches zero.
                </li>
              </ul>
            </div>

            {/* RIGHT: auth + leaderboard + history */}
            <div
              style={{
                flex: '1 1 320px',
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* AUTH CARD */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 18,
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(148,163,184,0.7)',
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                    gap: 8,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 14,
                    }}
                  >
                    Account
                  </h2>
                  {user && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        style={smallOutlineButton}
                      >
                        Log out
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        style={{
                          ...smallOutlineButton,
                          borderColor: '#f97373',
                          color: '#fecaca',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {authLoading ? (
                  <div>Checking session…</div>
                ) : user ? (
                  <div>
                    <div>
                      <strong>{user.displayName}</strong>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      {user.email}
                    </div>
                    <p
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        opacity: 0.85,
                      }}
                    >
                      Your game progress and best escape times will be saved
                      under this account.
                    </p>

                    {resumeLoading ? (
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: 4,
                        }}
                      >
                        Checking for saved run…
                      </div>
                    ) : resumeSave ? (
                      <button
                        type="button"
                        onClick={() => onResume?.(resumeSave)}
                        style={{
                          marginTop: 6,
                          padding: '6px 10px',
                          borderRadius: 999,
                          border: 'none',
                          background: '#22c55e',
                          color: '#022c22',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Continue last run (room {resumeSave.currentRoom + 1},{' '}
                        {resumeSave.difficulty})
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginTop: 4,
                        }}
                      >
                        No saved run yet. Start a new game and click “Save
                        progress” in the editor.
                      </div>
                    )}

                    {/* History button */}
                    <button
                      type="button"
                      onClick={openHistory}
                      style={{
                        marginTop: 8,
                        padding: '6px 10px',
                        borderRadius: 999,
                        border: '1px solid rgba(148,163,184,0.9)',
                        background: 'transparent',
                        color: '#e5e7eb',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      View run history
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={
                      mode === 'login' ? handleLogin : handleRegister
                    }
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      style={inputStyle}
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      style={inputStyle}
                    />
                    {mode === 'register' && (
                      <input
                        type="text"
                        required
                        placeholder="Display name"
                        value={form.displayName}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            displayName: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      />
                    )}
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginTop: 4,
                      }}
                    >
                      <button
                        type="submit"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#2563eb',
                          color: '#f9fafb',
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {mode === 'login' ? 'Login' : 'Sign up'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMode((m) =>
                            m === 'login' ? 'register' : 'login'
                          )
                        }
                        style={{
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          fontSize: 12,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          color: 'white',
                        }}
                      >
                        {mode === 'login'
                          ? 'Need an account? Sign up'
                          : 'Have an account? Login'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* LEADERBOARD CARD */}
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 18,
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(148,163,184,0.7)',
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 4,
                    gap: 8,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 14,
                    }}
                  >
                    Leaderboard
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                    }}
                  >
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(
                      (lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBoardDifficulty(lvl)}
                          style={{
                            ...smallOutlineButton,
                            background:
                              boardDifficulty === lvl
                                ? 'rgba(37,99,235,0.2)'
                                : 'transparent',
                          }}
                        >
                          {lvl}
                        </button>
                      )
                    )}
                  </div>
                </div>
                {boardLoading ? (
                  <div>Loading leaderboard…</div>
                ) : leaderboard.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    No runs recorded yet for {boardDifficulty}. Be the first
                    to escape!
                  </div>
                ) : (
                  <ol
                    style={{
                      margin: 0,
                      marginTop: 4,
                      paddingLeft: 18,
                      fontSize: 12,
                      maxHeight: 140,
                      overflowY: 'auto',
                    }}
                  >
                    {leaderboard.map((row) => (
                      <li key={row.rank}>
                        {row.player}{' '}
                        <span style={{ opacity: 0.75 }}>
                          – {row.timeTaken}s
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                <p
                  style={{
                    marginTop: 6,
                    marginBottom: 0,
                    fontSize: 11,
                    opacity: 0.75,
                  }}
                >
                  Cloud view:{' '}
                  <a
                    href="https://your-api-gateway-url/dev/leaderboard?difficulty=easy"
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'underline', color: '#93c5fd' }}
                  >
                    Lambda leaderboard page
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hud-scanlines" />
      </div>

      {/* HISTORY MODAL */}
      {historyOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setHistoryOpen(false)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 900,
              maxHeight: '80vh',
              background: '#020617',
              borderRadius: 16,
              border: '1px solid rgba(148,163,184,0.7)',
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.6fr)',
              gap: 12,
              color: '#e5e7eb',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                  }}
                >
                  Saved runs
                </h3>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#e5e7eb',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>
              {historyLoading ? (
                <div style={{ fontSize: 13 }}>Loading history…</div>
              ) : historyItems.length === 0 ? (
                <div style={{ fontSize: 13 }}>
                  No saved runs found yet.
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    fontSize: 12,
                  }}
                >
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {historyItems.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 8,
                          border:
                            selectedSave?.id === item.id
                              ? '1px solid #60a5fa'
                              : '1px solid rgba(30,64,175,0.7)',
                          background:
                            selectedSave?.id === item.id
                              ? 'rgba(30,64,175,0.6)'
                              : 'rgba(15,23,42,0.8)',
                          marginBottom: 4,
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedSave(item)}
                      >
                        <div>
                          <strong>{item.difficulty}</strong> · room{' '}
                          {item.currentRoom + 1}
                        </div>
                        <div style={{ opacity: 0.8 }}>
                          timeLeft: {item.timeLeft}s · saved:{' '}
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div
              style={{
                borderLeft: '1px solid rgba(30,64,175,0.8)',
                paddingLeft: 10,
                fontSize: 12,
                overflowY: 'auto',
                maxHeight: '70vh',
              }}
            >
              {selectedSave ? (
                <>
                  <h4
                    style={{
                      marginTop: 0,
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    Details – {selectedSave.difficulty}, room{' '}
                    {selectedSave.currentRoom + 1}
                  </h4>
                  <p style={{ marginTop: 0, opacity: 0.8 }}>
                    Scroll to inspect code and console snapshots.
                  </p>
                  {selectedSave.roomStates ? (
                    Object.entries(selectedSave.roomStates).map(
                      ([roomId, state]) => (
                        <details
                          key={roomId}
                          style={{
                            marginBottom: 6,
                            borderRadius: 8,
                            border: '1px solid rgba(30,64,175,0.6)',
                            background: '#020617',
                            padding: 6,
                          }}
                        >
                          <summary
                            style={{
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {roomId}
                          </summary>
                          <div
                            style={{
                              marginTop: 4,
                              display: 'grid',
                              gridTemplateColumns:
                                'minmax(0, 1.1fr) minmax(0, 0.9fr)',
                              gap: 4,
                            }}
                          >
                            <div>
                              <div style={{ opacity: 0.7, marginBottom: 2 }}>
                                Code
                              </div>
                              <textarea
                                readOnly
                                value={state.editorCode ?? ''}
                                style={{
                                  width: '100%',
                                  minHeight: 100,
                                  borderRadius: 6,
                                  border:
                                    '1px solid rgba(55,65,81,0.9)',
                                  background: '#020617',
                                  color: '#e5e7eb',
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                }}
                              />
                            </div>
                            <div>
                              <div style={{ opacity: 0.7, marginBottom: 2 }}>
                                Console
                              </div>
                              <div
                                style={{
                                  width: '100%',
                                  minHeight: 100,
                                  borderRadius: 6,
                                  border:
                                    '1px solid rgba(55,65,81,0.9)',
                                  background: '#020617',
                                  color: '#e5e7eb',
                                  fontFamily: 'monospace',
                                  fontSize: 11,
                                  padding: 4,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {(state.consoleLines ?? []).join('\n')}
                              </div>
                            </div>
                          </div>
                        </details>
                      )
                    )
                  ) : (
                    <div>No per-room state stored for this save.</div>
                  )}
                </>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.85,
                    marginTop: 10,
                  }}
                >
                  Select a saved run on the left to inspect code and
                  console output snapshots.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid rgba(148,163,184,0.9)',
  fontSize: 13,
  background: '#020617',
  color: '#e5e7eb',
};

const smallOutlineButton: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  border: '1px solid rgba(148,163,184,0.9)',
  background: 'transparent',
  color: '#e5e7eb',
  cursor: 'pointer',
  fontSize: 11,
};

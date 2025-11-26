'use client';
import React from 'react';

export default function EndScreen({
  success,
  timeTaken,
}: {
  success: boolean;
  timeTaken: number;
}) {
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <div className="escape-end-overlay">
      <div className="escape-end-card hud-card">
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>
          {success ? 'You escaped! 🎉' : 'Time up — you failed'}
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>
          Time: {mins}:{String(secs).padStart(2, '0')}
        </p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
          You can play again with a different difficulty or return to the main
          page.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            marginTop: 12,
          }}
        >
          <a href="/escape-room">
            <button type="button" className="escape-btn-primary">
              Play again
            </button>
          </a>
          <a href="/">
            <button type="button" className="escape-btn-secondary">
              Back to home
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

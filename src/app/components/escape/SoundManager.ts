// src/app/components/escape/SoundManager.ts
export default class SoundManager {
  ambient: HTMLAudioElement | null = null;
  click: HTMLAudioElement | null = null;
  win: HTMLAudioElement | null = null;
  fail: HTMLAudioElement | null = null;
  muted = false;

  constructor() {
    if (typeof Audio === 'undefined') return;
    try {
      this.ambient = new Audio('/audio/ambient_loop.mp3');
      this.ambient.loop = true;

      this.click = new Audio('/audio/click.wav');
      this.win = new Audio('/audio/win.wav');
      this.fail = new Audio('/audio/fail.wav');

      this.unmute();
    } catch (e) {
      console.warn('Audio init failed', e);
    }
  }

  playAmbient() {
    if (!this.muted) {
      this.ambient?.play().catch(() => {});
    }
  }

  stopAmbient() {
    if (this.ambient) {
      this.ambient.pause();
      this.ambient.currentTime = 0;
    }
  }

  playClick() {
    if (!this.muted) this.click?.play().catch(() => {});
  }

  playWin() {
    if (!this.muted) this.win?.play().catch(() => {});
  }

  playFail() {
    if (!this.muted) this.fail?.play().catch(() => {});
  }

  mute() {
    this.muted = true;
    [this.ambient, this.click, this.win, this.fail].forEach((a) => {
      if (a) {
        a.pause();
        a.muted = true;
      }
    });
  }

  unmute() {
    this.muted = false;
    [this.ambient, this.click, this.win, this.fail].forEach((a) => {
      if (a) {
        a.muted = false;
      }
    });
  }
}

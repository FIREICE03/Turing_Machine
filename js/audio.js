/**
 * Web Audio API Sound Synthesizer (audio.js)
 * Zero external audio files — synthesized entirely in real-time.
 * Mechanical tape relay clicks, harmonic accept chimes, and reject alert tones.
 * Author: Vishal Kumar Gupta
 */

class TuringAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initSoundPreference();
  }

  initSoundPreference() {
    try {
      const saved = localStorage.getItem('tm_sound_enabled');
      // Default enabled unless explicitly set to 'false'
      this.enabled = saved !== 'false';
    } catch (e) {
      this.enabled = true;
    }
  }

  setEnabled(val) {
    this.enabled = !!val;
    try {
      localStorage.setItem('tm_sound_enabled', this.enabled ? 'true' : 'false');
    } catch (e) {}
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Subtle mechanical tape head relay click
   */
  playTapeTick() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Fast pitch drop to simulate relay mechanical snap
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.035);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  /**
   * Harmonious ascending chime chord for ACCEPT state
   */
  playAcceptChime() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Notes: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz), C6 (1046.50 Hz)
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const duration = 0.45;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }

  /**
   * Low double tone chime for REJECT state
   */
  playRejectChime() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Notes: F#3 (185 Hz) -> C3 (130.81 Hz)
      const notes = [220, 164.81];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        const startTime = now + idx * 0.12;
        const duration = 0.35;

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        // Filter to soften the sawtooth
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, startTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {}
  }
}

// Global audio singleton
window.tmAudio = new TuringAudio();

// Tiny WebAudio sound effects, synthesized — no audio files to load.
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  blip(freq, dur, type, vol) {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  gobble() {
    // A comic two-note gobble: low cluck, high cluck.
    this.blip(320, 0.09, 'sawtooth', 0.07);
    setTimeout(() => this.blip(520, 0.12, 'sawtooth', 0.07), 90);
  }

  pickup() { this.blip(880, 0.08, 'sine', 0.09); setTimeout(() => this.blip(1318, 0.1, 'sine', 0.08), 70); }
  jump() { this.blip(440, 0.09, 'triangle', 0.06); }
  hurt() { this.blip(160, 0.25, 'sawtooth', 0.1); }
  alarm() { this.blip(220, 0.14, 'square', 0.06); setTimeout(() => this.blip(220, 0.14, 'square', 0.06), 160); }
  escaped() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.16, 'triangle', 0.09), i * 120));
  }
}

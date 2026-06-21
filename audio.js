'use strict';

/* ─── KAIROS AUDIO ENGINE ───
   Procedural cinematic stingers via Web Audio — no licensed audio assets,
   just oscillators/noise shaped to evoke the brief: a rising drone under
   tension, a low brass "BRAAM" hit on penalties, and a ticking clockwork
   bed for the puzzle game. ──────────────────────────────── */

const KairosAudio = {
  ctx: null,
  _shepard: null,

  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  _env(gainNode, ctx, attack, hold, release, peak) {
    const t = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(peak, t + attack);
    gainNode.gain.setValueAtTime(peak, t + attack + hold);
    gainNode.gain.linearRampToValueAtTime(0, t + attack + hold + release);
  },

  // Rising tension drone — layered detuned sawtooth pad that climbs in pitch
  // for as long as a Synapse round is "armed".
  startShepard() {
    const ctx = this.ensure();
    this.stopShepard();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.6);
    master.connect(ctx.destination);

    const oscs = [80, 120, 160].map(freq => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      o.connect(g).connect(master);
      o.start();
      return o;
    });
    this._shepard = { master, oscs, startedAt: ctx.currentTime };
    this._shepardTick = setInterval(() => {
      if (!this._shepard) return;
      const elapsed = ctx.currentTime - this._shepard.startedAt;
      this._shepard.oscs.forEach((o, i) => {
        o.frequency.setTargetAtTime(80 + i * 40 + elapsed * 14, ctx.currentTime, 0.15);
      });
    }, 120);
  },

  stopShepard() {
    if (this._shepardTick) clearInterval(this._shepardTick);
    if (this._shepard) {
      const { master, oscs } = this._shepard;
      const ctx = this.ctx;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      oscs.forEach(o => o.stop(ctx.currentTime + 0.25));
      this._shepard = null;
    }
  },

  // Low brass "BRAAM" stinger for fouls / blackouts / wrong answers.
  braam() {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    [55, 82.5, 110].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = 0;
      o.connect(g).connect(ctx.destination);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22 / (i + 1), t + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      o.start(t);
      o.stop(t + 1.7);
    });
  },

  // Sharp double-beep marking the instant "go" fires — the one sound every
  // device plays in sync since it comes from the same shared timestamp.
  goSignal() {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = freq;
      const g = ctx.createGain();
      const start = t + i * 0.09;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.2, start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(start); o.stop(start + 0.18);
    });
  },

  // Crisp strike hit for a successful tap.
  strike() {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(820, t);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.22);
  },

  // A single clockwork tick for the Vault puzzle.
  tick() {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = 1400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + 0.06);
  },

  // Bright success chime.
  chime() {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    [660, 880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.05);
      g.gain.linearRampToValueAtTime(0.18, t + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(t + i * 0.05); o.stop(t + i * 0.05 + 0.55);
    });
  },
};

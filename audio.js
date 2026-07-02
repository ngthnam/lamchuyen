'use strict';

const KairosAudio = {
  ctx: null,
  _shepard: null,

  ensure() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  startShepard() {
    const ctx = this.ensure();
    this.stopShepard();
    const master = ctx.createGain();
    master.gain.value = 0.05;
    master.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 90;
    osc.connect(master);
    osc.start();
    this._shepard = { master, osc };
  },

  stopShepard() {
    if (!this._shepard) return;
    const ctx = this.ctx;
    const { master, osc } = this._shepard;
    try {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
    this._shepard = null;
  },

  _tone(freq, dur, type) {
    const ctx = this.ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  },

  braam() { this._tone(90, 0.5, 'sawtooth'); },
  goSignal() { this._tone(880, 0.16, 'square'); setTimeout(() => this._tone(1320, 0.16, 'square'), 90); },
  strike() { this._tone(620, 0.18, 'triangle'); },
  tick() { this._tone(1400, 0.05, 'square'); },
  chime() { this._tone(660, 0.35, 'sine'); setTimeout(() => this._tone(990, 0.35, 'sine'), 70); },
};

(function applySynapseFixWhenReady() {
  function apply() {
    try {
      if (typeof Kairos === 'undefined' || typeof S === 'undefined' || typeof KairosDB === 'undefined') return false;
      if (!Kairos || Kairos.__synapseFixApplied) return true;
      if (typeof Kairos.synArm !== 'function' || typeof Kairos._tick !== 'function') return false;

      Kairos.__synapseFixApplied = true;

      Kairos.synArm = function () {
        const syn = S.room.state.syn || { round: 0 };
        const round = (syn.round || 0) + 1;
        const goAt = Date.now() + 100 + Math.random() * 1400;
        const inverted = !!syn.nextInverted;
        S._synGoFired = false;
        KairosAudio.startShepard();
        this._patchRoom({
          state: Object.assign({}, S.room.state, {
            syn: { phase: 'armed', goAt, round, inverted, hostResolvedTimeouts: false }
          })
        });
        if (inverted) this._fireTwist('polarity');
      };

      Kairos._tick = function () {
        if (!S.room || S.room.screen !== 'synapse') return;
        const syn = S.room.state.syn || {};
        if (syn.phase !== 'armed' || !syn.goAt) return;

        if (Date.now() >= syn.goAt && !S._synGoFired) {
          S._synGoFired = true;
          KairosAudio.goSignal();
          if (S.role === 'host') KairosAudio.stopShepard();
          else if (navigator.vibrate) navigator.vibrate(40);
          this.render();
          return;
        }

        const windowMs = 5000;
        const round = syn.round || 0;

        if (S.role === 'host' && S._synGoFired && !syn.hostResolvedTimeouts && Date.now() >= syn.goAt + windowMs) {
          const updates = S.players.filter(p => p.last_round !== round).map(p => {
            p.last_reaction_ms = -2;
            p.last_round = round;
            p.penalty_count = Number(p.penalty_count || 0) + 1;
            p.sips = Number(p.sips || 0) + SYN_SLOWEST_PENALTY;
            return KairosDB.updatePlayer(p.id, {
              last_reaction_ms: -2,
              last_round: round,
              penalty_count: p.penalty_count,
              sips: p.sips
            });
          });
          Promise.allSettled(updates).finally(() => {
            this._patchRoom({
              state: Object.assign({}, S.room.state, {
                syn: Object.assign({}, syn, { hostResolvedTimeouts: true })
              })
            });
          });
          this.render();
          return;
        }

        if (S.role === 'player' && S.me && S.me.last_round !== round && Date.now() >= syn.goAt + windowMs) {
          this._synTimeout(round);
          return;
        }

        if (S._synGoFired) this.render();
      };

      return true;
    } catch (e) {
      console.error('Synapse fix failed:', e);
      return true;
    }
  }

  if (!apply()) {
    const timer = setInterval(() => {
      if (apply()) clearInterval(timer);
    }, 100);
  }
})();

'use strict';

(function installBootGuard() {
  function memoryStorage() {
    var store = {};
    return {
      getItem: function (key) { key = String(key); return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
      setItem: function (key, value) { store[String(key)] = String(value); },
      removeItem: function (key) { delete store[String(key)]; },
      clear: function () { store = {}; },
      key: function (index) { return Object.keys(store)[index] || null; },
      get length() { return Object.keys(store).length; }
    };
  }

  function showBootError(err) {
    console.error('Kairos boot failed:', err);
    var stage = document.getElementById('stage');
    if (!stage) return;
    stage.innerHTML = '<div class="landing-card"><div class="landing-logo">KAIROS</div><div class="scene-title">Không tải được game</div><div class="scene-sub">Hãy bấm tải lại. Nếu vẫn lỗi, hãy mở tab ẩn danh để xoá session cũ.</div><button class="btn btn-primary btn-block" onclick="location.reload()">Tải lại</button></div>';
  }

  try {
    document.title = 'KAIROS';
    var k = '__kairos_storage_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    try { JSON.parse(window.localStorage.getItem('kairos_session') || 'null'); }
    catch (sessionErr) { window.localStorage.removeItem('kairos_session'); }
  } catch (storageErr) {
    try { Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true }); }
    catch (defineErr) { console.warn('Could not install storage fallback:', defineErr); }
  }

  var originalAddEventListener = document.addEventListener.bind(document);
  document.addEventListener = function (type, listener, options) {
    if (type === 'DOMContentLoaded' && typeof listener === 'function') {
      return originalAddEventListener(type, function (event) {
        try {
          var result = listener.call(this, event);
          if (result && typeof result.catch === 'function') result.catch(showBootError);
          return result;
        } catch (err) {
          showBootError(err);
        }
      }, options);
    }
    return originalAddEventListener(type, listener, options);
  };
})();

const KairosAudio = {
  ctx: null,
  _shepard: null,

  ensure() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    } catch (e) {
      return null;
    }
  },

  startShepard() {
    const ctx = this.ensure();
    if (!ctx) return;
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
    if (!this._shepard || !this.ctx) return;
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
    if (!ctx) return;
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

(function applyLiveFixesWhenReady() {
  function resetPlayerPatch() {
    return {
      sips: 0,
      ready: false,
      last_reaction_ms: null,
      last_round: 0,
      total_reaction_ms: 0,
      reaction_count: 0,
      vault_bet: '1',
      vault_round: 0,
      vault_result: 'idle',
      paradox_pick: null,
      paradox_round: 0,
      paradox_wrong: 0,
      blackout: false,
      penalty_count: 0,
      correct_count: 0,
      is_mole: false,
      mole_shield: false
    };
  }

  function cleanTopbarBrand(html) {
    return String(html)
      .replace(/<div class="divider-v"><\/div>\s*<div class="tagline">[\s\S]*?<\/div>/g, '')
      .replace(/<div class="tagline">[\s\S]*?<\/div>/g, '');
  }

  function apply() {
    try {
      if (typeof KairosI18n !== 'undefined' && KairosI18n) {
        if (KairosI18n.vi) KairosI18n.vi.tagline = '';
        if (KairosI18n.en) KairosI18n.en.tagline = '';
      }
      if (typeof document !== 'undefined') document.title = 'KAIROS';

      if (typeof Kairos === 'undefined' || typeof S === 'undefined' || typeof KairosDB === 'undefined') return false;
      if (!Kairos) return true;
      if (typeof Kairos.synArm !== 'function' || typeof Kairos._tick !== 'function' || typeof Kairos._topbarRoom !== 'function') return false;

      if (!Kairos.__resetGameApplied) {
        Kairos.__resetGameApplied = true;

        Kairos.resetGame = async function () {
          if (S.role !== 'host' || !S.room || !S.roomCode) return;
          if (!confirm('Reset game và đưa tất cả người chơi về sảnh chờ?')) return;

          try {
            KairosAudio.stopShepard();
            S._synGoFired = false;
            S._moleRedirectAmount = null;
            if (S._paraTimer) { clearTimeout(S._paraTimer); S._paraTimer = null; }

            const patch = resetPlayerPatch();
            S.players.forEach(p => Object.assign(p, patch));
            await Promise.allSettled(S.players.map(p => KairosDB.updatePlayer(p.id, resetPlayerPatch())));

            await this._patchRoom({ screen: 'lounge', state: {}, round: 0, flash: false });
            this.toast('↺ Game đã được reset');
            this.render();
          } catch (e) {
            console.error('resetGame failed:', e);
            this.toast('⚠️ Không reset được game, thử lại.');
          }
        };

        const originalTopbarRoom = Kairos._topbarRoom;
        Kairos._topbarRoom = function () {
          let html = cleanTopbarBrand(originalTopbarRoom.call(this));
          if (S.role !== 'host') return html;
          const resetBtn = '<div class="icon-btn" onclick="Kairos.resetGame()">↺ Reset</div>';
          if (html.includes('Kairos.resetGame')) return html;
          const leaveBtn = '<div class="icon-btn" onclick="Kairos.leaveRoom()">⏏</div>';
          if (html.includes(leaveBtn)) return html.replace(leaveBtn, resetBtn + leaveBtn);
          return html + resetBtn;
        };
      }

      if (!Kairos.__synapseFixApplied) {
        Kairos.__synapseFixApplied = true;

        Kairos.synArm = function () {
          const syn = S.room.state.syn || { round: 0 };
          const round = (syn.round || 0) + 1;
          const goAt = Date.now() + 100 + Math.random() * 1400;
          const inverted = !!syn.nextInverted;
          S._synGoFired = false;
          KairosAudio.startShepard();
          this._patchRoom({ state: Object.assign({}, S.room.state, { syn: { phase: 'armed', goAt, round, inverted, hostResolvedTimeouts: false } }) });
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
              return KairosDB.updatePlayer(p.id, { last_reaction_ms: -2, last_round: round, penalty_count: p.penalty_count, sips: p.sips });
            });
            Promise.allSettled(updates).finally(() => {
              this._patchRoom({ state: Object.assign({}, S.room.state, { syn: Object.assign({}, syn, { hostResolvedTimeouts: true }) }) });
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
      }

      return true;
    } catch (e) {
      console.error('Live fix failed:', e);
      return true;
    }
  }

  if (!apply()) {
    const timer = setInterval(() => {
      if (apply()) clearInterval(timer);
    }, 100);
  }
})();

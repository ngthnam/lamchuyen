'use strict';

/* ─── KAIROS APP ───
   One Supabase room row is the shared truth the host (TV) writes to.
   Every phone is its own row. Realtime postgres_changes pushes every
   write to every connected device — that's the whole multiplayer model.
──────────────────────────────── */

// Synapse penalty: the slowest valid tapper each round drinks this many
// sips; jumping the gun (tapping before "go") always drinks exactly half
// of that — defined off the same constant so the two stay linked.
const SYN_SLOWEST_PENALTY = 1;
const SYN_FOUL_PENALTY = SYN_SLOWEST_PENALTY / 2;

const VAULT_PUZZLES = [
  { seq: [2, 6, 12, 20, 30], answer: 42 },
  { seq: [1, 1, 2, 3, 5, 8], answer: 13 },
  { seq: [3, 9, 27, 81], answer: 243 },
  { seq: [5, 10, 20, 40], answer: 80 },
  { seq: [1, 4, 9, 16, 25], answer: 36 },
  { seq: [2, 3, 5, 8, 13], answer: 21 },
];

const PARADOX_CARDS = [
  { key: 'c_cold', bg: '#d93636' },
  { key: 'c_hot', bg: '#2563eb' },
  { key: 'c_stop', bg: '#16a34a' },
  { key: 'c_go', bg: '#dc2626' },
  { key: 'c_up', bg: '#7c3aed' },
];

const SCENES = ['lounge', 'dashboard', 'synapse', 'vault', 'paradox', 'report'];
const SCENE_NO = { lounge: '01', dashboard: '02', synapse: '03', vault: '04', paradox: '05', report: '06', guide: '··' };

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }
function joinUrl(code) { return location.origin + location.pathname + '?room=' + code; }
function t(key, vars) { return kt(S.lang, key, vars); }

const S = {
  lang: localStorage.getItem('kairos_lang') || 'vi',
  role: null,        // 'host' | 'player'
  roomCode: null,
  room: null,        // latest kairos_rooms row
  players: [],       // latest kairos_players rows for this room
  me: null,          // my own kairos_players row (player role only)
  guideOpenLocal: false,
  guidePrevScreen: 'lounge',
  _synGoFired: false,
  _paraTimer: null,
};

const Kairos = {
  // ---------- boot ----------
  async boot() {
    KairosDB.init();
    const urlRoom = new URLSearchParams(location.search).get('room');
    const saved = JSON.parse(localStorage.getItem('kairos_session') || 'null');

    if (saved && (!urlRoom || urlRoom.toUpperCase() === saved.roomCode)) {
      const room = await KairosDB.getRoom(saved.roomCode).catch(() => null);
      if (room) {
        S.role = saved.role; S.roomCode = saved.roomCode;
        if (saved.role === 'player') {
          const players = await KairosDB.listPlayers(saved.roomCode);
          S.me = players.find(p => p.id === saved.playerId) || null;
          if (!S.me) { this._clearSession(); return this.renderLanding(urlRoom); }
        }
        return this.enterRoom();
      }
      this._clearSession();
    }
    this.renderLanding(urlRoom);
  },

  _saveSession() {
    localStorage.setItem('kairos_session', JSON.stringify({ role: S.role, roomCode: S.roomCode, playerId: S.me ? S.me.id : null }));
  },
  _clearSession() { localStorage.removeItem('kairos_session'); },

  setLang(lang) { S.lang = lang; localStorage.setItem('kairos_lang', lang); this.render(); },

  // ---------- landing ----------
  renderLanding(prefillCode) {
    document.getElementById('topbar').innerHTML = this._topbarLanding();
    document.getElementById('scenenav').innerHTML = '';
    document.getElementById('stage').innerHTML = `
      <div class="landing-card">
        <div class="landing-logo">KAIROS</div>
        <div class="scene-sub">${t('landingSub')}</div>
        <div style="height:8px"></div>
        <button class="btn btn-primary btn-block" onclick="Kairos.chooseHost()">${t('hostBtn')}</button>
        <div class="scene-sub" style="margin-top:-6px">${t('hostBtnSub')}</div>
        <div style="height:6px"></div>
        <button class="btn btn-ghost btn-block" onclick="Kairos.showJoinForm()">${t('joinBtn')}</button>
        <div class="scene-sub" style="margin-top:-6px">${t('joinBtnSub')}</div>
        <div id="join-area"></div>
      </div>`;
    if (prefillCode) this.showJoinForm(prefillCode);
  },

  _topbarLanding() {
    return `
      <div class="topbar-left"><div class="brand">KAIROS</div></div>
      <div class="topbar-right">
        <div class="lang-toggle">
          <div class="lang-pill ${S.lang === 'vi' ? 'active' : ''}" onclick="Kairos.setLang('vi')">VI</div>
          <div class="lang-pill ${S.lang === 'en' ? 'active' : ''}" onclick="Kairos.setLang('en')">EN</div>
        </div>
      </div>`;
  },

  showJoinForm(prefillCode) {
    document.getElementById('join-area').innerHTML = `
      <div style="height:14px"></div>
      <div class="field-label">${t('codeLabel')}</div>
      <input id="in-code" class="text-input code" maxlength="6" placeholder="${t('codePlaceholder')}" value="${escapeHtml(prefillCode || '')}">
      <div style="height:10px"></div>
      <button class="btn btn-primary btn-block" onclick="Kairos.submitCode()">${t('joinSubmit')}</button>
      <div id="join-err" class="scene-sub" style="color:#ff8d9c"></div>`;
  },

  async chooseHost() {
    try {
      const room = await KairosDB.createRoom();
      S.role = 'host'; S.roomCode = room.code; S.room = room; S.players = [];
      this._saveSession();
      this.enterRoom();
    } catch (e) { console.error(e); alert('Could not create a room: ' + e.message); }
  },

  async submitCode() {
    const code = document.getElementById('in-code').value.trim().toUpperCase();
    if (!code) return;
    const room = await KairosDB.getRoom(code).catch(() => null);
    if (!room) { document.getElementById('join-err').textContent = t('joinErrorNoRoom'); return; }
    S.roomCode = code; S.room = room;
    document.getElementById('stage').innerHTML = this._joinDetailsForm();
  },

  _joinDetailsForm() {
    const drink = (this._pendingDrink) || 'spirit';
    const chip = (val, label, sub) => `<div class="chip ${drink === val ? 'active' : ''}" onclick="Kairos.setPendingDrink('${val}')"><span>${label}</span><span>${sub}</span></div>`;
    return `
      <div class="landing-card">
        <div class="scene-title">${t('joinSubmit')}</div>
        <div class="room-pill" style="align-self:center"><span>${t('roomCodeLabel')}</span><b>${escapeHtml(S.roomCode)}</b></div>
        <div class="field-label">${t('nameLabel')}</div>
        <input id="in-name" class="text-input" maxlength="20" placeholder="${t('namePlaceholder')}">
        <div class="field-label" style="margin-top:6px">${t('drinkLabel')}</div>
        <div class="chip-row">
          ${chip('beer', '🍺 ' + t('beer'), '~50ml ' + t('perSip'))}
          ${chip('spirit', '🥃 ' + t('spirits'), '~15ml ' + t('perSip'))}
          ${chip('cocktail', '🍸 ' + t('cocktail'), '~30ml ' + t('perSip'))}
        </div>
        <button class="btn btn-primary btn-block" onclick="Kairos.submitJoin()">${t('joinSubmit')}</button>
        <div id="join-err2" class="scene-sub" style="color:#ff8d9c"></div>
      </div>`;
  },
  setPendingDrink(v) { this._pendingDrink = v; document.getElementById('stage').innerHTML = this._joinDetailsForm(); },

  async submitJoin() {
    const name = document.getElementById('in-name').value.trim();
    if (!name) { document.getElementById('join-err2').textContent = t('joinErrorName'); return; }
    const drink = this._pendingDrink || 'spirit';
    const player = await KairosDB.joinRoom(S.roomCode, name, drink, false);
    S.role = 'player'; S.me = player;
    this._saveSession();
    this.enterRoom();
  },

  // ---------- room lifecycle ----------
  async enterRoom() {
    if (!S.room) S.room = await KairosDB.getRoom(S.roomCode);
    S.players = await KairosDB.listPlayers(S.roomCode);
    KairosDB.subscribeRoom(S.roomCode, room => { S.room = room; this._onRoomChange(); this.render(); });
    KairosDB.subscribePlayers(S.roomCode, (eventType, row) => this._onPlayerChange(eventType, row));
    if (!this._ticker) this._ticker = setInterval(() => this._tick(), 80);
    this.render();
  },

  leaveRoom() {
    KairosDB.unsubscribeAll();
    clearInterval(this._ticker); this._ticker = null;
    this._clearSession();
    S.role = null; S.roomCode = null; S.room = null; S.players = []; S.me = null;
    history.replaceState(null, '', location.pathname);
    this.renderLanding();
  },

  _onPlayerChange(eventType, row) {
    if (!row) return;
    const idx = S.players.findIndex(p => p.id === row.id);
    if (eventType === 'DELETE') { if (idx >= 0) S.players.splice(idx, 1); }
    else {
      const prev = idx >= 0 ? S.players[idx] : null;
      if (idx >= 0) S.players[idx] = row; else S.players.push(row);
      if (S.role === 'host') this._hostReactToPlayerEvent(prev, row);
      if (S.role === 'player' && S.me && S.me.id === row.id) S.me = row;
    }
    this.render();
  },

  // Host-side cinematic feedback fired purely from watching player rows change.
  _hostReactToPlayerEvent(prev, row) {
    const becameFoul = row.last_reaction_ms === -1 && (!prev || prev.last_round !== row.last_round);
    const becameLost = row.vault_result === 'lost' && (!prev || prev.vault_result !== 'lost');
    const becameBlackout = row.blackout && !(prev && prev.blackout);
    if (becameFoul || becameLost || becameBlackout) { this._fireFlash(); KairosAudio.braam(); }
    if (row.last_reaction_ms > 0 && (!prev || prev.last_round !== row.last_round)) KairosAudio.strike();
  },

  _onRoomChange() {
    if (S.room && S.room.screen === 'synapse' && (S.room.state.syn || {}).phase !== 'armed') S._synGoFired = false;
  },

  _fireFlash() {
    const el = document.getElementById('flash');
    el.classList.remove('fire'); void el.offsetWidth; el.classList.add('fire');
  },

  toast(msg) {
    const host = document.getElementById('toast-host');
    const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
    host.appendChild(d); setTimeout(() => d.remove(), 3200);
  },

  // 80ms ticker: drives the Synapse "armed -> go" flip from a shared timestamp.
  _tick() {
    if (!S.room || S.room.screen !== 'synapse') return;
    const syn = S.room.state.syn || {};
    if (syn.phase === 'armed' && syn.goAt && Date.now() >= syn.goAt && !S._synGoFired) {
      S._synGoFired = true;
      if (S.role === 'host') KairosAudio.stopShepard();
      this.render();
    }
  },

  // ---------- room write helpers ----------
  async _patchRoom(patch) { await KairosDB.updateRoom(S.roomCode, patch); S.room = Object.assign({}, S.room, patch); this.render(); },
  async _patchMe(patch) { await KairosDB.updatePlayer(S.me.id, patch); S.me = Object.assign({}, S.me, patch); this.render(); },

  goScreen(screen) {
    const state = Object.assign({}, S.room.state);
    if (screen === 'synapse') state.syn = { phase: 'idle', goAt: null, round: (state.syn && state.syn.round) || 0 };
    if (screen === 'vault') state.vault = state.vault || { puzzleIdx: 0, round: 0 };
    if (screen === 'paradox') state.paradox = { phase: 'idle', order: null, askIndex: null, round: (state.paradox && state.paradox.round) || 0 };
    this._patchRoom({ screen, state });
  },

  // ====================================================================
  // RENDER
  // ====================================================================
  render() {
    if (!S.room) return;
    document.getElementById('topbar').innerHTML = this._topbarRoom();
    document.getElementById('scenenav').innerHTML = S.role === 'host' ? this._sceneNav() : '';
    document.getElementById('stage').innerHTML = this._stage();
    this._afterRender();
  },

  _topbarRoom() {
    const lang = `<div class="lang-toggle">
        <div class="lang-pill ${S.lang === 'vi' ? 'active' : ''}" onclick="Kairos.setLang('vi')">VI</div>
        <div class="lang-pill ${S.lang === 'en' ? 'active' : ''}" onclick="Kairos.setLang('en')">EN</div>
      </div>`;
    const guideBtn = S.role === 'host'
      ? `<div class="icon-btn ${S.room.screen === 'guide' ? 'active' : ''}" onclick="Kairos.openGuide()">📖 ${t('guide')}</div>` : '';
    if (S.role === 'host') {
      return `
        <div class="topbar-left">
          <div class="brand">KAIROS</div><div class="divider-v"></div><div class="tagline">${t('tagline')}</div>
        </div>
        <div class="topbar-right">
          <div class="room-pill" onclick="Kairos.copyLink()" title="Copy join link"><span>${t('roomCodeLabel')}</span><b>${escapeHtml(S.roomCode)}</b></div>
          ${lang}${guideBtn}
          <div class="divider-v"></div>
          <div class="live-dot"><span class="dot"></span>${t('live')} · ${S.players.length} ${t('playersLabel')}</div>
          <div class="icon-btn" onclick="Kairos.leaveRoom()">⏏</div>
        </div>`;
    }
    const sips = S.me ? Number(S.me.sips || 0) : 0;
    return `
      <div class="topbar-left"><div class="brand" style="font-size:16px">KAIROS</div></div>
      <div class="topbar-right">
        ${lang}
        <div class="room-pill"><span>🥃</span><b>${sips}</b></div>
        <div class="icon-btn" onclick="Kairos.leaveRoom()">⏏</div>
      </div>`;
  },

  copyLink() {
    navigator.clipboard?.writeText(joinUrl(S.roomCode)).then(() => this.toast('🔗 ' + joinUrl(S.roomCode)));
  },

  _sceneNav() {
    return SCENES.map(k => `
      <div class="scene-chip ${S.room.screen === k ? 'active' : ''}" onclick="Kairos.goScreen('${k}')">
        <span class="no">${SCENE_NO[k]}</span><span>${this._sceneName(k)}</span>
      </div>`).join('');
  },
  _sceneName(k) {
    return t({ lounge: 'navLounge', dashboard: 'navDashboard', synapse: 'navSynapse', vault: 'navVault', paradox: 'navParadox', report: 'navReport' }[k]);
  },

  _stage() {
    const screen = S.room.screen;
    if (screen === 'guide') return S.role === 'host' ? this._guideHost() : this._guidePlayer();
    const fn = '_' + screen + (S.role === 'host' ? 'Host' : 'Player');
    return this[fn] ? this[fn]() : '';
  },

  _afterRender() {
    if (S.room.screen === 'lounge' && S.role === 'host' && window.QRCode) {
      const el = document.getElementById('qrcode');
      if (el) { el.innerHTML = ''; new QRCode(el, { text: joinUrl(S.roomCode), width: 192, height: 192, colorDark: '#0a0a0b', colorLight: '#ffffff' }); }
    }
  },

  // ====================================================================
  // LOUNGE
  // ====================================================================
  _loungeHost() {
    const list = S.players.length
      ? `<div class="players-row">${S.players.map(p => `<div class="player-tag"><span class="av">${escapeHtml(p.name[0] || '?').toUpperCase()}</span>${escapeHtml(p.name)} ${p.ready ? '✓' : ''}</div>`).join('')}</div>`
      : `<div class="scene-sub">${t('playersLabel')}: 0</div>`;
    return `
      <div class="scene-label">${t('scanTitle')} <span style="color:#fff">${t('scanHi')}</span></div>
      <div class="qr-wrap"><div id="qrcode"></div></div>
      <div class="room-code-big">${escapeHtml(S.roomCode)}</div>
      <div class="scene-sub">${t('scanSub')}</div>
      ${list}
      <button class="btn btn-primary" ${S.players.length ? '' : 'disabled'} onclick="Kairos.goScreen('dashboard')">${t('startGameBtn')}</button>
      ${S.players.length ? '' : `<div class="scene-sub">${t('needPlayers')}</div>`}`;
  },

  _loungePlayer() {
    if (!S.me) return this._joinDetailsForm();
    const chip = (val, label, sub) => `<div class="chip ${S.me.drink === val ? 'active' : ''}" onclick="Kairos.pickDrink('${val}')"><span>${label}</span><span>${sub}</span></div>`;
    const sipVol = { beer: '≈ 50 ml', spirit: '≈ 15 ml', cocktail: '≈ 30 ml' }[S.me.drink];
    return `
      <div class="landing-card">
        <div class="scene-title">${escapeHtml(S.me.name)}</div>
        <div class="scene-sub">${t('waitingTitle')} — ${t('waitingSub')}</div>
        <div class="chip-row">
          ${chip('beer', '🍺 ' + t('beer'), '~50ml')}
          ${chip('spirit', '🥃 ' + t('spirits'), '~15ml')}
          ${chip('cocktail', '🍸 ' + t('cocktail'), '~30ml')}
        </div>
        <div class="glass" style="padding:14px;text-align:center">
          <div class="scene-label">${t('sipCal')}</div>
          <div class="scene-title" style="font-size:26px">${sipVol}</div>
          <div class="scene-sub" style="font-size:11px">${t('sipFair')}</div>
        </div>
        <button class="btn ${S.me.ready ? 'btn-primary' : 'btn-ghost'} btn-block" onclick="Kairos.toggleReady()">${S.me.ready ? t('readyDone') : t('readyBtn')}</button>
        <div class="scene-sub">${t('waitingForHost')}</div>
      </div>`;
  },
  pickDrink(v) { this._patchMe({ drink: v }); },
  toggleReady() { this._patchMe({ ready: !S.me.ready }); },

  // ====================================================================
  // DASHBOARD
  // ====================================================================
  _perfBars() {
    const active = S.players.filter(p => p.reaction_count > 0 || p.correct_count > 0 || p.penalty_count > 0);
    if (!active.length) return `<div class="scene-sub">${t('noData')}</div>`;
    const maxSips = Math.max(1, ...S.players.map(p => Number(p.sips || 0)));
    return `<div class="ledger">${S.players.map(p => `
      <div class="ledger-row">
        <span style="width:80px;font-size:13px;font-weight:600;text-align:left">${escapeHtml(p.name)}</span>
        <div class="ledger-bar"><span style="width:${(Number(p.sips || 0) / maxSips) * 100}%"></span></div>
        <span style="width:42px;text-align:right;font-size:12px;color:rgba(255,255,255,.6)">${Number(p.sips || 0)}</span>
      </div>`).join('')}</div>`;
  },
  _dashboardHost() {
    return `
      <div class="scene-label">${t('dashNow')}</div>
      <div class="scene-title">${t('dashArena')}<br><span style="font-size:.45em;color:rgba(255,255,255,.5)">${t('dashTrials')}</span></div>
      <div class="glass" style="padding:18px;width:100%;max-width:440px">
        <div class="scene-label">${t('vltLedger')}</div>
        <div style="height:8px"></div>
        ${this._perfBars()}
      </div>
      <button class="btn btn-primary" onclick="Kairos.goScreen('synapse')">${t('dashNext')}</button>`;
  },
  _dashboardPlayer() {
    return `
      <div style="width:80px;height:80px;border-radius:50%;border:2px solid rgba(177,76,255,.6);display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(139,92,246,.45);animation:kaBreathe 2.4s infinite"><span style="font-size:32px">👁️</span></div>
      <div class="scene-title">${t('dashEyes')}</div>
      <div class="scene-sub">${t('dashEyesSub')}</div>`;
  },

  // ====================================================================
  // SYNAPSE
  // ====================================================================
  synArm() {
    const syn = S.room.state.syn || { round: 0 };
    const round = (syn.round || 0) + 1;
    const goAt = Date.now() + 1300 + Math.random() * 3200;
    S._synGoFired = false;
    KairosAudio.startShepard();
    this._patchRoom({ state: Object.assign({}, S.room.state, { syn: { phase: 'armed', goAt, round } }) });
  },
  synResolveAndNext() {
    const round = (S.room.state.syn || {}).round || 0;
    const entries = S.players.filter(p => p.last_round === round && p.last_reaction_ms != null);
    const valid = entries.filter(p => p.last_reaction_ms >= 0);
    if (valid.length) {
      const slowest = valid.reduce((a, b) => (a.last_reaction_ms > b.last_reaction_ms ? a : b));
      KairosDB.updatePlayer(slowest.id, { sips: Number(slowest.sips || 0) + SYN_SLOWEST_PENALTY, penalty_count: (slowest.penalty_count || 0) + 1 });
    } else {
      this.toast(t('needPlayers'));
    }
    this.synArm();
  },
  _synapseHost() {
    const syn = S.room.state.syn || { phase: 'idle' };
    const live = syn.phase === 'armed' && !S._synGoFired;
    const word = live ? t('synHostWait') : (S._synGoFired ? t('synHostNow') : t('synHostRising'));
    const round = syn.round || 0;
    const entries = S.players.filter(p => p.last_round === round && p.last_reaction_ms != null)
      .sort((a, b) => (a.last_reaction_ms === -1 ? 1 : b.last_reaction_ms === -1 ? -1 : a.last_reaction_ms - b.last_reaction_ms));
    return `
      <div class="scene-label">${t('synLabel')}</div>
      <div class="syn-ring-wrap">
        <div class="syn-ring-pulse" style="border-color:${S._synGoFired ? 'var(--crimson)' : 'var(--violet)'}"></div>
        <div class="syn-ring-pulse delay" style="border-color:${S._synGoFired ? 'var(--crimson)' : 'var(--violet)'}"></div>
        <div class="syn-core" style="border-color:${S._synGoFired ? 'var(--crimson)' : 'var(--violet)'};background:${S._synGoFired ? 'radial-gradient(circle,rgba(255,40,70,.35),transparent 72%)' : 'radial-gradient(circle,rgba(139,92,246,.25),transparent 72%)'}">
          <span class="word">${syn.phase === 'idle' ? t('synStandT') : (S._synGoFired ? t('synStrikeT') : t('synHoldT'))}</span>
        </div>
      </div>
      <div class="scene-sub" style="letter-spacing:.2em;text-transform:uppercase">${syn.phase === 'idle' ? '' : word}</div>
      <div class="reaction-feed">
        <div class="scene-label">${t('synFeedTitle')}</div>
        ${entries.map(p => p.last_reaction_ms === -1
          ? `<div class="reaction-row foul"><span>${escapeHtml(p.name)}</span><b>${t('synHostFoul')} · -${SYN_FOUL_PENALTY} 🥃</b></div>`
          : `<div class="reaction-row"><span>${escapeHtml(p.name)}</span><b>${p.last_reaction_ms} ms</b></div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary" ${syn.phase !== 'idle' ? 'disabled' : ''} onclick="Kairos.synArm()">${syn.phase === 'idle' ? t('synArmBtn') : t('synArming')}</button>
        ${syn.phase !== 'idle' ? `<button class="btn btn-ghost" onclick="Kairos.synResolveAndNext()">${t('synNextBtn')}</button>` : ''}
        <button class="btn btn-ghost" onclick="Kairos.goScreen('vault')">${t('navVault')} ▶</button>
      </div>`;
  },
  synTap() {
    if (!S.me) return;
    const syn = S.room.state.syn || {};
    const round = syn.round || 0;
    if (S.me.last_round === round) return; // already answered this round
    if (syn.phase !== 'armed') return;
    if (!S._synGoFired) {
      vibrate(80);
      this._patchMe({ last_reaction_ms: -1, last_round: round, sips: Number(S.me.sips || 0) + SYN_FOUL_PENALTY, penalty_count: (S.me.penalty_count || 0) + 1 });
      return;
    }
    const ms = Math.max(1, Math.round(Date.now() - syn.goAt));
    KairosAudio.strike(); vibrate(30);
    this._patchMe({ last_reaction_ms: ms, last_round: round, total_reaction_ms: Number(S.me.total_reaction_ms || 0) + ms, reaction_count: (S.me.reaction_count || 0) + 1 });
  },
  _synapsePlayer() {
    const syn = S.room.state.syn || { phase: 'idle' };
    const round = syn.round || 0;
    const answered = S.me && S.me.last_round === round && syn.phase !== 'idle';
    let cls = '', title, sub, showMs = false;
    if (syn.phase === 'idle') { title = t('synStandT'); sub = t('synStandS'); }
    else if (answered && S.me.last_reaction_ms === -1) { cls = 'foul'; title = t('synFoulT'); sub = t('synFoulS'); }
    else if (answered) { title = t('synReactT'); sub = t('synReactS'); showMs = true; }
    else if (S._synGoFired) { cls = 'go'; title = t('synStrikeT'); sub = t('synStrikeS'); }
    else { cls = 'armed'; title = t('synHoldT'); sub = t('synHoldS'); }
    const bg = cls === 'go' ? 'radial-gradient(circle at 50% 40%, rgba(255,40,70,.35), rgba(60,4,10,.6))'
      : cls === 'armed' ? 'radial-gradient(circle at 50% 40%, rgba(139,92,246,.18), rgba(20,8,40,.6))'
      : cls === 'foul' ? 'radial-gradient(circle at 50% 40%, rgba(255,40,70,.2), rgba(40,4,8,.6))'
      : answered ? 'radial-gradient(circle at 50% 40%, rgba(34,197,94,.16), rgba(6,30,16,.6))' : 'rgba(255,255,255,.04)';
    const border = cls === 'go' || cls === 'foul' ? 'var(--crimson)' : cls === 'armed' ? 'rgba(177,76,255,.5)' : answered ? 'rgba(34,197,94,.5)' : 'rgba(255,255,255,.14)';
    return `
      <div class="scene-label">${t('synLabel')}</div>
      <div class="tap-zone" style="background:${bg};border-color:${border}" onclick="Kairos.synTap()">
        <div class="title">${title}</div>
        <div class="sub">${sub}</div>
        ${showMs ? `<div class="ms">${S.me.last_reaction_ms} ms</div>` : ''}
      </div>`;
  },

  // ====================================================================
  // VAULT
  // ====================================================================
  vaultNext() {
    const v = S.room.state.vault || { puzzleIdx: 0, round: 0 };
    const round = (v.round || 0) + 1;
    this._patchRoom({ state: Object.assign({}, S.room.state, { vault: { puzzleIdx: round % VAULT_PUZZLES.length, round } }) });
  },
  vaultBet(val) { this._patchMe({ vault_bet: String(val) }); },
  vaultCrack() {
    const v = S.room.state.vault || { puzzleIdx: 0, round: 0 };
    const guess = Number(document.getElementById('vault-guess').value);
    const puzzle = VAULT_PUZZLES[v.puzzleIdx || 0];
    const win = guess === puzzle.answer;
    const wager = S.me.vault_bet === 'all' ? 3 : Number(S.me.vault_bet || 1);
    if (win) {
      KairosAudio.chime();
      this._patchMe({ vault_result: 'won', vault_round: v.round, correct_count: (S.me.correct_count || 0) + 1 });
    } else {
      vibrate([60, 40, 60]);
      this._patchMe({ vault_result: 'lost', vault_round: v.round, sips: Number(S.me.sips || 0) + wager, penalty_count: (S.me.penalty_count || 0) + 1 });
    }
  },
  vaultDrankConfirm() { this._patchMe({ vault_result: 'idle' }); },
  vaultSendSip(targetId) {
    const wager = S.me.vault_bet === 'all' ? 3 : Number(S.me.vault_bet || 1);
    const target = S.players.find(p => p.id === targetId);
    if (!target) return;
    KairosDB.updatePlayer(targetId, { sips: Number(target.sips || 0) + 1 });
    target.sips = Number(target.sips || 0) + 1;
    this._patchMe({ vault_result: 'idle' });
  },
  _vaultHost() {
    const v = S.room.state.vault || { puzzleIdx: 0 };
    const puzzle = VAULT_PUZZLES[v.puzzleIdx || 0];
    return `
      <div class="scene-label">${t('vltTitle')} ${v.puzzleIdx != null ? '· ' + String((v.puzzleIdx || 0) + 1).padStart(2, '0') : ''}</div>
      <div class="vault-box"><div class="vault-dial"><div class="needle"></div><div class="hub"></div></div></div>
      <div class="puzzle-seq">${puzzle.seq.join(' · ')} · <span class="q">?</span></div>
      <div class="scene-sub">${t('vltPlaceBet')}</div>
      <div class="glass" style="padding:16px;width:100%;max-width:440px">
        <div class="scene-label">${t('vltLedger')}</div><div style="height:8px"></div>
        ${this._perfBars()}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary" onclick="Kairos.vaultNext()">${t('vltNextBtn')}</button>
        <button class="btn btn-ghost" onclick="Kairos.goScreen('paradox')">${t('navParadox')} ▶</button>
      </div>`;
  },
  _vaultPlayer() {
    const v = S.room.state.vault || { puzzleIdx: 0, round: 0 };
    const mine = S.me.vault_round === v.round ? S.me.vault_result : 'idle';
    const bet = S.me.vault_bet || '1';
    const betBtn = (val, label) => `<div class="bet-btn ${bet === val ? 'active' : ''}" onclick="Kairos.vaultBet('${val}')">${label}</div>`;
    if (mine === 'won') {
      const others = S.players.filter(p => p.id !== S.me.id);
      return `
        <div class="scene-label">${t('vltTitle')}</div>
        <div class="result-card win"><div style="font-size:22px">✅</div><div style="font-weight:700">${t('vltWonTitle')}</div><div class="scene-sub" style="font-size:12px">${t('vltWonSub')}</div></div>
        <div class="players-row">${others.map(p => `<div class="player-tag" style="cursor:pointer" onclick="Kairos.vaultSendSip('${p.id}')">${escapeHtml(p.name)} +1🥃</div>`).join('') || ''}</div>
        <button class="btn btn-ghost btn-block" onclick="Kairos.vaultDrankConfirm()">OK</button>`;
    }
    if (mine === 'lost') {
      const wager = bet === 'all' ? 3 : Number(bet);
      return `
        <div class="scene-label">${t('vltTitle')}</div>
        <div class="result-card lose"><div style="font-size:22px">🔒</div><div style="font-weight:700">${t('vltLostTitle')}</div><div class="scene-sub" style="font-size:12px">${t('vltLostSub')} (${wager} ${t('perSip')})</div></div>
        <button class="btn btn-primary btn-block" onclick="Kairos.vaultDrankConfirm()">${t('vltDrankBtn')}</button>`;
    }
    return `
      <div class="scene-label">${t('vltConfidence')}</div>
      <div class="bet-row">${betBtn('1', '1')}${betBtn('2', '2')}${betBtn('3', '3')}${betBtn('all', t('vltAllIn'))}</div>
      <input id="vault-guess" type="number" class="text-input" placeholder="?" style="max-width:160px">
      <button class="btn btn-primary btn-block" onclick="Kairos.vaultCrack()">${t('vltCrackBtn')}</button>`;
  },

  // ====================================================================
  // PARADOX
  // ====================================================================
  paraStart() {
    const p = S.room.state.paradox || { round: 0 };
    const round = (p.round || 0) + 1;
    const order = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
    const askIndex = order.findIndex(i => PARADOX_CARDS[i].key === 'c_hot');
    this._patchRoom({ state: Object.assign({}, S.room.state, { paradox: { phase: 'memorize', order, askIndex, round } }) });
    clearTimeout(S._paraTimer);
    S._paraTimer = setTimeout(() => {
      this._patchRoom({ state: Object.assign({}, S.room.state, { paradox: { phase: 'recall', order, askIndex, round } }) });
    }, 3200);
  },
  paraPick(idx) {
    const p = S.room.state.paradox || {};
    if (S.me.paradox_round === p.round) return;
    const correct = idx === p.askIndex;
    if (correct) {
      KairosAudio.chime();
      this._patchMe({ paradox_pick: idx, paradox_round: p.round, paradox_wrong: 0, correct_count: (S.me.correct_count || 0) + 1 });
    } else {
      const wrong = (S.me.paradox_wrong || 0) + 1;
      if (wrong >= 2) {
        vibrate([120, 60, 120]);
        this._patchMe({ paradox_pick: idx, paradox_round: p.round, paradox_wrong: 0, blackout: true, sips: Number(S.me.sips || 0) + 1, penalty_count: (S.me.penalty_count || 0) + 1 });
      } else {
        vibrate(60);
        this._patchMe({ paradox_pick: idx, paradox_round: p.round, paradox_wrong: wrong });
      }
    }
  },
  paraBlackoutReset() { this._patchMe({ blackout: false }); },
  _paradoxHost() {
    const p = S.room.state.paradox || { phase: 'idle' };
    const reveal = p.phase === 'memorize';
    const cards = (p.order || [0, 1, 2, 3, 4]).map(i => PARADOX_CARDS[i]);
    const cardsHtml = `<div class="para-cards">${cards.map(c => `
      <div class="para-card" style="${reveal ? `background:${c.bg};color:#fff` : ''}">${reveal ? t(c.key) : '?'}</div>`).join('')}</div>`;
    const prompt = p.phase === 'memorize' ? t('parMemorize') : p.phase === 'recall' ? t('parRecallTpl', { w: t('c_hot') }) : t('parIdle');
    const picks = p.phase === 'recall' ? S.players.filter(pl => pl.paradox_round === p.round) : [];
    return `
      <div class="scene-label">${t('parLabel')}</div>
      <div class="scene-title" style="font-size:22px">${prompt}</div>
      ${cardsHtml}
      ${picks.length ? `<div class="reaction-feed"><div class="scene-label">${t('synFeedTitle')}</div>${picks.map(pl => `
        <div class="reaction-row ${pl.paradox_pick === p.askIndex ? '' : 'foul'}"><span>${escapeHtml(pl.name)}</span><b>${pl.paradox_pick + 1} ${pl.paradox_pick === p.askIndex ? '✓' : '✗'}</b></div>`).join('')}</div>` : ''}
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
        <button class="btn btn-primary" onclick="Kairos.paraStart()">${p.phase === 'idle' ? t('parStartBtn') : t('parNextBtn')}</button>
        <button class="btn btn-ghost" onclick="Kairos.goScreen('report')">${t('navReport')} ▶</button>
      </div>`;
  },
  _paradoxPlayer() {
    if (S.me.blackout) return `
      <div class="blackout-overlay" onclick="Kairos.paraBlackoutReset()">
        <div class="scene-title" style="color:var(--crimson);letter-spacing:.2em">${t('blackoutTitle')}</div>
        <div class="scene-sub">${t('blackoutSub')}</div>
        <button class="btn btn-ghost" onclick="Kairos.paraBlackoutReset()">${t('blackoutReset')}</button>
      </div>`;
    const p = S.room.state.paradox || { phase: 'idle' };
    const answered = S.me.paradox_round === p.round && p.phase === 'recall';
    if (p.phase !== 'recall') {
      return `<div class="scene-label">${t('parLabel')}</div>
        <div class="scene-title">${p.phase === 'memorize' ? t('parPhoneMem') : t('parPhoneIdle')}</div>`;
    }
    return `
      <div class="scene-label">${t('parLabel')}</div>
      <div class="scene-title" style="font-size:20px">${t('parPhoneRecall')}</div>
      <div class="para-pick-row">${[0, 1, 2, 3, 4].map(i => `<div class="para-pick" style="${answered ? 'opacity:.4' : ''}" onclick="Kairos.paraPick(${i})">${i + 1}</div>`).join('')}</div>
      ${answered ? `<div class="scene-sub">${S.me.paradox_pick === p.askIndex ? '✓' : t('parSubRecall2')}</div>` : ''}`;
  },

  // ====================================================================
  // REPORT
  // ====================================================================
  _scoreOf(p) {
    const avg = p.reaction_count ? p.total_reaction_ms / p.reaction_count : 5000;
    return avg + (p.penalty_count || 0) * 250 - (p.correct_count || 0) * 150;
  },
  _reportBody() {
    const active = S.players.filter(p => p.reaction_count > 0 || p.correct_count > 0 || p.penalty_count > 0 || Number(p.sips) > 0);
    let award = '';
    if (active.length >= 1) {
      const sorted = active.slice().sort((a, b) => this._scoreOf(a) - this._scoreOf(b));
      const best = sorted[0], worst = sorted[sorted.length - 1];
      award = `<div class="award-row">
        <div class="award-card silicon"><div style="font-size:28px">🧠</div><div><div class="scene-label" style="color:#cdbcff">${t('siliconTitle')}</div><div class="scene-title" style="font-size:24px">${escapeHtml(best.name)}</div><div class="scene-sub" style="font-size:12px">${t('siliconSub')}</div></div></div>
        <div class="award-card crash"><div style="font-size:28px">⚠️</div><div><div class="scene-label" style="color:#ff8d9c">${t('crashTitle')}</div><div class="scene-title" style="font-size:24px">${escapeHtml(worst.name)}</div><div class="scene-sub" style="font-size:12px">${t('crashSub')}</div></div></div>
      </div>`;
    } else {
      award = `<div class="scene-sub">${t('noData')}</div>`;
    }
    const total = S.players.reduce((sum, p) => sum + Number(p.sips || 0), 0);
    const maxSips = Math.max(1, ...S.players.map(p => Number(p.sips || 0)));
    return `
      <div class="scene-label">${t('rptTitle')}</div>
      <div class="scene-title">${t('rptSub')}</div>
      ${award}
      <div class="glass" style="padding:16px;width:100%;max-width:440px">
        <div class="scene-label">${t('ledgerTitle')}</div><div style="height:8px"></div>
        <div class="ledger">${S.players.map(p => `
          <div class="ledger-row"><span style="width:80px;font-size:13px;font-weight:600;text-align:left">${escapeHtml(p.name)}</span>
          <div class="ledger-bar"><span style="width:${(Number(p.sips || 0) / maxSips) * 100}%"></span></div>
          <span style="width:42px;text-align:right;font-size:12px;color:rgba(255,255,255,.6)">${Number(p.sips || 0)}</span></div>`).join('')}</div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:12px;color:rgba(255,255,255,.5)"><span>${t('totalSips')}</span><b style="color:#ff8d9c">${total}</b></div>
      </div>`;
  },
  _reportHost() { return this._reportBody() + `<button class="btn btn-primary" onclick="Kairos.playAgain()">${t('playAgainBtn')}</button>`; },
  _reportPlayer() { return this._reportBody(); },
  async playAgain() {
    await KairosDB.updateRoom(S.roomCode, { screen: 'lounge', state: {}, round: 0 });
    for (const p of S.players) {
      await KairosDB.updatePlayer(p.id, {
        sips: 0, ready: false, last_reaction_ms: null, last_round: 0, total_reaction_ms: 0, reaction_count: 0,
        vault_bet: '1', vault_round: 0, vault_result: 'idle', paradox_pick: null, paradox_round: 0,
        paradox_wrong: 0, blackout: false, penalty_count: 0, correct_count: 0,
      });
    }
  },

  // ====================================================================
  // GUIDE
  // ====================================================================
  openGuide() {
    S.guidePrevScreen = S.room.screen === 'guide' ? S.guidePrevScreen : S.room.screen;
    this.goScreen('guide');
  },
  closeGuide() { this.goScreen(S.guidePrevScreen || 'lounge'); },
  submitGuidePass() {
    const v = document.getElementById('guide-pass').value.trim().toLowerCase();
    if (v === 'admin') { S.guideOpenLocal = true; this.render(); }
    else { S.guideOpenLocal = 'wrong'; this.render(); }
  },
  _guideGames() {
    return [
      { icon: '⚡', name: 'Synapse', obj: t('gSynObj'), how: t('gSynHow'), pen: t('gSynPen') },
      { icon: '🔐', name: 'Vault', obj: t('gVltObj'), how: t('gVltHow'), pen: t('gVltPen') },
      { icon: '🌀', name: 'Paradox', obj: t('gParObj'), how: t('gParHow'), pen: t('gParPen') },
    ];
  },
  _guideHost() {
    if (!S.guideOpenLocal) {
      return `
        <div class="scene-title">${t('guideLockTitle')}</div>
        <div class="scene-sub">${t('guideLockSub')}</div>
        <input id="guide-pass" type="password" class="text-input" style="max-width:200px" placeholder="${t('guidePassPlaceholder')}">
        <button class="btn btn-primary" onclick="Kairos.submitGuidePass()">${t('guideUnlockBtn')}</button>
        ${S.guideOpenLocal === 'wrong' ? `<div class="scene-sub" style="color:#ff8d9c">${t('guideWrong')}</div>` : ''}
        <button class="btn btn-ghost" onclick="Kairos.closeGuide()">${t('back')}</button>`;
    }
    return `
      <div class="scene-title">${t('guideTitle')}</div>
      <div class="scene-sub">${t('guideIntro')}</div>
      <div class="guide-grid">
        <div class="guide-card"><h4>📺 ${t('guideDevTV')}</h4><p>${t('guideDevTVd')}</p></div>
        <div class="guide-card"><h4>📱 ${t('guideDevPhone')}</h4><p>${t('guideDevPhoned')}</p></div>
      </div>
      <div class="guide-grid">
        ${this._guideGames().map(g => `
          <div class="guide-card"><h4>${g.icon} ${g.name}</h4>
            <div class="tag">${t('guideObjective')}</div><p>${g.obj}</p>
            <div class="tag">${t('guideHow')}</div><p>${g.how}</p>
            <div class="tag" style="color:#ff8d9c">${t('guidePenalty')}</div><p>${g.pen}</p>
          </div>`).join('')}
      </div>
      <div class="scene-sub" style="max-width:560px">🍸 ${t('guideDrinkNote')}</div>
      <button class="btn btn-ghost" onclick="Kairos.closeGuide()">${t('back')}</button>`;
  },
  _guidePlayer() {
    return `<div class="scene-title">${t('guideOnTV')}</div>`;
  },
};

document.addEventListener('DOMContentLoaded', () => Kairos.boot());

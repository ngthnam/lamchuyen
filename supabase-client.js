'use strict';

/* ─── KAIROS DATA LAYER ───
   Thin wrapper around Supabase: one row per room (kairos_rooms) is the
   shared truth the host writes to, one row per phone (kairos_players).
   Realtime (postgres_changes) pushes every change to every connected
   device, which is what makes the TV and the phones stay in sync.
   Uses the same Supabase project as the FamilyHub (dodo_fam) app.
──────────────────────────────── */

const SB_URL = 'https://hizurlijfsjoylvzhxky.supabase.co';
const SB_KEY = 'sb_publishable_cDjJwRv5wLMl3Ox3PGgT_w_DRdH7NI8';

const KairosDB = {
  client: null,
  _roomChannel: null,
  _playersChannel: null,

  init() {
    if (!window.supabase) throw new Error('Supabase SDK not loaded');
    this.client = window.supabase.createClient(SB_URL, SB_KEY, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
    return this.client;
  },

  randomCode() {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid mix-ups
    let code = '';
    for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    return code;
  },

  async createRoom() {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.randomCode();
      const { data, error } = await this.client
        .from('kairos_rooms')
        .insert({ code, screen: 'lounge', state: {} })
        .select()
        .single();
      if (!error) return data;
      if (error.code !== '23505') throw error; // not a unique-violation, bail
    }
    throw new Error('Could not allocate a room code, try again.');
  },

  async getRoom(code) {
    const { data, error } = await this.client.from('kairos_rooms').select('*').eq('code', code).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateRoom(code, patch) {
    const { error } = await this.client.from('kairos_rooms').update(patch).eq('code', code);
    if (error) console.error('updateRoom error:', error);
  },

  subscribeRoom(code, onChange) {
    this._roomChannel = this.client
      .channel('kairos_room_' + code)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kairos_rooms', filter: `code=eq.${code}` },
        payload => onChange(payload.new))
      .subscribe();
    return this._roomChannel;
  },

  async joinRoom(code, name, drink, isHost) {
    const { data, error } = await this.client
      .from('kairos_players')
      .insert({ room_code: code, name, drink, is_host: !!isHost })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePlayer(id, patch) {
    const { error } = await this.client.from('kairos_players').update(patch).eq('id', id);
    if (error) console.error('updatePlayer error:', error);
  },

  async listPlayers(code) {
    const { data, error } = await this.client
      .from('kairos_players')
      .select('*')
      .eq('room_code', code)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  subscribePlayers(code, onChange) {
    this._playersChannel = this.client
      .channel('kairos_players_' + code)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kairos_players', filter: `room_code=eq.${code}` },
        payload => onChange(payload.eventType, payload.new || payload.old))
      .subscribe();
    return this._playersChannel;
  },

  unsubscribeAll() {
    if (this._roomChannel) this.client.removeChannel(this._roomChannel);
    if (this._playersChannel) this.client.removeChannel(this._playersChannel);
    this._roomChannel = null;
    this._playersChannel = null;
  },
};

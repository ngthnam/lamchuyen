# KAIROS — The Adult Lounge

A cinematic drinking game for TV + phone. One screen hosts (the "TV"),
everyone else joins from their own phone with a room code — real cross-device
multiplayer over Supabase Realtime, hosted as a static site on GitHub Pages.

Three mini-games: **Synapse** (reflex), **The Vault** (IQ puzzle + sip
wager), **Paradox** (inverted memory) — plus a Lounge, a live Dashboard, a
Hangover Report, and a host-only Guide.

## One-time setup (do this before the first game)

This app reuses the same Supabase project as the `dodo_fam` FamilyHub app,
just with its own tables. Run the schema once:

1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/hizurlijfsjoylvzhxky/sql/new)
   for project `hizurlijfsjoylvzhxky`.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it.
   It's idempotent — safe to re-run if you ever need to.

That creates `kairos_rooms` / `kairos_players`, enables Realtime on both, and
opens row-level security with permissive policies (same casual trust model as
the existing `fh_store` table — anyone with the public/anon key can read and
write, there is no login). Good enough for a party game among friends; don't
put anything sensitive in it.

## Play

1. Open the site on the TV / laptop connected to the TV → **"Host on this
   screen"**. It generates a room code and QR.
2. Everyone else scans the QR (or opens the site and taps **"Join with a room
   code"**) on their own phone, enters their name + drink, and they're in.
3. The host drives the flow from the TV (arm Synapse rounds, reveal Vault
   puzzles, flip Paradox cards); phones are personal controllers.
4. **Hangover Report** at the end shows the sip ledger and two awards.

For a full walkthrough of every screen, recommended player counts, pacing
tips, and — important for whoever's hosting — *when* to fire each plot twist
for maximum effect, see **[HOST_GUIDE.md](HOST_GUIDE.md)** (in Vietnamese).
Read it before the session; don't project it on the shared screen, since the
plot-twist timing section is meant to stay a host secret.

A room never expires automatically — if you want to clean up old sessions,
run this in the SQL editor occasionally:
```sql
delete from kairos_rooms where updated_at < now() - interval '12 hours';
```

## Local development

No build step. Just serve the folder statically, e.g.:
```
npx serve .
```
Then open it in two browser tabs (or one laptop + one phone on the same
Wi-Fi using the laptop's LAN IP) to test the host/player sync.

## Deployment

Static site on GitHub Pages, served straight from `main` — push to `main`
and Pages redeploys automatically.

## Notes on fidelity to the original design spec

- Audio is procedurally synthesized via the Web Audio API (a rising drone
  for tension, a low "braam" stinger for penalties, a chime for wins) rather
  than licensed orchestral samples — there's no copyright-cleared Hans
  Zimmer-style score to ship in a public repo, so this is a from-scratch
  approximation of the brief, not a literal recreation.
- Reaction times in Synapse are measured against a shared timestamp written
  by the host, but each phone's local clock determines exactly when it sees
  "go" — fine for a fun party game, not millisecond-fair esports timing.

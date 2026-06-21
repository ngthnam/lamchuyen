-- KAIROS — The Adult Lounge
-- Run this once in the Supabase SQL Editor for the project used by dodo_fam
-- (https://hizurlijfsjoylvzhxky.supabase.co). Safe to re-run (uses IF NOT EXISTS / OR REPLACE).

create extension if not exists pgcrypto;

-- One row per game room. The TV/host screen owns this row.
create table if not exists kairos_rooms (
  code         text primary key,
  screen       text not null default 'lounge',
  lang         text not null default 'vi',
  state        jsonb not null default '{}'::jsonb,
  round        integer not null default 0,
  flash        boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- One row per player phone that joined a room.
create table if not exists kairos_players (
  id                 uuid primary key default gen_random_uuid(),
  room_code          text not null references kairos_rooms(code) on delete cascade,
  name               text not null,
  drink              text not null default 'spirit',
  sips               numeric not null default 0,
  is_host            boolean not null default false,
  ready              boolean not null default false,

  -- Synapse (reflex round)
  last_reaction_ms   integer,                 -- -1 means "fouled" (tapped early)
  last_round         integer not null default 0,
  total_reaction_ms  bigint not null default 0,
  reaction_count     integer not null default 0,

  -- The Vault (puzzle + sip wager)
  vault_bet          text not null default '1',
  vault_round        integer not null default 0,
  vault_result       text not null default 'idle', -- idle | won | lost

  -- Paradox (inverted memory)
  paradox_pick       integer,
  paradox_round      integer not null default 0,
  paradox_wrong       integer not null default 0,
  blackout           boolean not null default false,

  -- Report card aggregates
  penalty_count      integer not null default 0,
  correct_count      integer not null default 0,

  -- Plot-twist: The Mole — secret per-player flags, never exposed to
  -- anyone but the player themselves on the client.
  is_mole            boolean not null default false,
  mole_shield        boolean not null default false,

  joined_at          timestamptz not null default now(),
  last_seen          timestamptz not null default now()
);

-- Added after the initial release — safe no-ops on a fresh table, but
-- required for rooms created before the plot-twist feature shipped.
alter table kairos_players add column if not exists is_mole boolean not null default false;
alter table kairos_players add column if not exists mole_shield boolean not null default false;

create index if not exists kairos_players_room_idx on kairos_players(room_code);

-- Keep updated_at fresh on every room write.
create or replace function kairos_touch_room()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists kairos_rooms_touch on kairos_rooms;
create trigger kairos_rooms_touch before update on kairos_rooms
  for each row execute function kairos_touch_room();

-- Casual party game — open read/write with the publishable (anon) key, same
-- trust model as the existing fh_store table used by FamilyHub.
alter table kairos_rooms enable row level security;
alter table kairos_players enable row level security;

drop policy if exists kairos_rooms_all on kairos_rooms;
create policy kairos_rooms_all on kairos_rooms for all using (true) with check (true);

drop policy if exists kairos_players_all on kairos_players;
create policy kairos_players_all on kairos_players for all using (true) with check (true);

-- Enable Realtime change feeds so the TV and phones stay in sync.
-- (guarded — "alter publication add table" errors if already a member,
-- so this checks first to stay safe to re-run)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kairos_rooms'
  ) then
    alter publication supabase_realtime add table kairos_rooms;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'kairos_players'
  ) then
    alter publication supabase_realtime add table kairos_players;
  end if;
end $$;

-- Housekeeping: rooms older than 12h are stale party sessions, safe to prune
-- manually any time with:
--   delete from kairos_rooms where updated_at < now() - interval '12 hours';

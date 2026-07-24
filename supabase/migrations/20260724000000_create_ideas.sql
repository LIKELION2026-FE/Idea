create table if not exists public.ideas (
  id text primary key,
  member_id text not null,
  member_name text not null,
  track text not null,
  title text not null,
  target_user text not null,
  problem text not null,
  current_solution text not null default '',
  evidence text not null default '',
  created_at timestamptz not null default now(),
  analysis_status text not null default 'pending',
  analysis jsonb,
  analysis_message text
);

create index if not exists ideas_created_at_idx on public.ideas (created_at desc);
create index if not exists ideas_track_idx on public.ideas (track);

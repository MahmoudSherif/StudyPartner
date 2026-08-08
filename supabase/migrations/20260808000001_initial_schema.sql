-- MotivaMate — initial schema
--
-- Design principles, and why they differ from the Firestore model this replaces:
--
--  1. Relational, not JSON blobs. The old backend stored each collection as one
--     document per user (`userData/{uid}_study-sessions`) holding an entire
--     array. Every edit rewrote the whole array, so two devices editing at once
--     silently lost data. Here each row is a row.
--
--  2. Points are DERIVED, never stored. Challenge scores live in a view over
--     completions. In the old model clients wrote `pointsSummary` directly,
--     which meant a user could simply declare themselves the winner. There is
--     no column to forge here.
--
--  3. Row Level Security on every table, with no catch-all. The previous
--     ruleset ended in a wildcard that granted every signed-in user full read
--     and write access to the entire database.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

-- Public projection: readable by any authenticated user so challenge
-- participants can be shown by name. Deliberately holds NO email address --
-- the old design kept names on the same document as email and private notes,
-- so showing a name leaked both.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint display_name_length check (display_name is null or char_length(display_name) <= 50)
);

-- Private per-user preferences.
create table public.user_settings (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  theme         text not null default 'dark',
  settings      jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Study tracking
-- ---------------------------------------------------------------------------

create table public.subjects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 100),
  color          text not null default '#14b8a6',
  -- Denormalised running total in seconds. Derivable from study_sessions, but
  -- kept because components read subject.totalTime directly; the app maintains
  -- it the same way it always has.
  total_time     integer not null default 0 check (total_time >= 0),
  goal           integer check (goal is null or goal >= 0),
  daily_target   integer check (daily_target is null or daily_target >= 0),
  weekly_target  integer check (weekly_target is null or weekly_target >= 0),
  created_at     timestamptz not null default now()
);
create index subjects_user_idx on public.subjects(user_id);

create table public.study_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject_id  uuid references public.subjects(id) on delete set null,
  start_time  timestamptz not null,
  end_time    timestamptz,
  -- Seconds. Bounded so a bad client cannot inflate lifetime totals.
  duration    integer not null default 0 check (duration between 0 and 86400),
  completed   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index study_sessions_user_start_idx on public.study_sessions(user_id, start_time desc);

create table public.focus_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default 'Focus session' check (char_length(title) <= 200),
  duration    integer not null default 0 check (duration between 0 and 86400),
  start_time  timestamptz not null,
  end_time    timestamptz,
  completed   boolean not null default false,
  is_running  boolean not null default false,
  category    text check (category is null or char_length(category) <= 50),
  notes       text check (notes is null or char_length(notes) <= 5000),
  created_at  timestamptz not null default now()
);
create index focus_sessions_user_start_idx on public.focus_sessions(user_id, start_time desc);
-- At most one running focus session per user; the old model kept this on the
-- profile document and could end up with several.
create unique index focus_sessions_one_running_per_user
  on public.focus_sessions(user_id) where is_running;

create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subject_id      uuid references public.subjects(id) on delete set null,
  title           text not null check (char_length(title) between 1 and 200),
  description     text check (description is null or char_length(description) <= 2000),
  completed       boolean not null default false,
  completed_at    timestamptz,
  priority        text not null default 'medium' check (priority in ('low','medium','high')),
  due_date        timestamptz,
  estimated_time  integer check (estimated_time is null or estimated_time between 0 and 100000),
  created_at      timestamptz not null default now()
);
create index tasks_user_idx on public.tasks(user_id, created_at desc);

create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  description   text check (description is null or char_length(description) <= 1000),
  target        integer not null default 0 check (target >= 0),
  current       integer not null default 0 check (current >= 0),
  deadline      timestamptz,
  category      text not null default 'custom' check (category in ('daily','weekly','monthly','custom')),
  is_completed  boolean not null default false,
  created_at    timestamptz not null default now()
);
create index goals_user_idx on public.goals(user_id);

create table public.achievements (
  user_id      uuid not null references auth.users(id) on delete cascade,
  -- Stable key from src/lib/constants.ts, e.g. 'first-session'.
  key          text not null,
  unlocked     boolean not null default false,
  unlocked_at  timestamptz,
  progress     integer not null default 0 check (progress >= 0),
  primary key (user_id, key)
);

create table public.calendar_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject_id   uuid references public.subjects(id) on delete set null,
  title        text not null check (char_length(title) between 1 and 200),
  description  text check (description is null or char_length(description) <= 2000),
  event_date   date not null,
  start_time   time,
  end_time     time,
  type         text not null default 'study' check (type in ('study','exam','deadline','reminder','break')),
  is_all_day   boolean not null default false,
  color        text,
  created_at   timestamptz not null default now()
);
create index calendar_events_user_date_idx on public.calendar_events(user_id, event_date);

create table public.sticky_notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '' check (char_length(title) <= 200),
  content     text not null default '' check (char_length(content) <= 20000),
  color       text not null default '#fde68a',
  position_x  double precision not null default 0,
  position_y  double precision not null default 0,
  width       double precision not null default 250,
  height      double precision not null default 200,
  is_pinned   boolean not null default false,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index sticky_notes_user_idx on public.sticky_notes(user_id);

-- ---------------------------------------------------------------------------
-- Challenges
-- ---------------------------------------------------------------------------

create table public.challenges (
  id           uuid primary key default gen_random_uuid(),
  -- Generated server-side by a CSPRNG (see create_challenge). The old client
  -- derived codes from Math.random(), whose state is recoverable, and only
  -- used 6 characters.
  code         text not null unique check (code ~ '^[A-Z0-9]{6,16}$'),
  title        text not null check (char_length(title) between 1 and 200),
  description  text not null default '' check (char_length(description) <= 2000),
  created_by   uuid not null references auth.users(id) on delete cascade,
  is_active    boolean not null default true,
  end_date     timestamptz,
  -- Written only when the challenge ends, only by end_challenge().
  final_points jsonb,
  winner_ids   uuid[],
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index challenges_created_by_idx on public.challenges(created_by);
create index challenges_code_idx on public.challenges(code);

create table public.challenge_participants (
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  joined_at     timestamptz not null default now(),
  primary key (challenge_id, user_id)
);
create index challenge_participants_user_idx on public.challenge_participants(user_id);

create table public.challenge_tasks (
  id            uuid primary key default gen_random_uuid(),
  challenge_id  uuid not null references public.challenges(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  description   text check (description is null or char_length(description) <= 2000),
  -- Bounded: the old backend accepted NaN and Infinity, which poisoned every
  -- participant's total, and 1e308, which dominated any leaderboard.
  points        integer not null default 0 check (points between 0 and 10000),
  created_at    timestamptz not null default now()
);
create index challenge_tasks_challenge_idx on public.challenge_tasks(challenge_id);

-- One row per (task, user). Replaces the client-written `completions` map
-- whose keys were arbitrary strings, so any uid could be credited.
create table public.challenge_task_completions (
  task_id       uuid not null references public.challenge_tasks(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  primary key (task_id, user_id)
);
create index challenge_task_completions_user_idx on public.challenge_task_completions(user_id);

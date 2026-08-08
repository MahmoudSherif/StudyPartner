-- Link a focus session to at most one goal.
--
-- Until now stopping a session credited every goal whose category window was
-- currently open -- one 30 minute session advanced the daily, the weekly, the
-- monthly and every custom goal at once, so progress bore no relation to what
-- the user had actually worked on. A session now names the single goal it
-- counts toward, or no goal at all.
--
-- Nullable on purpose, and with no backfill: `null` means "counts toward no
-- goal", which is exactly the right reading for every session recorded before
-- this column existed. Those rows already credited whatever they were going to
-- credit, and there is no way to know retroactively which goal was intended.

-- Needed as the target of the composite foreign key below. `id` is already the
-- primary key, so this adds no meaningful storage cost -- it exists to let the
-- FK carry `user_id` along with it.
alter table public.goals
  add constraint goals_id_user_key unique (id, user_id);

alter table public.focus_sessions
  add column goal_id uuid;

-- The FK deliberately spans (goal_id, user_id) rather than goal_id alone, so
-- Postgres itself guarantees a session can only ever point at a goal belonging
-- to the same user. RLS already restricts both tables to `auth.uid()`, but that
-- governs which rows a request may touch, not whether the two columns agree --
-- a crafted write could otherwise attach one user's session to another user's
-- goal and inflate its progress.
--
-- `on delete set null (goal_id)` names the column explicitly: the default form
-- would try to null `user_id` too, which is `not null`, so deleting a goal
-- would fail outright. Deleting a goal must leave its sessions intact, since
-- they are also the user's study history and streak record; they simply stop
-- counting toward anything.
alter table public.focus_sessions
  add constraint focus_sessions_goal_fk
    foreign key (goal_id, user_id)
    references public.goals (id, user_id)
    on delete set null (goal_id);

-- Reading a goal's sessions is the query this column exists to serve.
create index if not exists focus_sessions_goal_idx
  on public.focus_sessions (goal_id)
  where goal_id is not null;

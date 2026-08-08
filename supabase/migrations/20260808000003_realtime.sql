-- MotivaMate — enable Supabase Realtime for the tables the client subscribes to.
--
-- Realtime is NOT on by default. A `postgres_changes` subscription against a
-- table that is not in the `supabase_realtime` publication succeeds -- the
-- channel joins, no error is raised -- and then simply never delivers an event.
-- That silent success is why this was easy to miss: the app subscribed to ten
-- tables and cross-device sync had never worked.
--
-- Two things are required per table:
--
--   1. Membership of the `supabase_realtime` publication, which is what makes
--      Postgres write the change to the logical replication slot at all.
--
--   2. `replica identity full`. The default (`default`) puts only the primary
--      key in the WAL record for UPDATE and DELETE. Realtime evaluates the
--      client's row filter -- every subscription here uses
--      `user_id=eq.<uuid>` -- against that record, so with the default identity
--      a delete carries no user_id, fails the filter, and is dropped. The cost
--      is a wider WAL row; these tables are small and low-churn.
--
-- Row Level Security still applies on top: Realtime re-checks the subscriber's
-- policies before delivering, so a user only ever receives their own rows.

-- The publication exists on every Supabase project, but create it if absent so
-- this migration also applies to a bare Postgres used for local testing.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

do $$
declare
  target text;
  -- Personal collections use a `user_id=eq.` filter; the challenge tables are
  -- shared and are filtered by RLS membership instead.
  tables constant text[] := array[
    'subjects',
    'study_sessions',
    'focus_sessions',
    'tasks',
    'goals',
    'sticky_notes',
    'calendar_events',
    'achievements',
    'challenges',
    'challenge_tasks',
    'challenge_task_completions',
    'challenge_participants'
  ];
begin
  foreach target in array tables loop
    execute format('alter table public.%I replica identity full', target);

    -- `alter publication ... add table` errors if the table is already a
    -- member, which would abort the whole migration on re-run.
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end
$$;

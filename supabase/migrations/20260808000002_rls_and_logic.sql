-- MotivaMate — derived views, server-side logic, and Row Level Security.

-- ---------------------------------------------------------------------------
-- Helpers
--
-- These are SECURITY DEFINER on purpose. A policy on `challenges` that queries
-- `challenge_participants` while a policy on `challenge_participants` queries
-- `challenges` recurses forever. Reading through a definer function bypasses
-- RLS on the inner table and breaks the cycle. Each one is STABLE, takes only
-- an id, and returns a boolean, so it leaks nothing beyond membership.
-- ---------------------------------------------------------------------------

create or replace function public.is_challenge_member(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.challenge_participants
    where challenge_id = cid and user_id = auth.uid()
  ) or exists (
    select 1 from public.challenges
    where id = cid and created_by = auth.uid()
  );
$$;

create or replace function public.is_challenge_owner(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.challenges where id = cid and created_by = auth.uid()
  );
$$;

-- Keeps updated_at honest; clients cannot backdate it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger challenges_touch before update on public.challenges
  for each row execute function public.touch_updated_at();
create trigger sticky_notes_touch before update on public.sticky_notes
  for each row execute function public.touch_updated_at();
create trigger user_settings_touch before update on public.user_settings
  for each row execute function public.touch_updated_at();

-- Create a profile row automatically for every new account, so the app never
-- has to deal with a signed-in user who has no profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Derived scoring
--
-- There is no stored points column anywhere. Scores are computed from
-- completions on read, so there is nothing for a client to write, and no way
-- for a stale cached total to disagree with reality.
-- ---------------------------------------------------------------------------

create or replace view public.challenge_leaderboard as
  select
    ct.challenge_id,
    ctc.user_id,
    sum(ct.points)::integer  as points,
    count(*)::integer        as tasks_completed
  from public.challenge_task_completions ctc
  join public.challenge_tasks ct on ct.id = ctc.task_id
  group by ct.challenge_id, ctc.user_id;

create or replace view public.challenge_totals as
  select challenge_id, coalesce(sum(points), 0)::integer as max_points
  from public.challenge_tasks
  group by challenge_id;

-- Views run with the privileges of the querying user, so the underlying RLS
-- on the base tables still applies to reads through them.
alter view public.challenge_leaderboard set (security_invoker = on);
alter view public.challenge_totals set (security_invoker = on);

-- ---------------------------------------------------------------------------
-- Challenge operations
--
-- These are the only way to create, join, or score a challenge. Each derives
-- the acting user from auth.uid() rather than a parameter -- the previous
-- implementation passed the uid in from the client, so a caller could credit
-- or revoke anyone's progress by changing an argument.
-- ---------------------------------------------------------------------------

-- Crockford-style alphabet: no I, L, O, U, 0 or 1, so codes survive being read
-- aloud. gen_random_bytes is a CSPRNG.
create or replace function public.generate_challenge_code()
returns text
language plpgsql
volatile
-- pgcrypto lives in the `extensions` schema on Supabase but in `public` on a
-- stock Postgres. Listing both means gen_random_bytes resolves either way;
-- without this the function inherits the caller's `search_path = public` and
-- fails with "function gen_random_bytes(integer) does not exist".
set search_path = public, extensions
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..10 loop
    result := result || substr(alphabet, 1 + (get_byte(gen_random_bytes(1), 0) % length(alphabet)), 1);
  end loop;
  return result;
end;
$$;

create or replace function public.create_challenge(
  p_title text,
  p_description text default '',
  p_end_date timestamptz default null
)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  new_row public.challenges;
  attempts integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_title is null or char_length(btrim(p_title)) = 0 then
    raise exception 'Title is required' using errcode = '22023';
  end if;
  if p_end_date is not null and p_end_date <= now() then
    raise exception 'End date must be in the future' using errcode = '22023';
  end if;

  loop
    attempts := attempts + 1;
    new_code := public.generate_challenge_code();
    begin
      insert into public.challenges (code, title, description, created_by, end_date)
      values (new_code, btrim(p_title), coalesce(btrim(p_description), ''), auth.uid(), p_end_date)
      returning * into new_row;
      exit;
    exception when unique_violation then
      if attempts >= 5 then
        raise exception 'Could not allocate a unique challenge code';
      end if;
    end;
  end loop;

  insert into public.challenge_participants (challenge_id, user_id)
  values (new_row.id, auth.uid())
  on conflict do nothing;

  return new_row;
end;
$$;

-- Joining is a function rather than a SELECT-then-INSERT because it is the one
-- operation that must read a challenge the caller cannot yet see. Keeping it
-- here means the `challenges` SELECT policy can be members-only, which makes
-- enumerating the table impossible rather than merely inconvenient.
create or replace function public.join_challenge(p_code text)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.challenges;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select * into target from public.challenges
  where code = upper(btrim(p_code));

  if not found then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;
  if not target.is_active then
    raise exception 'This challenge has ended' using errcode = '22023';
  end if;

  insert into public.challenge_participants (challenge_id, user_id)
  values (target.id, auth.uid())
  on conflict do nothing;

  return target;
end;
$$;

-- Toggles the CALLER's completion of a task. There is no user parameter, so
-- there is nothing to tamper with.
create or replace function public.toggle_challenge_task(p_task_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  now_completed boolean;
  challenge_active boolean;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select ct.challenge_id, c.is_active into cid, challenge_active
  from public.challenge_tasks ct
  join public.challenges c on c.id = ct.challenge_id
  where ct.id = p_task_id;

  if cid is null then
    raise exception 'Task not found' using errcode = 'P0002';
  end if;
  if not challenge_active then
    raise exception 'This challenge has ended' using errcode = '22023';
  end if;
  if not public.is_challenge_member(cid) then
    raise exception 'Not a member of this challenge' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.challenge_task_completions
    where task_id = p_task_id and user_id = auth.uid()
  ) then
    delete from public.challenge_task_completions
    where task_id = p_task_id and user_id = auth.uid();
    now_completed := false;
  else
    insert into public.challenge_task_completions (task_id, user_id)
    values (p_task_id, auth.uid());
    now_completed := true;
  end if;

  return now_completed;
end;
$$;

-- Freezes the result. Only the creator may call it, the winner is computed
-- from the leaderboard rather than supplied, and it is idempotent -- the old
-- implementation snapshotted final scores on the first task write because a
-- future end_date read as "already ended", locking in zeroes forever.
create or replace function public.end_challenge(p_challenge_id uuid)
returns public.challenges
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.challenges;
  best integer;
  winners uuid[];
  totals jsonb;
begin
  if not public.is_challenge_owner(p_challenge_id) then
    raise exception 'Only the challenge creator can end it' using errcode = '42501';
  end if;

  select * into result from public.challenges where id = p_challenge_id;
  if result.final_points is not null then
    return result; -- already ended; never recompute a frozen result
  end if;

  select coalesce(jsonb_object_agg(user_id::text, points), '{}'::jsonb)
    into totals
  from public.challenge_leaderboard where challenge_id = p_challenge_id;

  select max(points) into best
  from public.challenge_leaderboard where challenge_id = p_challenge_id;

  if best is not null and best > 0 then
    select array_agg(user_id) into winners
    from public.challenge_leaderboard
    where challenge_id = p_challenge_id and points = best;
  else
    winners := '{}';
  end if;

  update public.challenges
     set is_active = false,
         end_date = coalesce(end_date, now()),
         final_points = totals,
         winner_ids = winners
   where id = p_challenge_id
   returning * into result;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Enabled on every table. There is deliberately no permissive catch-all.
-- ---------------------------------------------------------------------------

alter table public.profiles                    enable row level security;
alter table public.user_settings               enable row level security;
alter table public.subjects                    enable row level security;
alter table public.study_sessions              enable row level security;
alter table public.focus_sessions              enable row level security;
alter table public.tasks                       enable row level security;
alter table public.goals                       enable row level security;
alter table public.achievements                enable row level security;
alter table public.calendar_events             enable row level security;
alter table public.sticky_notes                enable row level security;
alter table public.challenges                  enable row level security;
alter table public.challenge_participants      enable row level security;
alter table public.challenge_tasks             enable row level security;
alter table public.challenge_task_completions  enable row level security;

-- Profiles: the public projection. Name and avatar only -- no email.
create policy profiles_select on public.profiles
  for select to authenticated using (true);
create policy profiles_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy user_settings_all on public.user_settings
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Private per-user data. One policy each, owner-only, no exceptions.
create policy subjects_all on public.subjects
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy study_sessions_all on public.study_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy focus_sessions_all on public.focus_sessions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy tasks_all on public.tasks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy goals_all on public.goals
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy achievements_all on public.achievements
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy calendar_events_all on public.calendar_events
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy sticky_notes_all on public.sticky_notes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Challenges: visible only to members. Discovery happens through
-- join_challenge(code), so there is no query that can list other people's
-- challenges even one at a time.
create policy challenges_select on public.challenges
  for select to authenticated using (public.is_challenge_member(id));
-- Insert/update go through create_challenge/end_challenge; direct edits are
-- limited to the creator and cannot touch the frozen result columns.
create policy challenges_update on public.challenges
  for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
create policy challenges_delete on public.challenges
  for delete to authenticated using (created_by = auth.uid());

create policy challenge_participants_select on public.challenge_participants
  for select to authenticated using (public.is_challenge_member(challenge_id));
-- Leaving a challenge is allowed; removing someone else is not.
create policy challenge_participants_delete on public.challenge_participants
  for delete to authenticated using (user_id = auth.uid());

create policy challenge_tasks_select on public.challenge_tasks
  for select to authenticated using (public.is_challenge_member(challenge_id));
-- Only the creator defines the tasks and what they are worth.
create policy challenge_tasks_insert on public.challenge_tasks
  for insert to authenticated with check (public.is_challenge_owner(challenge_id));
create policy challenge_tasks_update on public.challenge_tasks
  for update to authenticated
  using (public.is_challenge_owner(challenge_id))
  with check (public.is_challenge_owner(challenge_id));
create policy challenge_tasks_delete on public.challenge_tasks
  for delete to authenticated using (public.is_challenge_owner(challenge_id));

create policy challenge_task_completions_select on public.challenge_task_completions
  for select to authenticated
  using (exists (
    select 1 from public.challenge_tasks ct
    where ct.id = task_id and public.is_challenge_member(ct.challenge_id)
  ));
-- Writes go through toggle_challenge_task(). These policies are the backstop
-- that makes crediting another user impossible even via a direct table write.
create policy challenge_task_completions_insert on public.challenge_task_completions
  for insert to authenticated with check (user_id = auth.uid());
create policy challenge_task_completions_delete on public.challenge_task_completions
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.challenge_leaderboard, public.challenge_totals to authenticated;
grant execute on function
  public.create_challenge(text, text, timestamptz),
  public.join_challenge(text),
  public.toggle_challenge_task(uuid),
  public.end_challenge(uuid),
  public.is_challenge_member(uuid),
  public.is_challenge_owner(uuid)
  to authenticated;

-- The anon role gets nothing. Every table above requires an authenticated JWT.
revoke all on all tables in schema public from anon;

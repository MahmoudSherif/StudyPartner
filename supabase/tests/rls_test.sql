-- Security regression tests for the MotivaMate schema.
--
-- Each block impersonates a real signed-in user by setting the JWT claims the
-- API gateway would set, then asserts that the policies behave. Every case here
-- corresponds to a vulnerability that existed in the Firebase implementation.
--
-- Run: psql -f supabase/tests/rls_test.sql
-- Any failure raises an exception and aborts.

\set ON_ERROR_STOP on
\set QUIET on
\pset pager off

begin;

-- Two accounts. The trigger seeds profiles/user_settings for each.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@example.com', 'x', now(), '{"display_name":"Alice"}'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mallory@example.com', 'x', now(), '{"display_name":"Mallory"}');

create or replace function pg_temp.become(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid::text, 'role', 'authenticated')::text, true);
end;
$$;

create or replace function pg_temp.check(label text, condition boolean) returns void language plpgsql as $$
begin
  if condition then
    raise notice 'PASS  %', label;
  else
    raise exception 'FAIL  %', label;
  end if;
end;
$$;

-- ===========================================================================
-- 1. Private data is not readable across accounts
-- ===========================================================================
select pg_temp.become('11111111-1111-1111-1111-111111111111');
insert into public.tasks (user_id, title) values ('11111111-1111-1111-1111-111111111111', 'Alice private task');
insert into public.sticky_notes (user_id, title, content) values ('11111111-1111-1111-1111-111111111111', 'Diary', 'secret');
select pg_temp.check('alice sees her own task', (select count(*) from public.tasks) = 1);

select pg_temp.become('22222222-2222-2222-2222-222222222222');
select pg_temp.check('mallory cannot read alice tasks',  (select count(*) from public.tasks) = 0);
select pg_temp.check('mallory cannot read alice notes',  (select count(*) from public.sticky_notes) = 0);

-- The old backend let any signed-in user write to any document.
do $$
begin
  begin
    update public.tasks set title = 'hijacked';
    if (select count(*) from public.tasks where title = 'hijacked') > 0 then
      raise exception 'FAIL  mallory modified alice task';
    end if;
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS  mallory cannot modify alice tasks';
end $$;

-- Writing a row owned by someone else must be refused, not silently accepted.
do $$
begin
  begin
    insert into public.tasks (user_id, title) values ('11111111-1111-1111-1111-111111111111', 'forged');
    raise exception 'FAIL  mallory inserted a task owned by alice';
  exception when insufficient_privilege then
    raise notice 'PASS  mallory cannot insert rows owned by alice';
  end;
end $$;

-- ===========================================================================
-- 2. Profiles expose a name, never an email
-- ===========================================================================
select pg_temp.check('public profile is readable across accounts',
  (select count(*) from public.profiles where id = '11111111-1111-1111-1111-111111111111') = 1);
select pg_temp.check('profiles table has no email column',
  (select count(*) from information_schema.columns
    where table_schema='public' and table_name='profiles' and column_name='email') = 0);

-- ===========================================================================
-- 3. Challenges cannot be enumerated
-- ===========================================================================
select pg_temp.become('11111111-1111-1111-1111-111111111111');
select id as alice_challenge from public.create_challenge('Alice Challenge', 'private', now() + interval '7 days') \gset

select pg_temp.become('22222222-2222-2222-2222-222222222222');
select pg_temp.check('mallory cannot list challenges she is not in',
  (select count(*) from public.challenges) = 0);
select pg_temp.check('mallory cannot read the invite code of a challenge she is not in',
  (select count(*) from public.challenges where id = :'alice_challenge'::uuid) = 0);

-- ===========================================================================
-- 4. Only the creator defines tasks and what they are worth
-- ===========================================================================
select pg_temp.become('11111111-1111-1111-1111-111111111111');
insert into public.challenge_tasks (challenge_id, title, points)
values (:'alice_challenge'::uuid, 'Read a chapter', 10)
returning id as task_a \gset
insert into public.challenge_tasks (challenge_id, title, points)
values (:'alice_challenge'::uuid, 'Write notes', 30)
returning id as task_b \gset

-- Mallory joins with the code, which is the only supported way in.
select code as alice_code from public.challenges where id = :'alice_challenge'::uuid \gset
select pg_temp.become('22222222-2222-2222-2222-222222222222');
select public.join_challenge(:'alice_code');
select pg_temp.check('mallory can join with a valid code',
  (select count(*) from public.challenges where id = :'alice_challenge'::uuid) = 1);

do $$
begin
  begin
    insert into public.challenge_tasks (challenge_id, title, points)
    values ((select id from public.challenges limit 1), 'Free points for me', 9999);
    raise exception 'FAIL  non-owner added a challenge task';
  exception when insufficient_privilege then
    raise notice 'PASS  non-owner cannot add challenge tasks';
  end;
end $$;

-- ===========================================================================
-- 5. A user cannot credit anyone but themselves
-- ===========================================================================
do $$
begin
  begin
    insert into public.challenge_task_completions (task_id, user_id)
    values ((select id from public.challenge_tasks limit 1), '11111111-1111-1111-1111-111111111111');
    raise exception 'FAIL  mallory credited a completion to alice';
  exception when insufficient_privilege then
    raise notice 'PASS  mallory cannot credit completions to another user';
  end;
end $$;

-- Point totals are derived, so there is no column to inflate.
select pg_temp.check('challenges table has no stored points column',
  (select count(*) from information_schema.columns
    where table_schema='public' and table_name='challenges'
      and column_name in ('points','points_summary','max_points')) = 0);

-- ===========================================================================
-- 6. Scoring is computed from completions
-- ===========================================================================
select public.toggle_challenge_task(:'task_a'::uuid);           -- mallory: +10
select pg_temp.become('11111111-1111-1111-1111-111111111111');
select public.toggle_challenge_task(:'task_a'::uuid);           -- alice: +10
select public.toggle_challenge_task(:'task_b'::uuid);           -- alice: +30

select pg_temp.check('alice scores 40 from two completions',
  (select points from public.challenge_leaderboard
     where challenge_id = :'alice_challenge'::uuid
       and user_id = '11111111-1111-1111-1111-111111111111') = 40);
select pg_temp.check('mallory scores 10 from one completion',
  (select points from public.challenge_leaderboard
     where challenge_id = :'alice_challenge'::uuid
       and user_id = '22222222-2222-2222-2222-222222222222') = 10);
select pg_temp.check('max points is the sum of task values',
  (select max_points from public.challenge_totals where challenge_id = :'alice_challenge'::uuid) = 40);

-- Toggling off removes the points again.
select public.toggle_challenge_task(:'task_b'::uuid);
select pg_temp.check('un-completing a task removes its points',
  (select points from public.challenge_leaderboard
     where challenge_id = :'alice_challenge'::uuid
       and user_id = '11111111-1111-1111-1111-111111111111') = 10);
select public.toggle_challenge_task(:'task_b'::uuid);           -- back to 40

-- ===========================================================================
-- 7. Ending a challenge
-- ===========================================================================
select pg_temp.become('22222222-2222-2222-2222-222222222222');
do $$
begin
  begin
    perform public.end_challenge((select id from public.challenges limit 1));
    raise exception 'FAIL  non-owner ended the challenge';
  exception when insufficient_privilege then
    raise notice 'PASS  only the creator can end a challenge';
  end;
end $$;

select pg_temp.become('11111111-1111-1111-1111-111111111111');
select public.end_challenge(:'alice_challenge'::uuid);
select pg_temp.check('winner is computed from the leaderboard, not supplied',
  (select winner_ids from public.challenges where id = :'alice_challenge'::uuid)
    = array['11111111-1111-1111-1111-111111111111'::uuid]);
select pg_temp.check('final points are frozen at the real totals',
  (select final_points->>'11111111-1111-1111-1111-111111111111'
     from public.challenges where id = :'alice_challenge'::uuid) = '40');
select pg_temp.check('ended challenge is inactive',
  (select not is_active from public.challenges where id = :'alice_challenge'::uuid));

-- Completing more work after the end must not rewrite the frozen result. The
-- old implementation snapshotted on the first task write and never revisited.
do $$
begin
  begin
    perform public.toggle_challenge_task((select id from public.challenge_tasks limit 1));
    raise exception 'FAIL  task toggled after the challenge ended';
  exception when others then
    raise notice 'PASS  tasks cannot be toggled after the challenge ends';
  end;
end $$;

-- ===========================================================================
-- 8. Invite codes
-- ===========================================================================
select pg_temp.check('code is 10 chars from the unambiguous alphabet',
  (select code ~ '^[ABCDEFGHJKMNPQRSTVWXYZ23456789]{10}$'
     from public.challenges where id = :'alice_challenge'::uuid));
select pg_temp.check('two generated codes differ',
  public.generate_challenge_code() <> public.generate_challenge_code());

rollback;

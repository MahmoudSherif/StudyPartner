// End-to-end check of the client data path against the local Supabase stack.
// Mirrors exactly what the app's hooks do: client-generated UUID primary keys,
// row-level insert/update/delete, derived challenge scoring, realtime delivery.

import { createClient } from '@supabase/supabase-js'
import { randomUUID, webcrypto } from 'node:crypto'

const URL = 'http://127.0.0.1:54321'
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

if (!globalThis.crypto) globalThis.crypto = webcrypto

let pass = 0
let fail = 0
const check = (label, ok, detail) => {
  if (ok) {
    pass++
    console.log(`PASS  ${label}`)
  } else {
    fail++
    console.log(`FAIL  ${label}${detail ? ` -- ${detail}` : ''}`)
  }
}

const mkClient = () =>
  createClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 5 } }
  })

async function signUp(client, email) {
  const { data, error } = await client.auth.signUp({
    email,
    password: 'correct-horse-battery-staple',
    options: { data: { display_name: email.split('@')[0] } }
  })
  if (error) throw new Error(`signUp ${email}: ${error.message}`)
  return data.user
}

const stamp = Date.now()

const alice = mkClient()
const bob = mkClient()

const aliceUser = await signUp(alice, `alice+${stamp}@example.com`)
const bobUser = await signUp(bob, `bob+${stamp}@example.com`)
check('two accounts created', !!aliceUser && !!bobUser)

// --- profile trigger -------------------------------------------------------
{
  const { data } = await alice.from('profiles').select('*').eq('id', aliceUser.id).maybeSingle()
  check('handle_new_user seeded a profile', data?.display_name?.startsWith('alice'))
  const { data: settings } = await alice
    .from('user_settings')
    .select('*')
    .eq('user_id', aliceUser.id)
    .maybeSingle()
  check('handle_new_user seeded user_settings', settings?.theme === 'dark')
}

// --- the bug that broke every create: client-generated ids -----------------
{
  const legacyId = Date.now().toString() // what the app used to send
  const { error } = await alice
    .from('subjects')
    .insert({ id: legacyId, user_id: aliceUser.id, name: 'Legacy id', color: '#fff' })
  check(
    'a non-UUID id is rejected by Postgres (confirms the original bug)',
    !!error && /uuid/i.test(error.message),
    error?.message
  )
}

const subjectId = randomUUID()
{
  const { error } = await alice.from('subjects').insert({
    id: subjectId,
    user_id: aliceUser.id,
    name: 'Organic Chemistry',
    color: '#14b8a6',
    total_time: 0
  })
  check('subject insert with a UUID id succeeds', !error, error?.message)
}

// --- every collection the app writes --------------------------------------
const taskId = randomUUID()
const sessionId = randomUUID()
const focusId = randomUUID()
const goalId = randomUUID()
const noteId = randomUUID()
const eventId = randomUUID()

{
  const results = await Promise.all([
    alice.from('tasks').insert({
      id: taskId,
      user_id: aliceUser.id,
      subject_id: subjectId,
      title: 'Read chapter 4',
      priority: 'high',
      completed: false,
      created_at: new Date().toISOString()
    }),
    alice.from('study_sessions').insert({
      id: sessionId,
      user_id: aliceUser.id,
      subject_id: subjectId,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      duration: 1500,
      completed: true
    }),
    alice.from('focus_sessions').insert({
      id: focusId,
      user_id: aliceUser.id,
      title: 'Deep work',
      duration: 25,
      start_time: new Date().toISOString(),
      completed: false,
      is_running: true
    }),
    alice.from('goals').insert({
      id: goalId,
      user_id: aliceUser.id,
      title: 'Study 10h this week',
      target: 600,
      current: 0,
      category: 'weekly',
      is_completed: false,
      created_at: new Date().toISOString()
    }),
    alice.from('sticky_notes').insert({
      id: noteId,
      user_id: aliceUser.id,
      title: 'Formula',
      content: 'pV = nRT',
      color: '#fde68a',
      position_x: 10,
      position_y: 20,
      width: 250,
      height: 200,
      is_pinned: false,
      tags: ['chem']
    }),
    alice.from('calendar_events').insert({
      id: eventId,
      user_id: aliceUser.id,
      title: 'Midterm',
      event_date: '2026-09-01',
      type: 'exam',
      is_all_day: true
    })
  ])
  const errs = results.filter(r => r.error).map(r => r.error.message)
  check('all six personal collections accept inserts', errs.length === 0, errs.join(' | '))
}

// --- the partial unique index on running focus sessions --------------------
{
  const { error } = await alice.from('focus_sessions').insert({
    id: randomUUID(),
    user_id: aliceUser.id,
    title: 'Second running session',
    duration: 0,
    start_time: new Date().toISOString(),
    is_running: true
  })
  check('a second running focus session is rejected', !!error, error?.message ?? 'no error')
}

// --- achievements upsert (composite key) -----------------------------------
{
  const { error: e1 } = await alice
    .from('achievements')
    .upsert(
      [{ user_id: aliceUser.id, key: 'first-session', unlocked: true, unlocked_at: new Date().toISOString(), progress: 1 }],
      { onConflict: 'user_id,key' }
    )
  const { error: e2 } = await alice
    .from('achievements')
    .upsert(
      [{ user_id: aliceUser.id, key: 'first-session', unlocked: true, unlocked_at: new Date().toISOString(), progress: 5 }],
      { onConflict: 'user_id,key' }
    )
  const { data } = await alice.from('achievements').select('*').eq('user_id', aliceUser.id)
  check('achievement upsert is idempotent on (user_id,key)', !e1 && !e2 && data?.length === 1 && data[0].progress === 5,
    [e1?.message, e2?.message, `rows=${data?.length}`].filter(Boolean).join(' | '))
}

// --- isolation -------------------------------------------------------------
{
  const { data } = await bob.from('tasks').select('*')
  check('another account cannot read those tasks', (data ?? []).length === 0)
}

// --- update / delete round trip -------------------------------------------
{
  const { error: uErr } = await alice
    .from('tasks')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', aliceUser.id)
  const { data } = await alice.from('tasks').select('completed').eq('id', taskId).maybeSingle()
  check('task update round-trips', !uErr && data?.completed === true, uErr?.message)

  const { error: dErr } = await alice
    .from('calendar_events')
    .delete()
    .in('id', [eventId])
    .eq('user_id', aliceUser.id)
  const { data: after } = await alice.from('calendar_events').select('id').eq('id', eventId)
  check('calendar event delete round-trips', !dErr && (after ?? []).length === 0, dErr?.message)
}

// --- challenges: create, join, score, end ----------------------------------
let challengeId, challengeCode
{
  const { data, error } = await alice.rpc('create_challenge', {
    p_title: 'Finals sprint',
    p_description: 'Two weeks of focus',
    p_end_date: new Date(Date.now() + 7 * 864e5).toISOString()
  })
  const row = Array.isArray(data) ? data[0] : data
  challengeId = row?.id
  challengeCode = row?.code
  check('create_challenge returns a challenge with a code', !error && !!challengeId && /^[A-Z0-9]{10}$/.test(challengeCode ?? ''),
    error?.message ?? `code=${challengeCode}`)
}

{
  const { error } = await bob.rpc('join_challenge', { p_code: challengeCode })
  check('a second account can join by code', !error, error?.message)

  const { error: badErr } = await bob.rpc('join_challenge', { p_code: 'NOTACODE99' })
  check('joining with an unknown code raises P0002', badErr?.code === 'P0002', badErr?.code)
}

const t1 = randomUUID()
const t2 = randomUUID()
{
  const { error } = await alice.from('challenge_tasks').insert([
    { id: t1, challenge_id: challengeId, title: 'Past papers', points: 30 },
    { id: t2, challenge_id: challengeId, title: 'Flashcards', points: 10 }
  ])
  check('the creator can add challenge tasks', !error, error?.message)

  const { error: bobErr } = await bob
    .from('challenge_tasks')
    .insert({ id: randomUUID(), challenge_id: challengeId, title: 'Cheat task', points: 10000 })
  check('a non-creator cannot add challenge tasks', !!bobErr, bobErr?.message ?? 'no error')
}

{
  await alice.rpc('toggle_challenge_task', { p_task_id: t1 })
  await alice.rpc('toggle_challenge_task', { p_task_id: t2 })
  await bob.rpc('toggle_challenge_task', { p_task_id: t2 })

  const { data } = await alice.from('challenge_leaderboard').select('*').eq('challenge_id', challengeId)
  const byUser = Object.fromEntries((data ?? []).map(r => [r.user_id, r.points]))
  check('derived scores are correct (alice 40, bob 10)',
    byUser[aliceUser.id] === 40 && byUser[bobUser.id] === 10, JSON.stringify(byUser))
}

{
  // Bob tries to credit himself for Alice's completion by writing the row
  // directly rather than through the function.
  const { error } = await bob
    .from('challenge_task_completions')
    .insert({ task_id: t1, user_id: aliceUser.id })
  check('a user cannot forge a completion for someone else', !!error, error?.message ?? 'no error')
}

{
  const { error: bobEnd } = await bob.rpc('end_challenge', { p_challenge_id: challengeId })
  check('a non-creator cannot end the challenge', !!bobEnd, bobEnd?.message ?? 'no error')

  const { data, error } = await alice.rpc('end_challenge', { p_challenge_id: challengeId })
  const row = Array.isArray(data) ? data[0] : data
  check('the creator can end it and the winner is derived',
    !error && row?.winner_ids?.length === 1 && row.winner_ids[0] === aliceUser.id,
    error?.message ?? JSON.stringify(row?.winner_ids))
  check('final points are frozen from real totals',
    row?.final_points?.[aliceUser.id] === 40 && row?.final_points?.[bobUser.id] === 10,
    JSON.stringify(row?.final_points))
  check('ended challenge is inactive', row?.is_active === false)
}

// --- realtime --------------------------------------------------------------
{
  const received = []
  const channel = alice
    .channel(`sync:tasks:${aliceUser.id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${aliceUser.id}` },
      payload => received.push(payload.eventType)
    )

  const subscribed = await new Promise(resolve => {
    channel.subscribe(status => {
      if (status === 'SUBSCRIBED') resolve(true)
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') resolve(false)
    })
    setTimeout(() => resolve(false), 10000)
  })
  check('realtime channel subscribes', subscribed === true)

  if (subscribed) {
    // SUBSCRIBED means the channel joined, not that the server has finished
    // registering the postgres_changes subscription and positioned its WAL
    // reader. Writing immediately raced that setup and dropped the first
    // events.
    await new Promise(r => setTimeout(r, 2000))
    const liveId = randomUUID()
    await alice.from('tasks').insert({
      id: liveId,
      user_id: aliceUser.id,
      title: 'Realtime probe',
      priority: 'low',
      created_at: new Date().toISOString()
    })
    // Spaced deliberately: Realtime evaluates the subscriber's RLS policy
    // against the row as it stands when the WAL record is processed, so a row
    // inserted and deleted in the same tick has its INSERT event dropped.
    await new Promise(r => setTimeout(r, 1200))
    await alice.from('tasks').update({ completed: true }).eq('id', liveId)
    await new Promise(r => setTimeout(r, 1200))
    await alice.from('tasks').delete().eq('id', liveId)

    await new Promise(r => setTimeout(r, 3000))
    check(`realtime delivered INSERT/UPDATE/DELETE (got: ${received.join(',') || 'nothing'})`,
      received.includes('INSERT') && received.includes('UPDATE') && received.includes('DELETE'))
  }
  await alice.removeChannel(channel)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)

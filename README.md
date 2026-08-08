# MotivaMate

A mobile-first study companion PWA: focus timer, tasks, goals, calendar, sticky
notes, achievements, and shared challenges with friends.

**Stack:** React 19 + TypeScript + Vite · Tailwind v4 + Radix/shadcn ·
**Supabase** (Postgres, Auth, Realtime) · deployed as a static SPA on
**Cloudflare Pages**.

There is no server to run. The browser talks to Supabase directly, and Row Level
Security is what enforces access.

---

## Deploy from scratch

Four steps, in this order. Step 1 is the one people skip, and the app does
nothing without it.

### 1. Set up Supabase

**Create the project** at [supabase.com/dashboard](https://supabase.com/dashboard).
Note the *Project ref* from the URL (`https://supabase.com/dashboard/project/dlvdplhmcmepsrvxglop`).

**Push the schema.** The CLI ships with the repo via `npx`:

```bash
npx supabase login
npx supabase link --project-ref dlvdplhmcmepsrvxglop
npx supabase db push
```

This applies three migrations in order:

| Migration | What it does |
|---|---|
| `20260808000001_initial_schema.sql` | 14 tables, constraints, indexes |
| `20260808000002_rls_and_logic.sql` | RLS policies on every table, challenge functions, derived score views, profile trigger |
| `20260808000003_realtime.sql` | Adds the 12 synced tables to the `supabase_realtime` publication |

> **Do not skip the third migration.** A `postgres_changes` subscription against
> a table that is not in the publication *joins successfully and then silently
> never delivers an event*. Cross-device sync simply doesn't happen, with no
> error anywhere to tell you why.

**Verify it landed** — SQL Editor in the dashboard:

```sql
-- expect 12 rows
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public';

-- expect rowsecurity = true for all 14
select tablename, rowsecurity from pg_tables where schemaname = 'public';
```

**Configure Auth** — Dashboard → Authentication:

- **URL Configuration → Site URL**: your production URL
  (`https://motivamate.pages.dev`, or your custom domain).
- **URL Configuration → Redirect URLs**: add both your production URL and
  `http://localhost:5173` for local development.
  Google sign-in and password reset both redirect back to
  `window.location.origin`, so a URL missing from this list produces a sign-in
  that appears to work and then lands on an error page.
- **Providers → Email**: on by default. If "Confirm email" is enabled, new users
  must click a link before they can sign in — fine for production, awkward for
  testing.
- **Providers → Google** (optional): enable it, then add the Supabase callback
  URL to your Google Cloud OAuth client. Skip this and the Google button on the
  sign-in screen will error; email/password works regardless.

**Copy your keys** — Project Settings → API. You need the *Project URL* and the
*anon / public* key. You will **never** need the `service_role` key here; it
bypasses RLS entirely and must not go anywhere near the browser bundle.

### 2. Run it locally

```bash
npm install
cp .env.example .env      # then fill in the two values below
npm run dev               # http://localhost:5173
```

`.env` (gitignored):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Sign up, create a task, reload. If the task survives, the database half is
working. If it vanishes, open the console — see [Troubleshooting](#troubleshooting).

### 3. Create the Cloudflare Pages project

**Cloudflare builds this repository itself.** There is no GitHub Actions
workflow: you connect the repo once, and every push to `main` triggers a build
on Cloudflare's runners.

Dashboard → Workers & Pages → Create → Pages → **Connect to Git** → authorise
GitHub → pick `StudyPartner`.

| Setting | Value |
|---|---|
| Project name | `motivamate` |
| Production branch | `main` |
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave empty)* |

Two things that are easy to get wrong:

- **Pick `Vite`, not `React`.** The React preset assumes Create React App and
  sets the output directory to `build`. This is a Vite app and builds to `dist`,
  so the React preset deploys an empty site.
- **Build output directory must be `dist`.** There is deliberately no
  `wrangler.toml` in this repo (see [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md)
  — it shadowed the dashboard's environment variables), so these dashboard
  fields are the only place the build settings exist.
- **The project name decides your `<name>.pages.dev` hostname.** Cloudflare
  defaults it to the repository name (`studypartner`); the existing site uses
  `motivamate`.

> **Already have a Direct Upload project?** A Pages project cannot be converted
> from Direct Upload to Git integration — delete the old `motivamate` project
> first (project → Settings → Delete project), then create it fresh with the
> steps above under the same name to keep the same `motivamate.pages.dev`
> hostname.

### 4. Add the environment variables and push

Cloudflare's build runners cannot read GitHub secrets, so the Supabase values go
in the Cloudflare dashboard: project → Settings → **Variables and Secrets**.

Add all four to **Production *and* Preview** — a variable set only on Production
gives every preview branch an unconfigured build:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` key |
| `VITE_ENVIRONMENT` | `production` |
| `NODE_VERSION` | `20` |

`NODE_VERSION` is not optional. Cloudflare's default Node is older than this
project's dependencies expect.

The two `VITE_` values are compiled into the browser bundle and are visible to
anyone who opens devtools. That is by design — the anon key only identifies the
project, and RLS decides what each authenticated user may read or write. They
live in dashboard variables so builds target the intended Supabase project, not
because they need hiding.

Then:

```bash
git push origin main
```

Cloudflare installs, builds, and deploys. Watch it under the project's
Deployments tab.

If either Supabase variable is missing, the build **fails** with a message
naming it, rather than succeeding and shipping a bundle that breaks in the
browser — see the guard in `vite.config.ts`. Vite inlines an empty string for a
missing `VITE_` variable, which is otherwise very hard to diagnose from the
front end.

There is no by-hand deploy path any more, by design. A Git-connected project
does not accept direct uploads, and hand-uploading a locally built `dist/` is
what previously put a build pointing at `http://localhost:54321` onto the live
site: `.env.local` holds the local Supabase URL, and Vite bakes it in. Push and
let Cloudflare build.

---

## Verify the deploy

Replace `<domain>` with your `*.pages.dev` hostname or custom domain.

```bash
# 1. Security headers are actually applied
curl -sI https://<domain>/ | grep -iE 'content-security-policy|x-frame-options|strict-transport'

# 2. Hashed assets cached forever, shell revalidated every time
curl -sI https://<domain>/assets/index-<hash>.js | grep -i cache-control   # immutable
curl -sI https://<domain>/                       | grep -i cache-control   # max-age=0, must-revalidate

# 3. Deep links return the app, not a 404
curl -s -o /dev/null -w '%{http_code}\n' https://<domain>/some/deep/route  # 200
```

**4. In the browser.** Sign in. The console must show no `Refused to connect`
CSP violations, and the Network tab must show a live `wss://` connection — that
is Realtime. Open the app in a second browser, complete a task in one, and watch
it appear in the other.

---

## Troubleshooting

**Nothing can be created; console shows `invalid input syntax for type uuid`.**
A row id was generated that isn't a UUID. Every id must come from `newId()` in
`src/lib/ids.ts`.

**Cross-device sync does nothing, and there are no errors.** The tables are
missing from the `supabase_realtime` publication. Re-run migration 3 and the
verification query in step 1. This failure is silent by design.

**Sign-in redirects to an error page.** Your deployed URL isn't in Supabase →
Authentication → URL Configuration → Redirect URLs.

**Everything Supabase fails with a CSP error.** `index.html` carries its own
`<meta http-equiv="Content-Security-Policy">` as a backstop, and `public/_headers`
carries the authoritative one. Browsers enforce the **intersection** of the two,
so anything missing from either is blocked. Keep them in sync.

**Using a custom or self-hosted Supabase domain.** The CSP allowlists
`https://*.supabase.co` and `wss://*.supabase.co` only. Add your origin to
`connect-src` in **both** `public/_headers` and `index.html`, including the
`wss://` form — Realtime is a websocket and the https entry does not cover it.

**Users stuck on an old build.** Check that `/` and `/sw.js` return
`max-age=0, must-revalidate`. If a long `max-age` came back, the browser is
holding a stale shell requesting asset URLs that no longer exist. Fix
`public/_headers`, redeploy, purge the Cloudflare cache.

`CLOUDFLARE_DEPLOY.md` has the longer-form reference, including why
`public/_headers` sets `Cache-Control` only on specific paths.

---

## Development

| Command | |
|---|---|
| `npm run dev` | Dev server on :5173 |
| `npm run build` | Typecheck (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the built output locally |
| `npm run test` | Vitest, watch mode |
| `npm run test:run` | Vitest once — 155 tests |
| `npm run lint` | ESLint |

Requires **Node 20+**.

### Testing against a real database

Two suites run against Postgres rather than mocks:

```bash
npx supabase start                                     # local stack in Docker
npx supabase db reset                                  # apply all migrations

psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f supabase/tests/rls_test.sql                       # 24 RLS assertions

node supabase/tests/client_e2e.mjs                     # 24 client assertions
```

`rls_test.sql` asserts the privilege boundaries: one account cannot read
another's data, cannot credit itself for someone else's challenge completion,
cannot end a challenge it does not own, and cannot enumerate challenges it has
not joined. `client_e2e.mjs` drives the real client through signup, every
collection's insert/update/delete, challenge scoring, and live Realtime
delivery. Point it at a scratch project, never production — it creates users
and rows.

### Layout

```
src/
├── components/           # UI, one file per tab plus shared ui/ primitives
├── contexts/AuthContext  # Session, sign-in/out, cache reset on sign-out
├── hooks/
│   ├── useSyncedCollection.ts   # Table ⇄ array sync: row-level diffing,
│   │                            # realtime, offline retry, one shared store
│   │                            # per (table, user)
│   ├── useAppData.ts            # Per-entity hooks built on the above
│   ├── useChallenges.ts         # Shared challenges (server-owned scores)
│   └── useRealTimeStats.ts      # Derived stats
├── lib/
│   ├── supabase.ts       # Client + auth wrapper
│   ├── ids.ts            # UUID generation — all row ids come from here
│   ├── localCache.ts     # Read-through cache; never a source of truth
│   └── challenges.ts     # Challenge RPCs
supabase/
├── migrations/           # Schema, RLS, realtime — apply in filename order
└── tests/                # rls_test.sql, client_e2e.mjs
```

### How the data layer works

Each collection is one module-level store keyed by `(table, user)`, exposed
through the `[items, setItems]` shape components already use. Calling `setItems`
diffs against the last known server state and issues row-level inserts, updates
and deletes — touching one task writes one row, so two devices editing at once
don't clobber each other.

Challenge **scores are derived, never stored**: they're computed in Postgres
from completion rows, so there is no column a client could write to declare
itself the winner. Every challenge mutation goes through a `SECURITY DEFINER`
function that takes the acting user from `auth.uid()` rather than a parameter.

Writes that fail because the network is down are kept and re-sent on reconnect;
writes the server *rejects* are rolled back to what is actually stored, and the
banner at the top of the app says so.

## License

See `LICENSE`.

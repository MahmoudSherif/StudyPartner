# Cloudflare Pages deployment

MotivaMate is a static Vite + React SPA. Cloudflare Pages serves the built
assets; Supabase is the backend. There is no server to run.

| | |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |
| Config | `wrangler.toml` |
| Headers / SPA routing | `public/_headers`, `public/_redirects` |

Vite copies everything in `public/` into `dist/` verbatim, so `_headers` and
`_redirects` land at the root of the upload where Pages reads them. They are
**not** TOML — see the comments at the top of each file before editing.

## Prerequisites

- Node 20 and npm.
- A Cloudflare account with Pages enabled.
- A Supabase project (URL + anon key).
- `wrangler` — no install needed, use `npx wrangler`.

## Required secrets and variables

Add all four as **repository secrets** in GitHub
(Settings → Secrets and variables → Actions → New repository secret):

| Secret | Where to get it | Secret? |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template (or a custom token with `Account · Cloudflare Pages · Edit`) | Yes — genuinely secret |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard → Workers & Pages → right sidebar | Low sensitivity |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | No — public |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key | No — public by design |

The two `VITE_` values are compiled into the browser bundle and are visible to
anyone who opens devtools. That is expected: the anon key only identifies the
project, and Row Level Security decides what each authenticated user may read
or write. They live in secrets so builds target the intended project, not
because they need hiding. Never put the Supabase `service_role` key in a
`VITE_` variable — it bypasses RLS entirely. See `.env.example`.

For local development, `cp .env.example .env` and fill in the two Supabase
values. `.env` is gitignored.

## One-time: set up the database

The Pages deploy ships only the front end. Nothing works until the Supabase
project has the schema, the policies **and the Realtime publication**.

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

That applies `supabase/migrations/` in order:

| Migration | What it does |
|---|---|
| `20260808000001_initial_schema.sql` | Tables, constraints, indexes |
| `20260808000002_rls_and_logic.sql` | RLS policies, challenge functions, derived score views, triggers |
| `20260808000003_realtime.sql` | Adds the twelve synced tables to the `supabase_realtime` publication and sets `replica identity full` |

The third one is not optional and is easy to overlook. A `postgres_changes`
subscription against a table that is *not* in the publication **joins
successfully and then silently never delivers an event** — cross-device sync
just quietly does not happen, with no error anywhere. `replica identity full`
matters for the same reason: without it a DELETE carries only the primary key,
so it fails the `user_id=eq.…` filter every subscription uses and is dropped.

Verify after pushing:

```sql
-- expect 12 rows
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public';
```

### Checking the backend

Two suites run against a database, not mocks:

```bash
# 24 RLS / privilege-escalation assertions
psql "$DATABASE_URL" -f supabase/tests/rls_test.sql

# 24 end-to-end client assertions: signup, every collection's insert/update/
# delete, challenge scoring, and live Realtime delivery
node supabase/tests/client_e2e.mjs
```

`client_e2e.mjs` has the local `supabase start` URL and anon key at the top;
point them at whichever project you want to exercise. Run it against a scratch
project, not production — it creates users and rows.

## One-time: create and link the Pages project

The CI deploy is non-interactive and cannot create a project, so do this once:

```bash
npx wrangler login
npx wrangler pages project create motivamate --production-branch main
```

The name must match `name` in `wrangler.toml`. If you choose a different name,
change it in `wrangler.toml` too — CI reads it from there.

Nothing else needs linking. `wrangler.toml` sets both `name` and
`pages_build_output_dir = "dist"`, so `wrangler pages deploy` needs no
arguments and CI and local deploys behave identically.

> Deploys here are **direct upload** from GitHub Actions. Do *not* also connect
> the Pages project to the Git repository in the Cloudflare dashboard — a
> project can use one method or the other, and connecting both causes competing
> deployments.

## Deploying

**Normal path:** push to `main`. `.github/workflows/deploy.yml` installs, builds
with the Supabase secrets injected, and deploys. It can also be triggered
manually from the Actions tab (`workflow_dispatch`).

**Manual / from a laptop:**

```bash
npm ci
npm run build
npx wrangler pages deploy
```

If you are on an older Wrangler that does not read `pages_build_output_dir`,
use the explicit form instead:

```bash
npx wrangler pages deploy dist --project-name=motivamate
```

## Verifying the deploy

Replace `<your-pages-domain>` with your `*.pages.dev` hostname or custom domain.

**1. Security headers on the app shell.** These previously lived in
`netlify.toml` and never actually applied, because the real deploy target was
GitHub Pages, which cannot serve custom headers. Confirm they are real now:

```bash
curl -sI https://<your-pages-domain>/ | grep -iE 'content-security-policy|x-frame-options|strict-transport|referrer-policy|permissions-policy|x-content-type|cross-origin-opener'
```

Every header in the `/*` block of `public/_headers` should appear. Check the
CSP `connect-src` contains both `https://*.supabase.co` **and**
`wss://*.supabase.co` — Realtime uses websockets and https alone will not
cover it.

**2. Caching.** Hashed assets immutable, shell revalidated every time:

```bash
curl -sI https://<your-pages-domain>/assets/index-<hash>.js | grep -i cache-control
#   expect: public, max-age=31536000, immutable

curl -sI https://<your-pages-domain>/            | grep -i cache-control
curl -sI https://<your-pages-domain>/sw.js       | grep -i cache-control
curl -sI https://<your-pages-domain>/manifest.json | grep -i cache-control
#   expect: public, max-age=0, must-revalidate
```

If a `Cache-Control` value ever comes back doubled
(`...must-revalidate, public, max-age=31536000...`), a rule was added that
overlaps another: Cloudflare **joins duplicate headers with a comma** rather
than letting the later rule win. That is why the `/*` block sets no
`Cache-Control` at all.

**3. SPA deep links.** A hard refresh on a client-side route must return the
app, not a 404:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<your-pages-domain>/some/deep/route
#   expect: 200
```

**4. In the browser.** Load the app, open devtools, sign in. The Console must
show no `Refused to connect` CSP violations and the Network tab must show a
successful `wss://` connection if Realtime is in use.

## Troubleshooting

**Everything Supabase fails with a CSP error.** `index.html` carries its own
`<meta http-equiv="Content-Security-Policy">` as a backstop for contexts that
serve the file without edge headers. Browsers enforce the **intersection** of
every policy they receive, so anything missing from the meta tag is blocked even
when `_headers` allows it. The two must stay in sync.

**Cross-device sync does nothing, but there are no errors.** The tables are
missing from the `supabase_realtime` publication — see "One-time: set up the
database". This fails silently by design: the channel joins, `subscribe()`
reports `SUBSCRIBED`, and no event ever arrives.

**Nothing can be created; the console shows `invalid input syntax for type
uuid`.** Something is generating a row id that is not a UUID. Every id must come
from `newId()` in `src/lib/ids.ts`; `useSyncedCollection` rewrites anything else
as a backstop, so seeing this means a write bypassed that layer.

**Build fails on `functions/`.** A root-level `functions/` directory is treated
by Cloudflare Pages as *Pages Functions* source, and `wrangler pages deploy` has
no flag to opt out. This repository no longer has one — the Firebase functions
were removed with the backend — but `.github/workflows/deploy.yml` still carries
a defensive step that moves it aside if it reappears. That step is now a no-op
and can be deleted.

**Users stuck on an old build.** Check step 2 above. If `/` or `/sw.js` came
back with a long `max-age`, the browser is holding a stale shell that requests
asset URLs which no longer exist. Correct `_headers`, redeploy, and purge the
cache from the Cloudflare dashboard.

**Custom or self-hosted Supabase domain.** The CSP allowlists
`https://*.supabase.co` and `wss://*.supabase.co` only. Any other origin must
be added to `connect-src` in `public/_headers` or every request is blocked.

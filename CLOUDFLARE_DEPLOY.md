# Cloudflare Pages deployment

MotivaMate is a static Vite + React SPA. Cloudflare Pages serves the built
assets; Supabase is the backend. There is no server to run.

| | |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 |
| Config | Cloudflare dashboard (no config file in the repo — see below) |
| Headers / SPA routing | `public/_headers`, `public/_redirects` |

Vite copies everything in `public/` into `dist/` verbatim, so `_headers` and
`_redirects` land at the root of the upload where Pages reads them. They are
**not** TOML — see the comments at the top of each file before editing.

## Prerequisites

- Node 20 and npm.
- A Cloudflare account with Pages enabled.
- A Supabase project (URL + anon key).

## How deploys work

Cloudflare builds the repository itself, on its own runners, triggered by a push
to `main`. There is no GitHub Actions workflow and no GitHub secrets involved —
nothing about the deploy passes through GitHub beyond the git push.

That means **no Cloudflare API token is needed anywhere.** The old
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` repository secrets existed only
so GitHub Actions could upload on your behalf; with Cloudflare building, they
serve no purpose and should be deleted from the repository.

## Required environment variables

Set these in the Cloudflare dashboard: project → Settings → **Variables and
Secrets**. Apply each to **Production *and* Preview** — one set only on
Production leaves every preview branch with an unconfigured build.

| Variable | Where to get it | Secret? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | No — public |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key | No — public by design |
| `VITE_ENVIRONMENT` | Literal `production` | No |
| `NODE_VERSION` | Literal `20` | No |

`NODE_VERSION` is required: Cloudflare's default Node predates what this
project's dependencies need.

The two `VITE_` values are compiled into the browser bundle and are visible to
anyone who opens devtools. That is expected: the anon key only identifies the
project, and Row Level Security decides what each authenticated user may read
or write. They live in dashboard variables so builds target the intended
project, not because they need hiding. Never put the Supabase `service_role` key
in a `VITE_` variable — it bypasses RLS entirely. See `.env.example`.

A missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` **fails the build**,
by way of the `assert-required-env` plugin in `vite.config.ts`. Vite inlines an
empty string for a missing `VITE_` variable rather than erroring, so without
that guard an unconfigured deploy succeeds and then fails in the browser with an
opaque Supabase error. The guard reads both real environment variables (what
Cloudflare supplies) and `.env` files (what a local build uses).

For local development, `cp .env.example .env` and fill in the two Supabase
values. `.env` is gitignored.

> **Why there is no `wrangler.toml` here.** This repository used to carry one.
> It was removed because dashboard variables were not reaching the build: the
> deploy failed with `VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set`
> while both were set on Production.
>
> Cloudflare's docs state that once a Wrangler configuration file is present it
> becomes "the source of truth" for the project and you "can not edit the same
> fields in the dashboard", with `vars` named among the affected keys. The file
> was carrying only `name`, `pages_build_output_dir`, and `compatibility_date` —
> all of which the dashboard holds natively, since this project has no Pages
> Functions — so it bought nothing and risked shadowing the variables.
>
> Do **not** reintroduce it, and in particular do not try to fix a missing
> variable by putting it in a `[vars]` block: that is a *runtime* binding for
> Pages Functions, and Vite would still not see it at build time. Build-time
> variables come from the dashboard only.

## Setting up and migrating the database

The Pages deploy ships only the front end. Nothing works until the Supabase
project has the schema, the policies **and the Realtime publication**.

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

> **`db push` is not only a first-time step. Run it for every deploy that adds
> a migration, before or alongside the push to `main`.**
>
> Nothing automates this. Cloudflare builds and publishes the front end on its
> own, and knows nothing about Postgres, so code that depends on a new column
> can go live against a database that does not have it yet.
>
> This has already happened once. `20260809000001_focus_session_goal_link.sql`
> added `focus_sessions.goal_id` and the client began sending that column on
> every focus-session write. The migration was never pushed, so the insert was
> rejected and **no focus session could be started at all** — including sessions
> with no goal attached, because the client sends `goal_id: null` rather than
> omitting the key.
>
> The signature is a PostgREST `42703 column ... does not exist`. It is worth
> knowing that PostgREST resolves column names *before* checking permissions,
> so you can confirm a missing column from outside with nothing but the anon
> key: a column that exists but is protected answers `42501 permission denied`,
> while a column that does not exist answers `42703`.
>
> ```bash
> curl -s "https://<project-ref>.supabase.co/rest/v1/<table>?select=<column>&limit=1" \
>   -H "apikey: <anon-key>"
> ```
>
> `npx supabase migration list` shows the same thing from the other side: a
> migration present locally with an empty `remote` column has not been applied.

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

## One-time: create the Pages project

Dashboard → Workers & Pages → Create → Pages → **Connect to Git** → authorise
GitHub → select `StudyPartner`, then:

| Setting | Value |
|---|---|
| Project name | `motivamate` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(empty)* |

**Choose `Vite`, not `React`.** The React preset is for Create React App and
sets the output directory to `build`; this project builds to `dist`. The wrong
preset deploys an empty site with no error to explain it.

**The project name decides your `<name>.pages.dev` hostname.** Cloudflare
pre-fills the repository name (`studypartner`); `motivamate` is what the
existing site uses, so keep it unless you want the URL to change.

The build command and output directory live **only** in these dashboard fields —
there is no config file in the repo backing them up, so if the output directory
is wrong the deploy publishes an empty site. Verify `dist` is set here.

> **Migrating from the old Direct Upload setup:** a Pages project cannot be
> switched from Direct Upload to Git integration. Delete the existing
> `motivamate` project (project → Settings → Delete project) and recreate it
> with the steps above, reusing the name so the `motivamate.pages.dev` hostname
> is preserved. Deleting the project drops its deployment history and any custom
> domain attachment; re-add the custom domain afterwards.

## Deploying

Push to `main`. Cloudflare clones, runs `npm run build`, and publishes `dist`.
Progress and logs are under the project's Deployments tab. Pull requests get
their own preview deployment at a generated `*.pages.dev` URL.

There is no manual deploy path, deliberately. A Git-connected project does not
accept direct uploads, and hand-uploading a local `dist/` is what previously
published a bundle pointing at `http://localhost:54321` — `.env.local` carries
the local Supabase URL for `supabase start`, and Vite bakes whatever it finds
into the bundle. Building only on Cloudflare means the deployed bundle can only
ever contain the dashboard's values.

To roll back, use Deployments → the deployment you want → Rollback. That
re-publishes an earlier build without a rebuild.

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

**The site loads but every Supabase call goes to `localhost`.** The bundle was
built with a local `VITE_SUPABASE_URL`. Since Cloudflare now does the building,
this can only happen if the dashboard variable itself is wrong — check
Settings → Variables and Secrets for the environment that produced the
deployment, fix it, and **redeploy**: build-time variables are baked in, so
changing one does nothing until a new build runs. Confirm what shipped with

```bash
curl -s https://<your-pages-domain>/assets/index-<hash>.js | grep -o 'https://[a-z0-9]*\.supabase\.co' | head -1
```

**A root-level `functions/` directory breaks the deploy.** Cloudflare Pages
treats `functions/` at the repository root as *Pages Functions* source and
bundles it, and there is no flag to opt out. This repository does not have one —
the Firebase functions were removed with the backend — so do not reintroduce
that path. With Cloudflare doing the build there is nowhere to move it aside
mid-deploy the way the old GitHub Actions workflow did; a Pages Function would
also claim routes and bypass the `_headers` rules for them.

**Users stuck on an old build.** Check step 2 above. If `/` or `/sw.js` came
back with a long `max-age`, the browser is holding a stale shell that requests
asset URLs which no longer exist. Correct `_headers`, redeploy, and purge the
cache from the Cloudflare dashboard.

**Custom or self-hosted Supabase domain.** The CSP allowlists
`https://*.supabase.co` and `wss://*.supabase.co` only. Any other origin must
be added to `connect-src` in `public/_headers` or every request is blocked.

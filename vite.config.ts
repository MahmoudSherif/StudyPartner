import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import { resolve } from 'path'

// Without these the app builds cleanly and then fails in the browser.
const REQUIRED_ENV = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

// Vite inlines an empty string for a missing VITE_ variable rather than
// erroring, so an unset value ships a bundle that looks fine and dies at runtime
// with an opaque Supabase error. Worse, a *stale* value (a localhost URL left in
// .env.local, say) ships a production build that points at nothing.
//
// This check used to be a step in .github/workflows/deploy.yml. The build now
// runs on Cloudflare Pages, which has no pre-build hook, so it lives here — the
// build itself is the only place left that sees every deploy.
//
// Both sources are read: Cloudflare and CI supply these as real process
// environment variables, while a local `npm run build` gets them from .env files.
function assertRequiredEnv(mode: string) {
  const fromFiles = loadEnv(mode, process.cwd(), 'VITE_')
  const missing = REQUIRED_ENV.filter(key => !(process.env[key] || fromFiles[key]))

  if (missing.length === 0) return

  // The failure looks identical whether the variables were never set, were set
  // on the wrong environment, or were set correctly but never reached the build
  // runner. Print what this process can actually see so the build log
  // distinguishes them instead of leaving it to guesswork.
  const visibleVite = Object.keys(process.env).filter(k => k.startsWith('VITE_'))
  const onCloudflare = Boolean(process.env.CF_PAGES)

  throw new Error(
    `Cannot build: ${missing.join(' and ')} not set.\n` +
    '\n--- what this build can see ---\n' +
    `running on Cloudflare Pages: ${onCloudflare ? 'yes' : 'no'}\n` +
    (onCloudflare ? `branch: ${process.env.CF_PAGES_BRANCH ?? '(unset)'}\n` : '') +
    `VITE_* in the process environment: ${visibleVite.join(', ') || '(none)'}\n` +
    `VITE_* found in .env files: ${Object.keys(fromFiles).join(', ') || '(none)'}\n` +
    '-------------------------------\n' +
    '\nIf "running on Cloudflare Pages" is yes but no VITE_* variables are\n' +
    'listed, the dashboard values are not reaching the build. Check they are set\n' +
    'on the environment matching the branch above (Production vs Preview), and\n' +
    'that nobody has reintroduced a wrangler.toml — it takes over as the source\n' +
    'of truth for vars and shadows the dashboard. See CLOUDFLARE_DEPLOY.md.\n' +
    'Build-time variables are baked in, so changing one requires a NEW build;\n' +
    'a retry of the old deployment will not pick it up.\n' +
    'For a local build, put them in .env. See .env.example.'
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'assert-required-env',
      // Build only. `npm run dev` against an unconfigured checkout should still
      // start and show the console warning from src/lib/supabase.ts, not refuse
      // to boot.
      apply: 'build',
      config: (_config, { mode }) => { assertRequiredEnv(mode) },
    },
    {
      // The CSP in index.html allows Supabase only at https://*.supabase.co, so
      // pointing VITE_SUPABASE_URL at a local stack (`supabase start` serves
      // http://127.0.0.1:54321) means every auth and REST call is blocked before
      // it leaves the page — sign-in fails with a bare CSP violation and no
      // application-level error. That made the documented local workflow in
      // README impossible to actually run.
      //
      // Dev server only. Production is unaffected in two ways: this never runs
      // for a build, and on Cloudflare the authoritative policy is
      // public/_headers, which browsers intersect with the meta tag — so an
      // origin added here could not widen the deployed policy even if it leaked.
      name: 'dev-csp-allow-local-supabase',
      apply: 'serve',
      transformIndexHtml: {
        order: 'pre',
        handler(html, ctx) {
          const url = ctx.server?.config.env.VITE_SUPABASE_URL as string | undefined
          if (!url) return html
          let parsed: URL
          try { parsed = new URL(url) } catch { return html }
          if (parsed.hostname.endsWith('.supabase.co')) return html // already permitted
          // Both schemes, mirroring the https/wss pair the production policy
          // carries: Supabase Realtime opens a websocket, and allowing only the
          // http origin blocks it while leaving REST and auth working — the
          // confusing half-broken state where data loads but nothing updates live.
          const ws = `${parsed.protocol === 'https:' ? 'wss:' : 'ws:'}//${parsed.host}`
          return html.replace(
            /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/i,
            (_m, open, policy: string, close) =>
              open + policy.replace(/connect-src ([^;]*)/, `connect-src $1 ${parsed.origin} ${ws}`) + close
          )
        },
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // Cloudflare Pages serves these from its edge with `immutable` (see
    // public/_headers), so the split below is a one-time cost per deploy and a
    // permanent saving on repeat visits: changing app code no longer
    // invalidates the ~500 kB of vendor libraries that did not change.
    rollupOptions: {
      output: {
        // The function form, not the object form. The object form keys on the
        // module that *starts* a chunk, so a package's transitive dependencies
        // (react-dom's renderer, recharts' d3-* internals) stayed in the entry
        // chunk and the "vendor" chunks came out at half a kilobyte each.
        // Matching the resolved path catches the whole dependency tree.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          const inPackage = (...names: string[]) =>
            names.some(name => id.includes(`node_modules/${name}`))

          // Rendering core. Changes only on a React upgrade.
          if (inPackage('react/', 'react-dom/', 'scheduler/', 'react-error-boundary/')) {
            return 'vendor-react'
          }
          // Data layer, including the realtime websocket client.
          if (inPackage('@supabase/')) return 'vendor-supabase'
          // Recharts drags in the whole of d3-scale/shape/array. Currently
          // tree-shaken out entirely (nothing in the render tree imports it),
          // so this rule is dormant until a chart is actually mounted.
          if (inPackage('recharts/', 'd3-', 'victory-vendor/')) return 'vendor-charts'
          if (inPackage('framer-motion/', 'motion-dom/', 'motion-utils/')) return 'vendor-motion'
          if (inPackage('@phosphor-icons/', 'lucide-react/', '@heroicons/')) return 'vendor-icons'
          if (inPackage('@radix-ui/')) return 'vendor-radix'
          return 'vendor'
        },
      },
    },
    // The vendor chunks above are legitimately large; warning at the default
    // 500 kB would report a problem on every build that is not one.
    chunkSizeWarningLimit: 700,
    // Off deliberately. Source maps would publish the full unminified source
    // at a guessable URL and add several megabytes to every deploy, and there
    // is no error-reporting service here that would consume them. Turn this on
    // (or set it to 'hidden') if one is ever wired up.
    sourcemap: false,
  },
});

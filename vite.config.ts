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

  if (missing.length > 0) {
    throw new Error(
      `Cannot build: ${missing.join(' and ')} not set.\n` +
      'For a deploy, set them in Cloudflare dashboard > Workers & Pages > ' +
      'motivamate > Settings > Variables and Secrets (Production *and* Preview).\n' +
      'For a local build, put them in .env. See .env.example.'
    )
  }
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

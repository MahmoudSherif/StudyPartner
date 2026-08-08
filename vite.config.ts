import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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

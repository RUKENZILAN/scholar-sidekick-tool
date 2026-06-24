// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isStaticBuild = process.env.STATIC_BUILD === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // For static export (GitHub Pages): prerender the homepage as index.html.
    ...(isStaticBuild
      ? {
          prerender: {
            enabled: true,
            crawlLinks: true,
            routes: ["/"],
          },
        }
      : {}),
  },
  vite: {
    // For GitHub Pages project sites (e.g. /RefDesk/), CI sets GH_PAGES_BASE.
    base: process.env.GH_PAGES_BASE || "/",
  },
});

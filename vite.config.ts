import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isStaticBuild = process.env.STATIC_BUILD === "1";

export default defineConfig({
  tanstackStart: isStaticBuild
    ? {
        prerender: {
          enabled: true,
          crawlLinks: true,
          routes: ["/"],
        },
      }
    : {
        // Normal dev/SSR build uses our custom SSR error wrapper.
        server: { entry: "server" },
      },
  // Outside Lovable (e.g. GitHub Actions), force the static nitro preset so
  // prerender writes plain HTML/JS/CSS into dist/client without a worker.
  ...(isStaticBuild ? { nitro: { preset: "github-pages" } } : {}),
  vite: {
    // For GitHub Pages project sites (e.g. /RefDesk/), CI sets GH_PAGES_BASE.
    base: process.env.GH_PAGES_BASE || "/",
  },
});

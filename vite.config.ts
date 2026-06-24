import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isStaticBuild = process.env.STATIC_BUILD === "1";

export default defineConfig({
  tanstackStart: isStaticBuild
    ? {
        // Static export for GitHub Pages: let nitro use its default server entry
        // (the preview/prerender plugin looks for dist/server/server.js), and
        // prerender the homepage so dist/client/index.html is generated.
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
  vite: {
    // For GitHub Pages project sites (e.g. /RefDesk/), CI sets GH_PAGES_BASE.
    base: process.env.GH_PAGES_BASE || "/",
  },
});

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isStaticBuild = process.env.STATIC_BUILD === "1";

export default defineConfig({
  tanstackStart: isStaticBuild
    ? {}
    : {
        // Normal dev/SSR build uses our custom SSR error wrapper.
        server: { entry: "server" },
      },
  // For the static export pipeline we don't need the nitro server bundle
  // (we snapshot HTML from `vite dev` and ship only the client output).
  // Outside Lovable, the wrapper respects `nitro: false`.
  ...(isStaticBuild ? { nitro: false as const } : {}),
  vite: {
    // For GitHub Pages project sites (e.g. /RefDesk/), CI sets GH_PAGES_BASE.
    base: process.env.GH_PAGES_BASE || "/",
  },
});

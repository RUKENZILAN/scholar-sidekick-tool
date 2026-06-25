// Static-SPA generator for GitHub Pages.
//
// Run AFTER `STATIC_BUILD=1 vite build` so dist/client/assets already exists.
// This intentionally does NOT start `vite dev` in CI: GitHub Actions can leave
// watcher processes alive and make the Pages build look like it is spinning.
import { existsSync, readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.GH_PAGES_BASE || "/";
const CLIENT_DIR = "dist/client";
const ASSETS_DIR = join(CLIENT_DIR, "assets");

if (!existsSync(ASSETS_DIR)) {
  console.error(`✗ ${ASSETS_DIR} not found — run \`vite build\` first.`);
  process.exit(1);
}

const assets = readdirSync(ASSETS_DIR);
const jsEntry = assets.find((f) => /^index-[A-Za-z0-9_]+\.js$/.test(f));
const cssEntry = assets.find((f) => /^styles-[A-Za-z0-9_]+\.css$/.test(f));
if (!jsEntry || !cssEntry) {
  console.error("✗ Could not locate built JS/CSS entries in", ASSETS_DIR);
  console.error("  Contents:", assets.join(", "));
  process.exit(1);
}

const baseNoSlash = BASE.replace(/\/$/, "");
const assetBase = `${baseNoSlash}/assets` || "/assets";
const now = Date.now();

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>RefDesk — Citation manager for CS researchers</title>
    <meta
      name="description"
      content="A fast, local-first reference manager for computer science researchers. Import by DOI, tag, search, and export BibTeX."
    />
    <meta property="og:title" content="RefDesk — Citation manager for CS researchers" />
    <meta
      property="og:description"
      content="Import by DOI, tag, search, and export BibTeX. Local-first, no account needed."
    />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <link rel="stylesheet" href="${assetBase}/${cssEntry}" />
    <link rel="modulepreload" href="${assetBase}/${jsEntry}" />
  </head>
  <body>
    <script class="$tsr" id="$tsr-stream-barrier">
      (self.$R = self.$R || {})["tsr"] = [];
      self.$_TSR = {
        h() { this.hydrated = true; this.c(); },
        e() { this.streamEnded = true; this.c(); },
        c() { this.hydrated && this.streamEnded && (delete self.$_TSR, delete self.$R.tsr); },
        p(e) { this.initialized ? e() : this.buffer.push(e); },
        buffer: [],
      };
      $_TSR.router = (($R) => $R[0] = {
        manifest: $R[1] = {
          routes: $R[2] = {
            __root__: $R[3] = {
              preloads: $R[4] = ["${assetBase}/${jsEntry}"],
              scripts: $R[5] = [$R[6] = { attrs: $R[7] = { type: "module", async: true, src: "${assetBase}/${jsEntry}" } }],
              css: $R[8] = [],
            },
          },
        },
        matches: $R[9] = [
          $R[10] = { i: "__root__\\u0000", u: ${now}, s: "success", ssr: false },
          $R[11] = { i: "\\u0000\\u0000", u: ${now}, s: "success", ssr: false },
        ],
        lastMatchId: "\\u0000\\u0000",
      })($R["tsr"]);
      $_TSR.e();
      document.currentScript.remove();
    </script>
    <script type="module" async src="${assetBase}/${jsEntry}"></script>
  </body>
</html>
`;

writeFileSync(join(CLIENT_DIR, "index.html"), html);
copyFileSync(join(CLIENT_DIR, "index.html"), join(CLIENT_DIR, "404.html"));
writeFileSync(join(CLIENT_DIR, ".nojekyll"), "");
console.log(`✓ Wrote ${CLIENT_DIR}/{index.html, 404.html, .nojekyll}  (base="${BASE}")`);

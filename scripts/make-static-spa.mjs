// Postbuild: generate dist/client/index.html (+ 404.html) for static hosting.
// Spawns `vite dev`, fetches "/" to capture the SSR'd HTML, then rewrites
// dev-only asset URLs to the production bundle in dist/client/assets.
import { spawn } from "node:child_process";
import { readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.GH_PAGES_BASE || "/";
const PORT = 4179;
const CLIENT_DIR = "dist/client";

const assets = readdirSync(join(CLIENT_DIR, "assets"));
const jsEntry = assets.find((f) => /^index-[A-Za-z0-9]+\.js$/.test(f));
const cssEntry = assets.find((f) => /^styles-[A-Za-z0-9]+\.css$/.test(f));
if (!jsEntry || !cssEntry) {
  throw new Error("Could not locate built JS/CSS entries in dist/client/assets");
}

const child = spawn("npx", ["vite", "dev", "--port", String(PORT), "--host", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env },
});
child.stdout.on("data", () => {});
child.stderr.on("data", () => {});

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Dev server did not become ready in time");
}

try {
  let html = await waitForServer(`http://127.0.0.1:${PORT}/`);

  const assetBase = `${BASE.replace(/\/$/, "")}/assets`;
  // 1) styles: replace dev /src/styles.css with built css
  html = html.replace(/\/src\/styles\.css/g, `${assetBase}/${cssEntry}`);
  // 2) drop tanstack dev-only stylesheet
  html = html.replace(/<link rel="stylesheet" href="\/@tanstack-start\/styles\.css[^"]*"[^/]*\/>/g, "");
  // 3) client entry references (preload + manifest + script src)
  html = html.replace(/\/@id\/virtual:tanstack-start-dev-client-entry/g, `${assetBase}/${jsEntry}`);
  // 4) prefix any remaining root-absolute hrefs/srcs with BASE when not already
  if (BASE !== "/") {
    html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE.replace(/\/$/, "")}/`);
  }

  writeFileSync(join(CLIENT_DIR, "index.html"), html);
  // GitHub Pages SPA fallback
  copyFileSync(join(CLIENT_DIR, "index.html"), join(CLIENT_DIR, "404.html"));
  // Prevent Jekyll from ignoring _headers / underscored files
  writeFileSync(join(CLIENT_DIR, ".nojekyll"), "");
  console.log(`✓ Wrote ${CLIENT_DIR}/index.html (base=${BASE})`);
} finally {
  child.kill("SIGTERM");
}

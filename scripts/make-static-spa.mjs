// Static-SPA generator for GitHub Pages.
//
// TanStack Start is an SSR framework. To ship it as a static SPA we:
//   1) spawn `vite dev` on an isolated port,
//   2) fetch the SSR'd "/" HTML,
//   3) rewrite dev-only asset URLs to the production bundle in dist/client,
//   4) write dist/client/{index.html, 404.html, .nojekyll}.
//
// Run AFTER `STATIC_BUILD=1 vite build` so dist/client/assets already exists.
import { spawn } from "node:child_process";
import { existsSync, readdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.GH_PAGES_BASE || "/";
const PORT = Number(process.env.STATIC_SPA_PORT || 4179);
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

console.log(`→ Starting vite dev on :${PORT} to snapshot SSR HTML…`);
const child = spawn(
  "npx",
  ["--yes", "vite", "dev", "--port", String(PORT), "--host", "127.0.0.1", "--strictPort"],
  { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "development" } },
);

let serverLog = "";
child.stdout.on("data", (d) => (serverLog += d.toString()));
child.stderr.on("data", (d) => (serverLog += d.toString()));

async function snapshot() {
  const deadline = Date.now() + 90_000;
  let lastErr = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`);
      if (res.ok) return await res.text();
      lastErr = `HTTP ${res.status}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error(`vite dev did not serve "/" in time (last: ${lastErr})\n--- server log ---\n${serverLog}`);
}

try {
  let html = await snapshot();

  const baseNoSlash = BASE.replace(/\/$/, "");
  const assetBase = `${baseNoSlash}/assets`;

  // Strip CDN/dev injected scripts that don't belong on a static site
  html = html.replace(/<script[^>]+src="https?:\/\/cdn\.gpteng\.co[^"]*"[^<]*<\/script>/g, "");
  // Replace dev stylesheet refs with built CSS
  html = html.replace(/\/src\/styles\.css/g, `${assetBase}/${cssEntry}`);
  // Drop tanstack dev-only injected stylesheet
  html = html.replace(/<link[^>]+\/@tanstack-start\/styles\.css[^>]*\/?>/g, "");
  // Replace virtual client entry references (preload + manifest + module script)
  html = html.replace(/\/@id\/virtual:tanstack-start-dev-client-entry/g, `${assetBase}/${jsEntry}`);
  // Prefix any remaining root-absolute URLs with BASE when serving from a subpath
  if (baseNoSlash) {
    html = html.replace(/(href|src)="\/(?!\/)/g, `$1="${baseNoSlash}/`);
  }

  writeFileSync(join(CLIENT_DIR, "index.html"), html);
  copyFileSync(join(CLIENT_DIR, "index.html"), join(CLIENT_DIR, "404.html"));
  writeFileSync(join(CLIENT_DIR, ".nojekyll"), "");
  console.log(`✓ Wrote ${CLIENT_DIR}/{index.html, 404.html, .nojekyll}  (base="${BASE}")`);
} catch (err) {
  console.error("✗ Failed to generate static index.html");
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
  // Give it a moment to release the port before the process exits
  await new Promise((r) => setTimeout(r, 200));
}

// Postbuild for GitHub Pages static export.
// After `STATIC_BUILD=1 vite build`, TanStack Start's nitro prerender writes
// dist/client/index.html. This script just adds the SPA fallback + .nojekyll.
import { existsSync, copyFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const CLIENT_DIR = "dist/client";
const indexPath = join(CLIENT_DIR, "index.html");

if (!existsSync(indexPath)) {
  console.error("✗ dist/client/index.html not found.");
  console.error("  Prerender step likely failed. dist/client contents:");
  try {
    for (const f of readdirSync(CLIENT_DIR)) console.error("   -", f);
  } catch {}
  process.exit(1);
}

// SPA fallback so deep links don't 404 on GitHub Pages
copyFileSync(indexPath, join(CLIENT_DIR, "404.html"));
// Prevent GitHub Pages' Jekyll from filtering underscored files
writeFileSync(join(CLIENT_DIR, ".nojekyll"), "");

console.log("✓ Static export ready in dist/client (index.html + 404.html + .nojekyll)");

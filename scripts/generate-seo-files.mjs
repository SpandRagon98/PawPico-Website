// Generates public/robots.txt and public/sitemap.xml.
//
// Why a script rather than app/robots.ts + app/sitemap.ts: this repo builds
// through two toolchains. `npm run build:pages` (both deploy targets) uses real
// `next build`, which supports Next metadata routes — but `npm test` builds with
// vinext, which does not. Files written into public/ are copied verbatim by
// every build path, so the contract can be tested as well as shipped.
//
// Runs automatically via the `prebuild` / `prebuild:pages` npm hooks.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const publicDir = join(repositoryRoot, "public");

// mewmuze.com is the canonical production domain. The sitemap always advertises
// it, on every build target — a sitemap listing mirror URLs would invite the
// mirror to be indexed in place of production.
const CANONICAL_ORIGIN = "https://mewmuze.com";

// build-pages.mjs forces GITHUB_PAGES=true for both targets, so HOSTINGER_BUILD
// is what actually distinguishes production from the mirror.
const isMirrorBuild =
  process.env.HOSTINGER_BUILD !== "true" && process.env.GITHUB_PAGES === "true";

/**
 * Public, canonical, indexable pages only.
 *
 * Deliberately excluded:
 *  - /store/<slug>/  — app/store/layout.tsx wraps these and canonicalises every
 *    one of them to /store/, so listing them would contradict the page's own
 *    canonical tag. Add them here only if they are given individual canonicals.
 *  - /checkout/success/, /checkout/cancelled/ — transactional, never a landing page
 *  - /api/*, /updates/latest.json — machine endpoints
 *  - installer binaries — these live in GitHub Releases, not the sitemap
 */
const PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/support/", changefreq: "monthly", priority: "0.8" },
  { path: "/store/", changefreq: "monthly", priority: "0.5" },
];

/** Last commit date, so lastmod reflects a real content change rather than the clock. */
function lastModified() {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (iso) return iso.split("T")[0];
  } catch {
    // Shallow clone or git unavailable — fall through to today.
  }
  return new Date().toISOString().split("T")[0];
}

function buildRobots() {
  if (isMirrorBuild) {
    return [
      `# GitHub Pages mirror of ${CANONICAL_ORIGIN} — not the canonical site.`,
      "# Blocked so it cannot compete with production for the same content.",
      "User-agent: *",
      "Disallow: /",
      "",
    ].join("\n");
  }

  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Transactional pages: never useful search landing pages.",
    "Disallow: /checkout/",
    "",
    "# Machine endpoints: commerce API, signed updater manifest, binaries.",
    "Disallow: /api/",
    "Disallow: /updates/",
    "Disallow: /downloads/",
    "",
    `Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`,
    "",
  ].join("\n");
}

function buildSitemap(lastmod) {
  const urls = PAGES.map(({ path, changefreq, priority }) =>
    [
      "  <url>",
      `    <loc>${CANONICAL_ORIGIN}${path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n"),
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const lastmod = lastModified();
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "robots.txt"), buildRobots(), "utf8");
writeFileSync(join(publicDir, "sitemap.xml"), buildSitemap(lastmod), "utf8");

console.log(
  isMirrorBuild
    ? "SEO files written for the GitHub Pages mirror (indexing blocked)."
    : `SEO files written for ${CANONICAL_ORIGIN} — ${PAGES.length} sitemap URLs, lastmod ${lastmod}.`,
);

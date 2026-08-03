import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const basePath =
  process.env.HOSTINGER_BUILD === "true"
    ? ""
    : process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website";
const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const storeHtml = await readFile(new URL("../out/store/index.html", import.meta.url), "utf8");
const detailHtml = await readFile(
  new URL("../out/store/mecha-hero/index.html", import.meta.url),
  "utf8",
);

for (const expected of [
  `${basePath}/_next/`,
  `${basePath}/cat/`,
  `${basePath}/og-mewmuze.png`,
]) {
  assert.ok(html.includes(expected), `Static export is missing ${expected}`);
}

if (basePath) {
  assert.doesNotMatch(
    html,
    /(?:src|href|poster)="\/(?:_next|cat|videos|mewmuze-|pawpico-)/,
  );
}
assert.ok(
  storeHtml.includes("The wardrobe is still being stitched."),
  "Static export is missing the Store hero",
);
assert.ok(
  storeHtml.includes(`${basePath}/store/mecha-hero/`),
  "Store links do not include the Pages base path",
);
assert.ok(detailHtml.includes("Mecha Hero"), "Static export is missing concept detail pages");
if (basePath) {
  assert.ok(
    !storeHtml.includes(`href="${basePath}${basePath}`),
    "A Store link contains the Pages base path twice",
  );
}
if (basePath) {
  assert.doesNotMatch(
    storeHtml,
    /(?:src|href)="\/(?:_next|cat|store|mewmuze-|pawpico-)/,
  );
}
assert.doesNotMatch(
  storeHtml,
  /Iron Man|Spider-Man|Captain America|Avengers|Naruto|Itachi|Mock buy|\$\d+\.\d{2}|Dummy total|USD/i,
);
assert.doesNotMatch(storeHtml, /\sdownload(?:=|\s|>)/i);

for (const file of [
  "../out/index.html",
  "../out/cat/mewmuze-hero-front-body-hd.png",
  "../out/cat/mewmuze-hero-front-head-hd.png",
  "../out/cat/mewmuze-face-logo-hd.png",
  "../out/cat/features/cursor.webp",
  "../out/cat/appearance/white-curious.webp",
  "../out/og-mewmuze.png",
  "../out/videos/desktop-physics.mp4",
  "../out/store/index.html",
  "../out/store/mecha-hero/index.html",
]) {
  assert.ok((await stat(new URL(file, import.meta.url))).size > 0, `${file} is empty`);
}

await assert.rejects(access(new URL("../out/store/products", import.meta.url)));
await assert.rejects(access(new URL("../out/store/samples", import.meta.url)));

// --- SEO contract -----------------------------------------------------------
// robots.txt and sitemap.xml must ship with every build. They are generated into
// public/ by scripts/generate-seo-files.mjs, so a broken prebuild hook would
// otherwise fail silently and only be noticed as a 404 in production.
const isHostingerBuild = process.env.HOSTINGER_BUILD === "true";
const robotsTxt = await readFile(new URL("../out/robots.txt", import.meta.url), "utf8");
const sitemapXml = await readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8");

// Costume concepts are pre-release studies with nothing purchasable behind them.
// They stay readable for visitors but are deliberately kept out of search, so the
// exported HTML must carry a real noindex rather than relying on the store layout
// canonicalising every child route to /store/.
assert.match(
  detailHtml,
  /<meta name="robots" content="[^"]*noindex[^"]*"/,
  "Concept detail pages must carry an explicit noindex",
);
assert.match(
  detailHtml,
  /<link rel="canonical" href="[^"]*\/store\/mecha-hero\/"/,
  "Concept detail pages must canonicalise to themselves, not to /store/",
);
assert.doesNotMatch(
  storeHtml,
  /<meta name="robots" content="[^"]*noindex/,
  "The store index itself must stay indexable",
);

assert.ok(robotsTxt.trim().length > 0, "out/robots.txt is empty");
assert.ok(sitemapXml.trim().length > 0, "out/sitemap.xml is empty");

if (isHostingerBuild) {
  assert.match(
    robotsTxt,
    /^Sitemap: https:\/\/mewmuze\.com\/sitemap\.xml$/m,
    "Production robots.txt must advertise the canonical sitemap",
  );
  for (const disallowed of ["/checkout/", "/api/", "/updates/", "/downloads/"]) {
    assert.ok(
      robotsTxt.includes(`Disallow: ${disallowed}`),
      `Production robots.txt must disallow ${disallowed}`,
    );
  }

  assert.match(sitemapXml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemapXml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);

  const locations = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locations.length > 0, "Sitemap contains no URLs");
  assert.equal(
    new Set(locations).size,
    locations.length,
    "Sitemap contains duplicate URLs",
  );

  for (const loc of locations) {
    assert.ok(
      loc.startsWith("https://mewmuze.com/"),
      `Sitemap URL is not a canonical production URL: ${loc}`,
    );
    // Transactional routes, machine endpoints, binaries and dev hosts must never
    // be advertised for indexing.
    assert.doesNotMatch(
      loc,
      /\/checkout\/|\/api\/|\/updates\/|\/downloads\/|localhost|127\.0\.0\.1|github\.io|\.exe$|\.sig$|\.json$/i,
      `Sitemap URL must not be advertised for indexing: ${loc}`,
    );
  }
} else {
  // The GitHub Pages mirror serves the same content on a second host. Letting it
  // be indexed would split ranking credit with mewmuze.com.
  assert.match(
    robotsTxt,
    /User-agent: \*\s*\nDisallow: \/\s*$/m,
    "The GitHub Pages mirror must block indexing entirely",
  );
}

console.log(
  `GitHub Pages export verified for ${basePath || "/"} (SEO contract: robots.txt + sitemap.xml OK)`,
);

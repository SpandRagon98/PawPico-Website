import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function source(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("renders the exact MewMuze hero, brand, and primary story actions", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();

  assert.match(html, /<title>MewMuze — Your Personal Desktop Cat<\/title>/);
  assert.match(html, /A PERSONAL DESKTOP CAT FOR WINDOWS/);
  assert.match(html, /Your screen could use a little more life\./);
  assert.match(html, /MewMuze lives quietly on your desktop/);
  assert.match(html, /Hi\. I live here now\./);
  assert.match(html, />Explore Now/);
  assert.match(html, />See every feature/);
  assert.match(html, /mewmuze-flower-cat\.png/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /Store[\s\S]*Coming Soon/);
  assert.doesNotMatch(await source("../app/page.tsx"), /\bPawPico\b/);
});

test("implements one lightweight cursor loop with touch and reduced-motion fallbacks", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /requestAnimationFrame/);
  assert.match(page, /window\.addEventListener\("pointermove", track/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /visibilitychange/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /\(pointer: fine\)/);
  assert.match(page, /leftPupilRef/);
  assert.match(page, /catMotionRef/);
  assert.match(page, /touch-look/);
  assert.doesNotMatch(
    page.match(/const track =[\s\S]*?const observer =/)?.[0] ?? "",
    /set[A-Z]\w*\(/,
  );

  assert.match(css, /\.cat-pupil/);
  assert.match(css, /\.touch-look \.hero-cat/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.cat-pupil,[\s\S]*\.hero-cat-motion[\s\S]*transform: none !important/);
});

test("moves Explore Now into the feature experience and restores focus", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /setJourneyState\("moving"\)/);
  assert.match(page, /querySelector\("#features"\)\?\.scrollIntoView/);
  assert.match(page, /theatreHeadingRef\.current\?\.focus/);
  assert.match(page, /journeyState === "moving"/);
  assert.match(css, /@keyframes cat-travel/);
  assert.match(css, /\.hero-cat-motion\.is-travelling/);
});

test("ships a one-at-a-time, keyboard and touch accessible 20-feature theatre", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const features = await source("../data/features.ts");

  assert.match(html, /THE FEATURE THEATRE/);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /Previous feature/);
  assert.match(html, /Next feature/);
  assert.equal((html.match(/<video/g) ?? []).length, 1);
  assert.equal((features.match(/number: "\d\d"/g) ?? []).length, 20);

  for (const title of [
    "Cursor companion",
    "Petting",
    "Doze and sleep",
    "Work Mode",
    "Clipboard Assistant",
    "Focus Mode",
    "Pomodoro",
    "Break and water reminders",
    "Custom reminders",
    "Gmail",
    "Google Calendar",
    "Desktop Physics",
    "Context aware",
    "Music",
    "Microphone reaction",
    "Appearance Studio",
    "Personality and rest",
    "Peek Mode",
    "Local Agent Status",
    "Lightweight Windows companion",
  ]) {
    assert.match(features, new RegExp(title));
  }

  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    assert.match(page, new RegExp(`"${key}"`));
  }
  assert.match(page, /event\.pointerType !== "mouse"/);
  assert.match(page, /Math\.abs\(distance\) > 46/);
  assert.match(page, /disabled=\{activeIndex === 0\}/);
  assert.match(page, /disabled=\{activeIndex === featureStories\.length - 1\}/);
});

test("keeps every checked-in feature film relevant and renders only the active one", async () => {
  const features = await source("../data/features.ts");
  const paths = Array.from(features.matchAll(/video: "(\/[^"]+\.mp4)"/g), (match) => match[1]);
  assert.equal(paths.length, 20);

  for (const path of new Set(paths)) {
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).size > 10_000, path);
  }

  const page = await source("../app/page.tsx");
  assert.match(page, /key=\{feature\.id\}/);
  assert.match(page, /autoPlay/);
  assert.match(page, /muted/);
  assert.match(page, /playsInline/);
  assert.doesNotMatch(page, /setInterval/);
});

test("renders the connected companionship narrative and complete grouped directory", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /Most desktops do their job\./);
  assert.match(html, /They just don&#x27;t keep you company\./);
  assert.match(html, /Then a tiny pair of green eyes appears\./);
  for (const moment of ["8:47", "10:30", "1:15", "3:00", "5:48"]) {
    assert.match(html, new RegExp(moment.replace(":", "[:]")));
  }
  for (const group of [
    "Helps me work",
    "Keeps me on track",
    "Lives on my desktop",
    "Reacts to my day",
    "Looks like mine",
    "Respects my privacy",
  ]) {
    assert.match(html, new RegExp(group));
  }
  assert.equal((html.match(/class="directory-dot/g) ?? []).length, 20);
});

test("presents the accurate Appearance Studio and current Flower Band preset", async () => {
  const response = await render();
  const html = await response.text();

  for (const body of ["Classic", "Chonk", "Fluffy", "Siamese", "Kitten"]) {
    assert.match(html, new RegExp(`>${body}<`));
  }
  for (const pattern of ["Solid", "Tuxedo", "Tabby", "Socks", "Spotted", "Calico", "Bicolour"]) {
    assert.match(html, new RegExp(`>${pattern}<`));
  }
  assert.match(html, /Fur · eyes · inner ears/);
  assert.match(html, /Small · medium · large/);
  assert.match(html, /None · Flower Band/);
  assert.match(html, /FLOWER BAND/);
  assert.match(html, /Exact body and coat rendering remains inside the app/);
  assert.doesNotMatch(html, /12 accessories/);
});

test("explains privacy without inventing screen, email-body, or microphone access", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /Local file work/);
  assert.match(html, /Gmail envelope only/);
  assert.match(html, /never the email body/);
  assert.match(html, /Private calendar feed/);
  assert.match(html, /No microphone audio/);
  assert.match(html, /not a recording or transcription/);
  assert.match(html, /No hidden screen reading/);
  assert.match(html, /Your reminders/);
  assert.doesNotMatch(html, /voice command/i);
});

test("uses the professional white tactile design system at every target breakpoint", async () => {
  const css = await source("../app/globals.css");

  for (const token of [
    "--background: #f5f6f7",
    "--surface: #ffffff",
    "--recessed: #e8eaed",
    "--text: #202326",
    "--mint: #a9d8bd",
    "--pink: #e7a5b8",
    "--lavender: #bbb7e8",
    "--powder: #b5d5ed",
    "--peach: #f2c7a7",
    "--yellow: #f5dfa0",
  ]) {
    assert.match(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(css, /\.skeuo-button/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /@media \(max-width: 1180px\)/);
  assert.match(css, /@media \(max-width: 960px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /image-rendering: pixelated/);
  assert.doesNotMatch(css, /backdrop-filter|repeating-linear-gradient|linear-gradient|radial-gradient/i);
});

test("uses the supplied authentic cat as a transparent crisp asset and social card", async () => {
  const cat = await readFile(new URL("../public/mewmuze-flower-cat.png", import.meta.url));
  assert.equal(cat.toString("ascii", 1, 4), "PNG");
  assert.equal(cat.readUInt32BE(16), 55);
  assert.equal(cat.readUInt32BE(20), 86);
  assert.equal(cat[25], 6, "cat PNG must retain RGBA transparency");

  const social = await stat(new URL("../public/og-mewmuze.png", import.meta.url));
  assert.ok(social.size > 20_000);
  const layout = await source("../app/layout.tsx");
  assert.match(layout, /og-mewmuze\.png/);
  assert.match(layout, /themeColor: "#f5f6f7"/);
});

test("renders an original-concepts-only Coming Soon store with no order flow", async () => {
  const response = await render("/store");
  assert.equal(response.status, 200);
  const html = await response.text();
  const catalog = await source("../data/store/catalog.ts");

  assert.match(html, /<title>MewMuze Store — Coming Soon<\/title>/);
  assert.match(html, /THE MEWMUZE WARDROBE/);
  assert.match(html, /The wardrobe is still being stitched\./);
  assert.match(html, /New looks are on the way/);
  assert.equal((html.match(/class="concept-card"/g) ?? []).length, 10);

  for (const concept of [
    "Mecha Hero",
    "Shield Guardian",
    "Web Scout",
    "Shadow Ninja",
    "Winter Star",
    "Cosmic Explorer",
    "Moon Mage",
    "Pixel Knight",
    "Cozy Barista",
    "Royal Wanderer",
  ]) {
    assert.match(html, new RegExp(concept));
  }

  assert.doesNotMatch(catalog, /price|currency|purchase|packagePath|availability/i);
  assert.doesNotMatch(
    html,
    /\$\d+\.\d{2}|Dummy total|USD|Mock|Add to|Buy now|Verify & install|download=/i,
  );
  assert.doesNotMatch(html, /Iron Man|Spider-Man|Captain America|Avengers|Naruto|Itachi/i);
});

test("renders static Coming Soon concept notes without packages or installation actions", async () => {
  const response = await render("/store/mecha-hero");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Mecha Hero/);
  assert.match(html, /Coming Soon/);
  assert.match(html, /A direction/);
  assert.match(html, /not a finished product/);
  assert.match(html, /Nothing can be ordered/);
  assert.doesNotMatch(html, /Mock buy|Install in MewMuze|\.mewcostume|\$\d/i);

  await assert.rejects(access(new URL("../public/store", import.meta.url)));
  await assert.rejects(access(new URL("../scripts/generate-iron-man-cat-costume.mjs", import.meta.url)));
});

test("keeps GitHub Pages routing and canonical metadata base-path safe", async () => {
  const nextConfig = await source("../next.config.ts");
  const helper = await source("../lib/site-path.ts");
  const workflow = await source("../.github/workflows/deploy.yml");
  const layout = await source("../app/layout.tsx");
  const storeLayout = await source("../app/store/layout.tsx");

  assert.match(nextConfig, /output: "export"/);
  assert.match(nextConfig, /basePath: pagesBasePath/);
  assert.match(nextConfig, /assetPrefix: pagesBasePath/);
  assert.match(helper, /NEXT_PUBLIC_BASE_PATH/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(layout, /alternates: \{ canonical/);
  assert.match(storeLayout, /MewMuze Store — Coming Soon/);
  assert.match(storeLayout, /Preview upcoming original costume concepts/);
});

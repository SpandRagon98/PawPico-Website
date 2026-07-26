import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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

test("server-renders the complete current MewMuze product story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>MewMuze — One tiny cat\. An entire inner life\.<\/title>/i);
  assert.match(html, /Your desktop,/);
  assert.match(html, /87[\s\S]*motion states/);
  assert.match(html, /Work mode &amp; Quick Tools/);
  assert.match(html, /Gmail connector/);
  assert.match(html, /Google Calendar connector/);
  assert.match(html, /Notifications &amp; reminders/);
  assert.match(html, /Music, microphone &amp; sound/);
  assert.match(html, /Local AI-agent companion/);
  assert.match(html, /THE COMPLETE MOTION ARCHIVE/);
  assert.doesNotMatch(html, /voice commands/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("leads with the five priority systems and ships accurate connector films", async () => {
  const response = await render();
  const html = await response.text();
  for (const label of ["Work mode", "Gmail connector", "Google Calendar", "Smart notifications", "Appearance studio"]) {
    assert.match(html, new RegExp(label));
  }
  for (const video of [
    "work-mode.mp4",
    "gmail-connector.mp4",
    "calendar-connector.mp4",
    "smart-notifications.mp4",
    "customization-studio.mp4",
  ]) {
    assert.match(html, new RegExp(video.replace(".", "\\.")));
    assert.ok((await stat(new URL(`../public/videos/${video}`, import.meta.url))).size > 70_000);
  }
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /60 s poll/);
  assert.match(page, /5 min sync/);
  assert.match(page, /mark done/);
});

test("ships the full source-verified directory with a relevant film for every group", async () => {
  const response = await render();
  const html = await response.text();
  assert.equal((html.match(/class="feature-drawer"/g) ?? []).length, 13);
  assert.equal((html.match(/class="drawer-film"/g) ?? []).length, 13);
  for (const label of [
    "Movement &amp; desktop physics",
    "Cursor, petting &amp; mochi",
    "Context-aware companion",
    "Personality, moods &amp; rest",
    "Focus, breaks &amp; Pomodoro",
    "Windows behavior &amp; controls",
  ]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="#command-deck"/);
  assert.match(html, /href="#complete"/);
  assert.match(html, /href="#motion"/);
  assert.match(html, /href="#privacy"/);
  assert.match(html, /og:image/);
  assert.match(html, /\/og-v2\.png/);
});

test("shows three feature cards first, then expands the complete directory smoothly", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /See all 13 features/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /class="feature-expansion(?:\s|")/);
  assert.match(html, /aria-hidden="true"/);

  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /filteredGroups\.slice\(0,\s*3\)/);
  assert.match(page, /filteredGroups\.slice\(3\)/);
  assert.match(page, /setShowAllFeatures\(false\)/);
  assert.match(page, /key=\{`\$\{group\.id\}-\$\{shouldPlay \? "playing" : "paused"\}`\}/);
  assert.match(page, /event\.currentTarget\.play\(\)/);
  assert.doesNotMatch(html, /Nothing here is inferred from marketing copy/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /grid-template-rows:\s*0fr/);
  assert.match(css, /\.feature-expansion\.is-open\s*\{[^}]*grid-template-rows:\s*1fr/s);
  assert.match(css, /@keyframes feature-reveal/);
  assert.match(css, /@keyframes panel-swap/);
  assert.match(css, /\.feature-filter button\s*\{[^}]*font:\s*800 12px[^;]*var\(--pixel\)/s);
});

test("presents all 87 states as one motion banner instead of a box ledger", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /class="motion-banner"/);
  assert.match(html, /DEFINED[\s\S]*MOTION STATES/);
  assert.match(html, /MewMuze motion states:/);
  assert.doesNotMatch(html, /class="ledger-grid"|class="motion-orb"/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes motion-stream/);
  assert.match(css, /\.motion-banner-count b\s*\{[^}]*clamp\(88px,8vw,136px\)/s);
  assert.doesNotMatch(css, /\.ledger-grid|\.motion-orb/);
});

test("keeps the supplied logo, orange identity, end-only price, and premium responsive layout", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /\/pawpico-idle-reel\.mp4/);
  assert.match(html, /\/pawpico-face-logo\.png/);
  assert.equal((html.match(/\$5\.99/g) ?? []).length, 1);
  assert.match(html, /ONE-TIME PRICE/);
  assert.match(html, /ACTUAL IN-APP ANIMATION/);

  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /setInterval|data-theme|paletteIndex|Soft gray|Blush pink/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--copper:\s*#c06643/);
  assert.match(css, /--display:\s*Georgia,\s*"Times New Roman",\s*serif/);
  assert.match(css, /--sans:\s*"Gotham",\s*var\(--font-montserrat\),\s*"Avenir Next",\s*Arial,\s*Helvetica,\s*sans-serif/);
  assert.match(css, /--pixel:\s*"Courier New"/);
  assert.match(css, /backdrop-filter:\s*blur\(18px\)/);
  assert.match(css, /@media \(max-width: 1180px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /safe-area-inset/);
  assert.match(css, /\.section-shell\s*\{\s*width:\s*min\(1540px/);
  assert.match(css, /100svh/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.drawer-film\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.match(css, /\.privacy-grid b\s*\{[^}]*font:\s*800 14px/s);
  assert.match(css, /\.privacy-grid small\s*\{[^}]*font-size:\s*15px/s);
  assert.doesNotMatch(css, /data-theme|theme-cycle|palette-dots/);
  assert.doesNotMatch(css, /repeating-linear-gradient|scanlines|font-cormorant/);

  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /Montserrat/);
  assert.doesNotMatch(layout, /Cormorant/);
  assert.doesNotMatch(html, /scanlines|↓|↘|↗/);
});

test("uses MewMuze throughout customer-facing copy and keeps button labels legible", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /MewMuze is an expressive pixel cat/);
  assert.match(html, /Get MewMuze/);
  assert.match(html, /MEWMUZE PERSONALITY CORE/);
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /\bPawPico\b/);
  assert.doesNotMatch(layout, /\bPawPico\b/);

  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.metal-button\s*\{[^}]*font:\s*800 13px[^;]*var\(--pixel\)/s);
  assert.match(css, /\.metal-button\.large\s*\{[^}]*font-size:\s*14px/s);
});

test("connector-film generator keeps every animation stage clean and border-only", async () => {
  const script = await readFile(new URL("../scripts/generate-connector-films.py", import.meta.url), "utf8");
  const motionScript = await readFile(new URL("../scripts/render-app-motion-clips.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(script, /range\(0,\s*W,\s*16\)|range\(0,\s*H,\s*16\)|range\(132,\s*600,\s*5\)/);
  assert.doesNotMatch(script, /draw\.rectangle\(\(76,\s*130,\s*651,\s*602\),\s*outline=/);
  assert.match(script, /rounded\(draw,\s*\(57,\s*111,\s*670,\s*623\),\s*16/);
  assert.doesNotMatch(motionScript, /x \+= 16|y \+= 16|fillRect\(42,\s*414,\s*636,\s*5\)/);
});

test("explains local-first privacy honestly now that opt-in connectors exist", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /Local-first\./);
  assert.match(html, /Network only by invitation\./);
  assert.match(html, /Gmail: envelope only/);
  assert.match(html, /Calendar: private feed/);
  assert.match(html, /No screen capture/);
  assert.match(html, /No microphone audio/);
  assert.match(html, /Offline license check/);
  assert.doesNotMatch(html, /makes no network requests/i);
});

test("renders the lightweight Costume Store with clearly marked mock commerce", async () => {
  const response = await render("/store");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Dress[\s\S]*the muse\./);
  assert.match(html, /Mock storefront/);
  assert.match(html, /no payment processing/i);
  assert.match(html, /Pick a new/);
  assert.match(html, /Iron Man Cat/);
  assert.match(html, /Space Explorer/);
  assert.match(html, /Open MewMuze|Install in MewMuze/);
  assert.match(html, /From Store to cat/);
  assert.match(html, /Development sample/);
  assert.doesNotMatch(html, /Spider-Man|Captain America|Naruto|Itachi|Avengers/i);
});

test("keeps every dummy costume price between one and two dollars", async () => {
  const source = await readFile(new URL("../data/store/catalog.ts", import.meta.url), "utf8");
  const prices = Array.from(source.matchAll(/price:\s*(\d+\.\d+)/g), (match) => Number(match[1]));
  assert.equal(prices.length, 10);
  for (const price of prices) {
    assert.ok(price >= 1 && price <= 2, `dummy price ${price} must be in the approved range`);
  }
  assert.match(source, /purchaseProductId/);
  assert.match(source, /supportedBodies/);
  assert.match(source, /minimumAppVersion/);
  const commerce = await readFile(new URL("../lib/store/commerce.ts", import.meta.url), "utf8");
  for (const method of [
    "createCheckoutSession",
    "getPurchaseStatus",
    "getOwnedCostumes",
    "createInstallationToken",
    "refreshInstallationToken",
    "requestSignedDownload",
  ]) {
    assert.match(commerce, new RegExp(method));
  }
});

test("renders static costume detail pages and publishes the secure schema", async () => {
  const response = await render("/store/space-explorer");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Space Explorer/);
  assert.match(html, /Mock buy/);
  assert.match(html, /Visual only/);
  const detailSource = await readFile(new URL("../app/store/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(detailSource, /\["Front", "Side", "Movement"\]/);

  const schema = JSON.parse(
    await readFile(new URL("../public/store/specs/costume-manifest.schema.json", import.meta.url), "utf8"),
  );
  assert.equal(schema.properties.schemaVersion.const, 1);
  assert.deepEqual(schema.properties.signatureKeyId.enum, [
    "store-key-2026-01",
    "store-key-mecha-2026-01",
  ]);
  assert.equal(schema.properties.assets.maxItems, 12);
  assert.ok((await stat(new URL("../public/store/samples/space-explorer-sample.mewcostume", import.meta.url))).size > 0);
  assert.ok((await stat(new URL("../public/store/products/mecha-hero/iron-man-cat.mewcostume", import.meta.url))).size > 0);
});

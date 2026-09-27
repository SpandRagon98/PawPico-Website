import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { execFileSync } from "node:child_process";

test("checkout configuration rejects lookalike hosts, credentials and wrong product paths", () => {
  const moduleUrl = new URL("../lib/commerce.ts", import.meta.url).href;
  for (const configured of [
    "https://checkout.dodopayments.com.evil.example/buy/pdt_0NkWDKYYlGSBLf59iNa4q",
    "https://user:password@checkout.dodopayments.com/buy/pdt_0NkWDKYYlGSBLf59iNa4q",
    "https://checkout.dodopayments.com/buy/pdt_other?reference=pdt_0NkWDKYYlGSBLf59iNa4q",
    "javascript:alert(1)",
    "https://checkout.dodopayments.com:8443/buy/pdt_0NkWDKYYlGSBLf59iNa4q",
  ]) {
    const result = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e",
      `const {commerce}=await import(${JSON.stringify(moduleUrl)}); console.log(JSON.stringify(commerce));`,
    ], { encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_DODO_CHECKOUT_URL: configured,
      NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL: configured } }));
    const checkout = new URL(result.checkoutUrl);
    assert.equal(checkout.origin, "https://checkout.dodopayments.com");
    assert.equal(checkout.pathname, "/buy/pdt_0NkWDKYYlGSBLf59iNa4q");
    assert.equal(checkout.searchParams.get("redirect_url"), "https://mewmuze.com/checkout/success/");
    if (!configured.includes("/buy/pdt_other?")) assert.equal(result.supporterConfigured, false);
  }
});

test("defers hidden appearances and provides motion, touch and script-failure fallbacks", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/carousel-theme.css");
  assert.match(page, /document\.addEventListener\("visibilitychange", sync\)/);
  assert.match(css, /animation-play-state: paused !important/);
  assert.match(css, /@keyframes splash-failsafe/);
  assert.match(css, /min-height: 44px/);
  const headers = await source("../public/.htaccess");
  assert.match(headers, /X-Content-Type-Options "nosniff"/);
  assert.match(headers, /frame-ancestors 'self'/);
  assert.match(headers, /object-src 'none'/);
});

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

test("renders one Montserrat hero with the realistic cat video", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();

  assert.match(html, /<title>MewMuze — Your Personal Desktop Pet<\/title>/);
  assert.match(html, /A PERSONAL DESKTOP PET FOR WINDOWS/);
  assert.match(html, /Your desktop, a little more alive\./);
  assert.match(html, /mewmuze-intro\.mp4/);
  assert.match(html, /mewmuze-intro-poster\.webp/);
  assert.match(html, /realistic-hero-video/);
  assert.equal((html.match(/id="companion"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /class="film-hero"/);
  assert.match(html, /macOS coming soon/);
  assert.match(await source("../app/liquid.css"), /font-family:Montserrat,Arial/);
  assert.match(html, />Explore Now/);
  // scrolling is free from first paint - see the dedicated unlock test
  assert.match(html, /experience-unlocked/);
  assert.match(html, /mewmuze-face-logo-hd\.png/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.doesNotMatch(html, /Store\s*<span class="coming-pill"/);
  assert.doesNotMatch(await source("../app/page.tsx"), /\bPawPico\b/);
});

test("labels Paper experiments and macOS honestly while preserving public downloads", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");
  assert.match(html, /INSIDE THE PAPER LAB/);
  assert.match(html, /come with MewMuze Pro/);
  assert.match(html, /Illustrative conversation, not a live AI chat on this page/);
  assert.match(html, /macOS coming soon/);
  assert.match(page, /macOS coming soon/);
  // Free opens the Microsoft Store listing, now behind the account gate.
  assert.match(page, /<DownloadButton[^>]*href=\{commerce\.freeDownloadUrl\}[^>]*edition="free"/);
  assert.match(page, /Download Free/);
});

test("pauses the hero video when hidden and mounts real refractive glass with fallbacks", async () => {
  const page = await source("../app/page.tsx");
  const glass = await source("../app/GlassSurface.tsx");
  const css = await source("../app/hero-glass.css");
  assert.match(page, /function RealisticHeroVideo/);
  assert.match(page, /!visible \|\| userPaused \|\| \(\(reducedMotion \|\| saveData\) && !manualPlay\)/);
  assert.match(page, /setManualPlay\(true\)/);
  assert.match(page, /video\.pause\(\)/);
  assert.match(page, /preload="none"/);
  assert.match(glass, /import\("liquid-glass-react"\)/);
  assert.match(glass, /displacementScale=/);
  assert.match(glass, /prefers-reduced-motion: reduce/);
  assert.match(css, /@supports not \(\(backdrop-filter/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  // A real film, not a placeholder: the 4.5 s motion-blurred 720p loop is about 630 KB.
  assert.ok((await stat(new URL("../public/film/mewmuze-intro.mp4", import.meta.url))).size > 300_000);
  assert.ok((await stat(new URL("../public/film/mewmuze-intro-poster.webp", import.meta.url))).size > 10_000);
});

test("scrolls freely from the first paint instead of locking until a button is pressed", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  // starts true: every lock/force-scroll/gate in the effect and CSS below is
  // conditioned on `!experienceUnlocked`, so starting unlocked retires the
  // lock without needing to touch the effect, the buttons, or the one-time
  // "assemble" animation they used to trigger (it now just plays on mount)
  assert.match(page, /const \[experienceUnlocked, setExperienceUnlocked\] = useState\(true\)/);
  assert.match(html, /class="experience-unlocked"/);
  // the Explore button no longer carries a permanent "pressed" look now that
  // experienceUnlocked is always true - it only reflects real :active presses
  assert.doesNotMatch(html, /hero-explore is-pressed/);
  assert.match(page, /className="hero-glass-explore"/);

  // the dormant lock machinery stays in the code (harmless: its only trigger
  // is `!experienceUnlocked`, which is now never true), so removing the lock
  // was a one-line default change rather than a rewrite
  assert.match(page, /mewmuze-scroll-locked/);
  assert.match(css, /html\.mewmuze-scroll-locked/);
  assert.match(css, /body\.mewmuze-scroll-locked/);
  assert.match(css, /overflow: hidden !important/);
  assert.match(css, /\.hero \{[\s\S]*height: 100dvh/);
});

test("never trusts checkout redirect fields as proof of payment", async () => {
  const successPage = await source("../app/checkout/success/page.tsx");
  assert.doesNotMatch(successPage, /params\.get\("status"\)/);
  assert.doesNotMatch(successPage, /params\.get\("license_key"\)/);
  assert.match(successPage, /purchase-status\.php\?payment_id=/);
  assert.match(successPage, /body\.fulfilled \? "fulfilled"/);
});

test("records Dodo entitlement grants using the grant ID and nested generated key", async () => {
  const webhook = await source("../hostinger-api/dodo-webhook.php");
  assert.match(webhook, /\['license_key', 'key'\]/);
  assert.match(webhook, /str_starts_with\(\$type, 'entitlement_grant\.'\)/);
  assert.doesNotMatch(webhook, /\['entitlement_id'\], \['id'\]/);
  assert.match(webhook, /\['data'\]\['license_key'\]\['key'\] = '\[redacted\]'/);
  assert.doesNotMatch(webhook, /':payload_json' => \$body/);
});

test("keeps the Dodo seller secret on Hostinger and validates an instance before device lookup", async () => {
  const endpoint = await source("../hostinger-api/license-status.php");
  const workflow = await source("../.github/workflows/deploy.yml");
  assert.match(endpoint, /\/licenses\/validate/);
  assert.match(endpoint, /Authorization: Bearer/);
  assert.ok(endpoint.indexOf("/licenses/validate") < endpoint.indexOf("/license_keys/"));
  assert.match(workflow, /secrets\.DODO_API_KEY/);
  assert.match(workflow, /secrets\.DODO_WEBHOOK_SECRET/);
  assert.match(workflow, /MEWMUZE_DODO_MODE: live_mode/);
  assert.match(workflow, /NEXT_PUBLIC_DODO_MODE: live/);
  assert.match(workflow, /checkout\.dodopayments\.com\/buy\/pdt_0NkWDKYYlGSBLf59iNa4q/);
  assert.doesNotMatch(workflow, /DODO_TEST_API_KEY|DODO_TEST_WEBHOOK_SECRET/);
  assert.doesNotMatch(workflow, /test\.checkout\.dodopayments\.com|pdt_0NkKxv8HzpZgMPTzpIeWT/);
  assert.doesNotMatch(workflow, /NEXT_PUBLIC_DODO_API_KEY/);
});

test("uses the supplied realistic video as the only hero subject", async () => {
  const html = await (await render()).text();
  const hero = html.match(/<section id="companion"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.match(hero, /class="realistic-hero-video"/);
  assert.match(hero, /mewmuze-intro\.mp4/);
  assert.match(hero, /mewmuze-intro-poster\.webp/);
  assert.doesNotMatch(hero, /hero-cat-layer|hero-pupil|hero-cat-peek/);
  assert.match(hero, /Play cat video/);
});

test("retains the existing authentic app animation assets", async () => {
  for (const emotion of ["happy", "sad", "cheerful"]) {
    const media = await readFile(new URL(`../public/cat/hero-emotions/${emotion}.webp`, import.meta.url));
    assert.ok(media.length > 1_000);
    assert.equal(media.toString("ascii", 0, 4), "RIFF");
    assert.equal(media.toString("ascii", 8, 12), "WEBP");
  }
});


test("unlocks into the first section while leaving the landing cat stationary", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /const unlockAndScroll = \(targetId: "#paper-preview" \| "#pricing"\)/);
  assert.match(page, /unlockAndScroll\("#paper-preview"\)/);
  assert.match(page, /window\.scrollTo\(\{/);
  assert.match(page, /target\.getBoundingClientRect\(\)\.top \+ window\.scrollY - 80/);
  assert.doesNotMatch(
    page,
    /setJourneyState|transitionScrollRafRef|theatreHeadingRef|storyHeadingRef/,
  );
  assert.match(page, /className="realistic-hero-video"/);
  assert.match(css, /\.hero-cat-motion\.is-travelling,[\s\S]*animation: none !important/);
});

test("keeps all 31 verified features in the data behind the directory", async () => {
  const features = await source("../data/features.ts");

  assert.equal((features.match(/number: "\d\d"/g) ?? []).length, 31);

  for (const title of [
    "Cursor companion",
    "Petting",
    "Doze and sleep",
    "Work Mode",
    "Spreadsheet Tools",
    "Tasks",
    "Feelings engine",
    "Local Chat",
    "Diary",
    "Adapts to you",
    "Voice to text",
    "Built-in costumes",
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
    "Calculator",
    "Unit Converter",
    "Time Zone Converter",
  ]) {
    assert.match(features, new RegExp(title));
  }
});

test("uses transparent authentic feature media and retains the verified source films", async () => {
  const features = await source("../data/features.ts");
  const ids = Array.from(features.matchAll(/id: "([^"]+)"/g), (match) => match[1]);
  const videos = Array.from(features.matchAll(/video: "(\/[^"]+\.mp4)"/g), (match) => match[1]);
  assert.equal(ids.length, 31);
  assert.equal(videos.length, 31);

  // Features whose card art is a film rather than a transparent cat cutout.
  const customFilms = new Set([
    "calculator",
    "unit-converter",
    "time-converter",
    "spreadsheets",
    "tasks",
    "feelings",
    "chat",
    "diary",
    "adapts",
    "voice",
    "costumes",
  ]);
  for (const id of ids.filter((id) => !customFilms.has(id))) {
    const media = await readFile(new URL(`../public/cat/features/${id}.webp`, import.meta.url));
    assert.ok(media.length > 1_000, id);
    assert.equal(media.toString("ascii", 0, 4), "RIFF");
    assert.equal(media.toString("ascii", 8, 12), "WEBP");
  }
  for (const path of new Set(videos)) {
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).size > 10_000, path);
  }

  const page = await source("../app/page.tsx");
  assert.match(page, /className="realistic-hero-video"/);
  assert.match(page, /preload="none"/);
});

test("keeps the complete grouped feature directory", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /THE COMPLETE FEATURE DIRECTORY/);
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
  assert.equal((html.match(/class="directory-dot/g) ?? []).length, 31);
  // Every group starts collapsed, and the directory carries no GlassSurface:
  // a refraction pane per group was heavy and misplaced itself on collapse.
  assert.doesNotMatch(html, /directory-panel-glass/);
  assert.doesNotMatch(html, /directory-panel is-open/);
});

test("keeps the Pro purchase flow on the Dodo live checkout", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const commerce = await source("../lib/commerce.ts");

  assert.match(html, /ONE-TIME PRICE/);
  assert.match(html, /\$7\.99/);
  assert.match(html, /Roughly two burgers\. Hers lasts longer\./);
  assert.match(html, /A desktop pet who actually shows up/);
  assert.match(html, /Nothing leaves your machine/);
  assert.match(html, /Dodo Payments/);
  assert.match(html, /https:\/\/checkout\.dodopayments\.com/);
  assert.match(html, /pdt_0NkWDKYYlGSBLf59iNa4q/);
  assert.match(html, /Buy MewMuze securely/);
  assert.match(html, /Dodo confirms the exact amount and currency before you pay/);
  assert.doesNotMatch(html, /Available after 15 August 2026|following the official release/);
  assert.match(page, /pricing-gate/);
  assert.match(commerce, /url\.searchParams\.set\("redirect_url", CHECKOUT_SUCCESS_URL\)/);
  assert.doesNotMatch(html, /test\.checkout\.dodopayments\.com|pdt_0NkKxv8HzpZgMPTzpIeWT|no real charge is made/);
  assert.doesNotMatch(commerce, /test\.checkout\.dodopayments\.com|pdt_0NkKxv8HzpZgMPTzpIeWT/);
  assert.match(commerce, /NEXT_PUBLIC_DODO_CHECKOUT_URL/);
  assert.doesNotMatch(html, /Limited-time|refund policy/i);
});

test("shows rupees to Indian visitors and dollars to everyone else", async () => {
  const { prefersRupees, priceLabelFor } = await import("../lib/commerce.ts");
  const html = await (await render()).text();

  assert.equal(priceLabelFor(false, false), "$7.99");
  assert.equal(priceLabelFor(true, false), "₹549");
  assert.equal(priceLabelFor(true, true), "₹649");

  // The paid server-rendered price stays in dollars because one static file is
  // served worldwide; the Indian paid amount only appears after mount.
  assert.match(html, /\$7\.99/);
  assert.doesNotMatch(html, /₹549/);

  const withZone = (zone) => {
    const real = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function () {
      return { resolvedOptions: () => ({ timeZone: zone }) };
    };
    try {
      return prefersRupees();
    } finally {
      Intl.DateTimeFormat = real;
    }
  };
  assert.equal(withZone("Asia/Kolkata"), true);
  assert.equal(withZone("Asia/Calcutta"), true); // legacy alias
  assert.equal(withZone("America/New_York"), false);
});

test("uses the face-only MewMuze mark for navigation, metadata, and Store branding", async () => {
  const home = await (await render()).text();
  const store = await (await render("/store")).text();
  const layout = await source("../app/layout.tsx");
  const logo = await readFile(new URL("../public/cat/mewmuze-face-logo-hd.png", import.meta.url));

  assert.match(home, /mewmuze-face-logo-hd\.png/);
  assert.match(store, /mewmuze-face-logo-hd\.png/);
  assert.match(layout, /mewmuze-face-logo-192\.png/);
  assert.match(layout, /mewmuze-face-logo-32\.png/);
  assert.match(layout, /mewmuze-face-logo-180\.png/);
  assert.equal(logo.readUInt32BE(16), 512);
  assert.equal(logo.readUInt32BE(20), 512);
  assert.equal(logo[25], 6);
});

test("keeps the original reference and ships native app-density seated layers", async () => {
  const oldCat = await readFile(new URL("../public/mewmuze-flower-cat.png", import.meta.url));
  const heroBody = await readFile(
    new URL("../public/cat/mewmuze-hero-front-body-app.png", import.meta.url),
  );
  const heroHead = await readFile(
    new URL("../public/cat/mewmuze-hero-front-head-app.png", import.meta.url),
  );
  const reference = await readFile(
    new URL("../public/cat/mewmuze-hero-reference-hd.png", import.meta.url),
  );
  const appReference = await readFile(
    new URL("../public/cat/mewmuze-hero-reference-app.png", import.meta.url),
  );
  const renderer = await source("../scripts/render-authentic-web-assets.mjs");

  assert.equal(oldCat.readUInt32BE(16), 55);
  assert.equal(oldCat.readUInt32BE(20), 86);
  assert.equal(heroBody.readUInt32BE(16), 128);
  assert.equal(heroBody.readUInt32BE(20), 128);
  assert.equal(heroHead.readUInt32BE(16), 128);
  assert.equal(heroHead.readUInt32BE(20), 128);
  assert.equal(reference.readUInt32BE(16), 768);
  assert.equal(reference.readUInt32BE(20), 768);
  assert.equal(appReference.readUInt32BE(16), 128);
  assert.equal(appReference.readUInt32BE(20), 128);
  assert.equal(heroBody[25], 6);
  assert.equal(heroHead[25], 6);
  assert.match(renderer, /spriteLoader\.ts/);
  assert.match(renderer, /animationDefinitions\.ts/);
  assert.match(renderer, /export const ART = \$\{art\}/);
  assert.match(renderer, /PAWPICO_APP_ROOT is required and is used read-only/);
  assert.match(renderer, /Math\.round\(60 \/ meta\.fps\)/);
  assert.match(renderer, /openRenderer\(browser, 128, false\)/);
  assert.match(renderer, /featureRenderer = await openRenderer\(browser, 128, false\)/);
  assert.match(renderer, /durations\.push\(outputIndex % 3 === 2 \? 16 : 17\)/);
  assert.match(renderer, /furColor: "#eeeae3"/);
  assert.match(renderer, /pattern: "solid"/);
  assert.match(renderer, /accessory: "flowerCrown"/);
});

test("never invents voice commands in the homepage copy", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /voice command/i);
});

test("preserves the professional white tactile system and target breakpoints", async () => {
  const css = await source("../app/globals.css");
  const storeCss = await source("../app/store/store.css");

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
  assert.match(css, /\.cat-figure > img,[\s\S]*image-rendering: pixelated/);
  assert.match(css, /\.hero-cat-layer \{[\s\S]*image-rendering: pixelated/);
  assert.match(css, /Final type rhythm/);
  assert.match(css, /\.hero h1 \{[\s\S]*line-height: 0\.95/);
  assert.match(css, /\.section-heading \{[\s\S]*gap: clamp\(32px, 4vw, 52px\)/);
  assert.match(storeCss, /Store typography follows the same measured rhythm/);
  // Copy on the left, cat on the right, both on the homepage's hero gradient.
  assert.match(storeCss, /\.store-video-hero \{[\s\S]*var\(--hero-base-1\) 0%, var\(--hero-soft\) 48%/);
  assert.match(storeCss, /\.store-video-hero-copy \{[\s\S]*justify-items: start/);
  // Glass is now part of the design language, so backdrop-filter and the soft
  // radial auras behind it are expected. Repeating gradients stay out - they
  // were the pattern-y look the tactile system was defined against.
  assert.doesNotMatch(css, /repeating-linear-gradient/i);
});

test("shows the three real costumes on the store with no order flow", async () => {
  const response = await render("/store");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>MewMuze Store — The Wardrobe<\/title>/);
  // The hero is the film, a line of copy and one way in.
  assert.match(html, /Welcome to the cat shop\./);
  assert.match(html, /store-video-hero-cta[^>]*href="#catalog"/);

  // The wardrobe is what the app actually ships, not a list of ideas.
  for (const costume of ["Corporate Cat", "Cyberpunk Cat", "Bat Cat"]) {
    assert.match(html, new RegExp(costume));
  }
  assert.equal((html.match(/class="wardrobe-card /g) ?? []).length, 3);
  assert.match(html, /Costumes come with MewMuze Pro/);
  // The ten placeholder concepts are gone. ("Coming Soon" survives only as the
  // nav pill next to Store, which is still honest: nothing is sold here.)
  assert.doesNotMatch(html, /concept-card|sewing table|still being stitched/i);

  // Each card hands over the real signed package. Free, so still no order flow.
  for (const file of [
    "mewmuze.corporate-cat.v1.mewcostume",
    "mewmuze.cyberpunk-cat.v1.mewcostume",
    "mewmuze.bat-cat.v1.mewcostume",
  ]) {
    assert.match(html, new RegExp(file.replace(/\./g, "\.")), file);
  }
  assert.equal((html.match(/wardrobe-card-get/g) ?? []).length, 3);
  assert.doesNotMatch(
    html,
    /\$\d+\.\d{2}|Dummy total|USD|Mock|Add to|Buy now/i,
  );
  assert.doesNotMatch(html, /Iron Man|Spider-Man|Captain America|Avengers|Naruto|Itachi/i);
});

test("keeps the costume films and their posters shipping with the store", async () => {
  for (const id of ["corporate", "cyberpunk", "batcat"]) {
    const film = new URL(`../public/videos/costume-${id}.mp4`, import.meta.url);
    assert.ok((await stat(film)).size > 50_000, `costume-${id}.mp4`);
  }
  await assert.rejects(access(new URL("../public/store", import.meta.url)));
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
  assert.match(storeLayout, /MewMuze Store — The Wardrobe/);
});

test("puts the navigation bar on the landing view, above the hero", async () => {
  const response = await render();
  const html = await response.text();
  const navAt = html.indexOf('class="site-navigation"');
  const heroAt = html.search(/class="hero[ "]/);
  assert.ok(navAt > -1, "site navigation should render");
  assert.ok(heroAt > -1, "hero should render");
  assert.ok(navAt < heroAt, "navigation must come before the hero so it shows on the landing screen");

  const page = await source("../app/page.tsx");
  // The old build hid it behind the reveal observer, which is why it was missing.
  assert.doesNotMatch(page, /className="site-navigation" data-reveal/);

  const css = await source("../app/globals.css");
  assert.match(css, /\.site-navigation\s*\{[^}]*position:\s*sticky/s);
});

test("recreates the app's own notification popups on the connector features", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /Hey! There is a new mail/);
  assert.match(html, /GMAIL/);
  assert.match(html, /Design standup/);
  assert.match(html, /Stand up and stretch/);
  assert.match(html, /class="app-notice/);

  const css = await source("../app/globals.css");
  assert.match(css, /@keyframes notice-pop/);

  const features = await source("../data/features.ts");
  for (const id of ["gmail", "calendar", "reminders", "focus", "agent"]) {
    assert.match(features, new RegExp(`${id}:\\s*\\{`), `${id} should have a notice`);
  }
});

test("explains in plain English what every feature does for the user", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /HOW IT HELPS/);
  // one payoff block per feature in the detailed directory
  assert.equal((html.match(/class="directory-helps"/g) ?? []).length, 31);
  const features = await source("../data/features.ts");
  // every feature id in the data must have payoff pointers written for it
  const ids = [...features.matchAll(/^    id: "([a-z-]+)",$/gm)].map((m) => m[1]);
  assert.equal(ids.length, 31);
  const helpsBlock = features.slice(features.indexOf("const helps"));
  for (const id of ids) {
    assert.match(
      helpsBlock,
      new RegExp(`\\n  (?:"${id}"|${id}):`),
      `${id} needs a payoff line`,
    );
  }
});

test("presents Calculator, Unit Converter and Time Zone Converter as Free and Pro", async () => {
  const response = await render();
  const html = await response.text();
  const features = await source("../data/features.ts");
  const css = await source("../app/globals.css");

  for (const title of ["Calculator", "Unit Converter", "Time Zone Converter"]) {
    assert.match(html, new RegExp(title));
  }
  assert.equal((features.match(/availability: \{ free: true, pro: true \}/g) ?? []).length, 3);
  assert.equal((html.match(/Available in the Free and Pro editions/g) ?? []).length, 3);
  assert.match(html, />FREE <i[^>]*>✓<\/i><\/span>/);
  assert.match(html, />PRO <i[^>]*>✓<\/i><\/span>/);
  assert.match(css, /\.quick-tool-film\s*\{/);
  assert.match(css, /@keyframes calculator-key/);
  assert.match(css, /@keyframes converter-card-swap/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("never advertises a free trial", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /free trial|trial period/i);
});

test("sends Free to the Microsoft Store without changing the Pro checkout path", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");
  const commerce = await source("../lib/commerce.ts");

  // Two: the hero and the closing beat at the end of the story. Both point to
  // the same Store listing, and neither sits next to a price.
  assert.equal((html.match(/Download Free/g) ?? []).length, 2);
  assert.equal((html.match(/class="free-release-note"/g) ?? []).length, 0);
  assert.doesNotMatch(html, /Free download available after 15 August 2026\./);
  assert.match(
    html,
    /apps\.microsoft\.com\/detail\/9MWTS6WZD1N1/,
  );
  assert.match(commerce, /NEXT_PUBLIC_MEWMUZE_FREE_DOWNLOAD_URL/);
  assert.match(commerce, /freeDownloadUrl/);
  assert.match(html, /hero-glass-free[^>]*[\s\S]*?href=/);
  assert.match(html, /class="hero-primary-actions"/);
  assert.match(html, /class="hero-secondary-actions"/);
  assert.match(html, />Get MewMuze Pro · \$7\.99</);
  assert.doesNotMatch(html, />Download Free[^<]*\$7\.99/);
  assert.match(page, /<DownloadButton[^>]*href=\{commerce\.freeDownloadUrl\}[^>]*edition="free"/);
});

test("keeps the optional supporter checkout behind its own configured live Dodo link", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /\$7\.99/);
  assert.doesNotMatch(html, /\$8\.99/);
  assert.match(html, /Roughly two burgers\. Hers lasts longer\./);
  assert.match(html, /Every future update and costume, free/);
  assert.match(html, /Updates are not a new tier/);

  const page = await source("../app/page.tsx");
  const commerce = await source("../lib/commerce.ts");
  assert.match(page, /commerce\.supporterConfigured/);
  assert.match(page, /Throw in \$1 for the developer/);
  assert.match(page, /priceLabelFor\(rupees, supportSelected\)/);
  assert.match(commerce, /supportDeveloper \? "\$8\.99" : "\$7\.99"/);
  assert.match(commerce, /NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL/);
  assert.match(commerce, /supporterConfigured: isLiveCheckout/);

  const css = await source("../app/globals.css");
  assert.match(css, /\.tip-toggle:has\(input:checked\)/);
});

test("gives phones their own layout instead of a squeezed desktop", async () => {
  const css = await source("../app/globals.css");
  // hero stacks with the cat first on small screens
  assert.match(css, /\.hero-cat-peek\s*\{[^}]*order:\s*-1/s);
  assert.match(css, /\.hero-actions \.skeuo-button\s*\{[^}]*width:\s*100%/s);
  // notices sit inline on phones so they never cover the cat
  assert.match(css, /\.notice-float\s*\{[^}]*position:\s*static/s);
  assert.match(css, /@media \(max-width: 430px\)/);
});

test("fits the whole locked hero on a phone screen", async () => {
  const css = await source("../app/globals.css");
  // The hero is height-locked and scrolling stays locked until Explore Now, so
  // the cat must reserve real space and the copy must drop its desktop margin -
  // otherwise the closing line sits below the fold and cannot be reached.
  assert.match(css, /\.hero-cat-peek\s*\{[^}]*height:\s*min\(250px, 29vh\)/s);
  assert.match(css, /\.hero-cat-motion\s*\{[^}]*height:\s*min\(250px, 29vh\)/s);
  assert.match(css, /\.hero-copy\s*\{[^}]*margin-top:\s*0/s);
  // short phones shrink the cat further so the call to action stays visible
  assert.match(css, /@media \(max-width: 760px\) and \(max-height: 700px\)/);
  // touch targets clear the 44px minimum
  assert.match(css, /\.choice-block > div > button\s*\{[^}]*min-height:\s*46px/s);
});

test("uses a soft kawaii canvas with the hero's left-hand bar removed", async () => {
  const css = await source("../app/globals.css");
  // the white canvas was repainted blush-cream by the kawaii theme
  assert.match(css, /html\s*\{\s*background:\s*#f7fbff/);
  assert.match(css, /\.hero-edge\s*\{\s*display:\s*none/);
  // the flat tactile system stays: depth comes from bevels, never gradients
  // Glass is now part of the design language, so backdrop-filter and the soft
  // radial auras behind it are expected. Repeating gradients stay out - they
  // were the pattern-y look the tactile system was defined against.
  assert.doesNotMatch(css, /repeating-linear-gradient/i);
});

test("styles notifications like the app's own bubble", async () => {
  const css = await source("../app/globals.css");
  // white bubble, thin dark outline, mono type and a tail pointing at the cat
  assert.match(css, /\.app-notice\s*\{[^}]*border:\s*1\.5px solid #2b2f33/s);
  assert.match(css, /\.app-notice\s*\{[^}]*background:\s*#ffffff/s);
  assert.match(css, /\.app-notice::after\s*\{[^}]*transform:\s*rotate\(45deg\)/s);
  assert.match(css, /\.app-notice strong\s*\{[^}]*var\(--mono\)/s);
});

test("keeps every cat element untouched while adding only idle motion", async () => {
  const css = await source("../app/globals.css");
  const page = await source("../app/page.tsx");
  // liveliness is animation only - no geometry, colour or layer changes.
  // Breathing and drift are one keyframe: two animations both driving transform
  // would fight, and an animation on .hero-cat-motion would override the
  // transform that frames the cat and drop it half its height down the page.
  assert.match(css, /@keyframes cat-alive/);
  assert.match(css, /\.hero-cat-art\s*\{[^}]*animation:\s*cat-alive/s);
  assert.doesNotMatch(css, /\.hero-cat-motion\s*\{[^}]*animation:\s*cat-drift/s);
  // the original eye/pupil shapes and the full emotion set are still in place
  assert.match(css, /\.hero-eye-track\s*\{[\s\S]*?border-radius:\s*48%/);
  assert.match(css, /\.hero-pupil\s*\{[\s\S]*?border-radius:\s*47%/);
  assert.match(await source("../components/SiteNav.tsx"), /className="brand-link"/);
});

test("centres the closing panel's cat instead of pinning it to a corner", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.cta-cat\s*\{[^}]*justify-items:\s*center/s);
  assert.match(css, /\.cta-cat > span\s*\{[^}]*position:\s*static/s);
  assert.match(css, /\.cta-cat \.cat-figure\s*\{[^}]*width:\s*clamp\(190px, 17vw, 240px\)/s);
});

test("gives the phone layout a real gutter and phone-sized controls", async () => {
  const css = await source("../app/globals.css");
  // the hero had no horizontal padding at all, so everything ran edge to edge
  assert.match(css, /\.hero\s*\{[^}]*padding-left:\s*var\(--gutter\)/s);
  assert.match(css, /\.section-shell\s*\{[^}]*width:\s*calc\(100% - \(var\(--gutter\) \* 2\)\)/s);
  assert.match(css, /\.nav-dock\s*\{[^}]*width:\s*calc\(100% - \(var\(--gutter\) \* 2\)\)/s);
  // the cat stays optically centred on the full width, not the padded box
  assert.match(css, /\.hero-cat-peek\s*\{[^}]*margin-inline:\s*calc\(var\(--gutter\) \* -1\)/s);
  // controls are thumb-sized rather than full-bleed slabs
  assert.match(css, /\.hero-actions \.skeuo-button\s*\{[^}]*min-height:\s*48px/s);
  assert.match(css, /\.hero-actions \.skeuo-button-quiet\s*\{[^}]*width:\s*auto/s);
});

test("frames the hero cat to head and shoulders at a larger size", async () => {
  const css = await source("../app/globals.css");
  // anchored to the bottom and pushed down by a share of its own height, so
  // the head clears the crop and the shoulders meet the bottom edge
  assert.match(css, /\.hero-cat-motion\s*\{[^}]*bottom:\s*0/s);
  assert.match(css, /\.hero-cat-motion\s*\{[^}]*transform:\s*translateY\(27%\)/s);
  // phones re-assert their own smaller framing after the desktop rule
  assert.match(css, /\.hero-cat-motion\s*\{[^}]*width:\s*min\(250px, 29vh\)/s);
});

test("stacks the feature panel on phones so nothing covers the cat", async () => {
  const css = await source("../app/globals.css");
  // the label and caption were absolutely positioned over the cat at 6.5px
  assert.match(css, /\.media-label,\s*\.media-caption\s*\{[^}]*position:\s*static/s);
  assert.match(css, /\.media-label\s*\{[^}]*font-size:\s*9px/s);
  assert.match(css, /\.theatre-media\s*\{[^}]*grid-template-rows:\s*auto 1fr auto/s);
});

test("puts a buy call to action on the landing page", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(html, /Get MewMuze/);
  assert.match(html, /class="glass-surface glass-surface--action hero-glass-pro"/);
  // it unlocks the locked hero and takes you to pricing
  assert.match(page, /unlockAndScroll\("#pricing"\)/);
  // the buy action leads, Explore Now steps back to secondary
  assert.match(page, /className="hero-glass-explore"/);
  assert.match(css, /@keyframes buy-sheen/);
});

test("layers glassmorphism over the tactile system without breaking it", async () => {
  const css = await source("../app/globals.css");
  // floating panes get real glass
  assert.match(css, /backdrop-filter: saturate\(1\.6\) blur\(22px\)/);
  assert.match(css, /--glass-blur: saturate\(1\.5\) blur\(18px\)/);
  // controls you press stay solid and bevelled
  assert.match(css, /\.skeuo-button,[\s\S]*?backdrop-filter: none/);
  // glass needs something behind it on a white page
  assert.match(css, /\.hero::before/);
  // and the auras must not widen the page
  assert.match(css, /overflow-x: clip/);
  // a fallback for browsers without backdrop-filter
  assert.match(css, /@supports not \(\(backdrop-filter/);
});

test("uses a bundled Montserrat glass theme without changing the pixel cat", async () => {
  const layout = await source("../app/layout.tsx");
  const css = await source("../app/globals.css");
  const glass = await source("../app/liquid.css");

  // Only Montserrat ships with the redesign; legacy tokens remain in the
  // archived CSS but never control rendered website type.
  assert.match(layout, /@fontsource\/montserrat\/800\.css/);
  assert.doesNotMatch(layout, /@fontsource-variable\/baloo-2|@fontsource-variable\/quicksand/);
  assert.doesNotMatch(layout, /next\/font/);
  assert.match(glass, /body \*,body \*::before,body \*::after\{font-family:Montserrat/);
  assert.match(glass, /\.nav-dock\{background:rgba\(255,255,255,\.72\)/);

  assert.match(glass, /--glass-shadow:0 20px 70px rgba\(45,72,113,\.11\)/);
  assert.match(glass, /body \.feature-theatre \.theatre-console\{border-width:1px!important/);
  assert.match(glass, /body \.store-coming-soon-overlay\{border:1px solid rgba\(255,255,255,\.96\)!important/);
  assert.match(glass, /\.liquid-button\[disabled\]/);

  // cute motion
  for (const kf of ["kw-bob", "kw-wiggle", "kw-float", "kw-cat-in", "kw-tick", "kw-heartbeat"]) {
    assert.match(css, new RegExp(`@keyframes ${kf}`), `${kf} keyframe missing`);
  }

  // and the cat itself is untouched
  assert.match(css, /\.hero-eye-track\s*\{[\s\S]*?border-radius:\s*48%/);
  assert.match(css, /\.hero-pupil\s*\{[\s\S]*?border-radius:\s*47%/);
});

test("aligns the mobile nav and keeps kawaii text readable", async () => {
  const css = await source("../app/globals.css");

  // .brand-link was a block, so its inline-flex child sat flush to the top and
  // the brand centred 6px above the Menu control opposite it
  assert.match(css, /\.brand-link\s*\{[^}]*display: flex;[^}]*align-items: center/s);
  assert.match(css, /\.nav-dock\s*\{[^}]*padding: 8px 12px/s);

  // pastel text had drifted too pale: 89 nodes were under the WCAG minimum
  assert.match(css, /--text-secondary: #586270/);
  // the privacy block kept a dark plum fill while headings turned dark plum,
  // leaving the headline at 1.24:1
  assert.match(css, /\.privacy\s*\{\s*background: #eef5fd/);
  assert.match(css, /\.pricing-price strong\s*\{\s*color: #1f6fae/);
});

test("retints the whole pink theme to light blue, root cause and all", async () => {
  const css = await source("../app/globals.css");
  const store = await source("../app/store/store.css");

  // The background wash: first tried as a blue/yellow crossfade, but that
  // wasn't the actual pink users kept seeing (see below), so it simplified
  // back to a single static light-blue tint once the real source was fixed.
  assert.match(css, /body::after\s*\{[^}]*background:[\s\S]*?rgba\(196, 229, 255,/);
  assert.doesNotMatch(css, /@keyframes kw-aura-blue/);
  assert.doesNotMatch(css, /@keyframes kw-aura-yellow/);
  assert.doesNotMatch(css, /rgba\(255, 214, 232,/); // the old pink wash

  // The actual dominant pink was the shared border/shadow tokens used by
  // every card, button and the nav pill - not the page-wide wash. Fixed at
  // the token level so every consumer picks it up in one place.
  assert.match(css, /--border: #cfe4f7/);
  assert.match(css, /--border-dark: #8ec3ea/);
  assert.match(css, /--shadow-raised: 0 3px 0 #cfe4f7, 0 12px 26px rgba\(120, 165, 214/);
  assert.match(css, /--glass-line: rgba\(140, 190, 230/);
  assert.match(css, /--glass-shadow: 0 12px 30px rgba\(120, 165, 214/);
  assert.doesNotMatch(css, /--border: #ffd3e4/);
  assert.doesNotMatch(css, /--border-dark: #f5b3ce/);

  // Once asked to retint the whole theme (not just the ambient wash), the
  // primary CTA / chip-active / price / eyebrow / quiet-link accent colours
  // - previously left alone as "deliberate pink accents" - moved too.
  for (const oldHex of ["#ff9dc0", "#ffc2dc", "#f58bb2", "#d97fa8", "#e8709c"]) {
    assert.doesNotMatch(css, new RegExp(oldHex.replace("#", "#")), `${oldHex} should be fully retired`);
  }
  assert.match(css, /#4fb2e8/); // vivid accent replacing #ff9dc0
  assert.match(css, /#bfe0fb/); // fill replacing #ffc2dc

  // The store sub-page has its own stylesheet and needed the same pass.
  assert.doesNotMatch(store, /#d3a6b5|#fff0f5|#ca9cac|#ffdfec/);
  assert.match(store, /#8ec3ea|#eaf4ff/);
});

test("keeps the mobile cat fully visible instead of clipped by its own frame", async () => {
  const css = await source("../app/globals.css");
  // .hero-cat-peek used to clip with overflow:hidden while its own children
  // (.hero-cat-motion, then .hero-cat-head-unit overshooting further for the
  // ear tufts and flower crown) resolved taller than it on a real 393x852
  // viewport, cropping the top and bottom of the cat
  assert.match(css, /iPhone 15/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.hero-cat-peek \{\s*overflow: visible;\s*height: auto;/);
  // dvh instead of vh so the sizing tracks Safari's real visible viewport
  // rather than the address-bar-hidden "large" viewport
  assert.match(css, /\.hero-cat-motion\s*\{[^}]*width:\s*min\(220px, 25dvh\)/s);
});

test("reserves a fixed title height so day-timeline cards stay aligned", async () => {
  const css = await source("../app/globals.css");
  // a one-line title let the paragraph beneath it start a full line (25px)
  // higher than a two-line title's paragraph in the same row; the 961px
  // width (just above the breakpoint that stacks this into one column) wraps
  // the longest title to 4 lines, so the reservation covers that worst case
  assert.match(css, /\.day-timeline h3\s*\{[^}]*display: flex;[^}]*min-height: 105px;[^}]*align-items: center;[^}]*justify-content: center;/s);
});

test("gives heading-like <strong> labels the same display font as real headings", async () => {
  const css = await source("../app/globals.css");
  // the feature carousel's title echo and the nav brand wordmark were both
  // marked up as <strong>, so the h1-h4 display-font rule never reached them
  // and they fell back to the plain UI font next to matching Baloo 2 text
  assert.match(css, /\.theatre-counter strong,\s*\n\.showcase-ticket strong,\s*\n\.preset-ticket strong,\s*\n\.pricing-brand strong,\s*\n\.site-brand strong\s*\{\s*font-family: var\(--font-kawaii-display\)/);
});

test("makes the nav bar a full pebble/pill shape at every width", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.nav-dock\s*\{\s*border-radius: 999px;\s*\}\s*$/m);
});

test("opens directly on the sole pet hero without a blocking welcome curtain", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");
  assert.match(html, /id="companion" class="hero/);
  assert.doesNotMatch(html, /class="film-hero"/);
  assert.doesNotMatch(html, /class="welcome-splash"/);
  assert.doesNotMatch(page, /mewmuze-splash-open|function WelcomeSplash/);
});

test("uses Dodo checkout instead of collecting a local website account", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");

  assert.match(html, /Secure checkout, tax and licence delivery are handled by Dodo Payments/);
  assert.match(page, /pricing-gate/);
  assert.match(page, /pricing-coming/);
  // Paying is still Dodo's job. The website account gates downloads only, and
  // page.tsx itself never collects a credential.
  assert.doesNotMatch(page, /type="password"|setPassword|localStorage|sessionStorage/);

  // The session is an HttpOnly cookie: no part of the account code may keep
  // identity in browser storage, where script on the page could read it.
  for (const file of [
    "../components/AuthProvider.tsx",
    "../components/AuthDialog.tsx",
    "../components/DownloadButton.tsx",
    "../lib/auth-api.ts",
  ]) {
    // Comments are allowed to mention browser storage; the code may not use it.
    const code = (await source(file)).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "");
    assert.doesNotMatch(code, /localStorage|sessionStorage|document\.cookie/, file);
  }
});

test("keeps em and en dashes out of the copy", async () => {
  const page = await source("../app/page.tsx");
  const features = await source("../data/features.ts");

  for (const [name, src] of [["page.tsx", page], ["features.ts", features]]) {
    assert.doesNotMatch(src, /[–—]/, `${name} still contains a dash`);
  }
});

test("keeps the feature directory and pricing below the realistic introduction", async () => {
  const html = await (await render()).text();
  assert.match(html, /class="realistic-hero-video"/);
  assert.match(html, /Cursor companion/);
  assert.ok(html.indexOf('id="companion"') < html.indexOf('id="directory"'));
  assert.ok(html.indexOf('id="directory"') < html.indexOf('id="pricing"'));
});

test("puts the nav logo in a circle and centres the links", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.brand-medallion\s*\{\s*border-radius: 50%/);
  assert.match(css, /\.brand-medallion img\s*\{\s*border-radius: 50%/);
  // the links were baseline aligned in a taller row, riding high
  assert.match(css, /\.desktop-nav\s*\{[^}]*align-items: center;[^}]*align-self: center/s);
});

test("keeps download, store and support reachable through the navigation", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");

  assert.doesNotMatch(html, /View the price/);
  assert.match(html, /nav-cta nav-cta-signup/);
  assert.match(html, />Download</);
  assert.match(html, />Live demo</);
  assert.doesNotMatch(html, /Store\s*<span class="coming-pill"/);
  assert.match(html, />Support</);
  assert.doesNotMatch(page, /onAuthIntent|authMode|My account/);
});

test("renders purchase success, cancellation and support routes with navigation", async () => {
  const success = await (await render("/checkout/success")).text();
  const cancelled = await (await render("/checkout/cancelled")).text();
  const support = await (await render("/support")).text();
  const successSource = await source("../app/checkout/success/page.tsx");

  assert.match(success, /PURCHASE STATUS/);
  assert.match(successSource, /payment_id/);
  assert.match(successSource, /purchase-status\.php/);
  assert.doesNotMatch(successSource, /params\.get\("license_key"\)/);
  assert.match(successSource, /replaceState/);
  assert.match(successSource, /your key is in your Dodo Payments email/i);
  assert.match(success, /Download MewMuze Pro 0\.1\.10/);
  assert.match(successSource, /href=\{DOWNLOAD_URL\}/);
  assert.doesNotMatch(successSource, /\{succeeded && \(\s*<a[^>]+href=\{DOWNLOAD_URL\}/);
  assert.match(success, /Download the MewMuze app/);
  assert.match(success, /Let Windows know you trust this download/);
  assert.match(success, /Bring your licence key home/);
  assert.match(success, /windows-defender-more-info\.png/);
  assert.match(success, /windows-defender-run-anyway\.png/);
  assert.match(success, /message from <strong>Dodo Payments<\/strong>/);
  assert.match(success, /minimize that window/i);
  assert.match(cancelled, /Nothing was charged/);
  assert.match(support, /support@mewmuze\.com/);
  assert.match(support, /Never send a card number/);
  assert.match(success, /aria-label="Primary navigation"/);
  assert.match(support, /aria-label="Primary navigation"/);
  // The shared header links only to homepage sections that still exist.
  assert.match(success, />Pricing</);
  assert.match(support, />Pricing</);
  for (const retired of ["#story", "#features", "#editions", "#appearance", "#faq", "#privacy"]) {
    assert.doesNotMatch(await source("../components/PublicHeader.tsx"), new RegExp(`"/${retired}"`));
  }
});

test("carries no FAQ structured data now that the FAQ is off the page", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /"@type":"FAQPage"/);
});

test("uses the MewMuze Baloo and Quicksand typography contract on every route", async () => {
  const css = await source("../app/globals.css");
  const success = await (await render("/checkout/success")).text();

  assert.match(
    css,
    /\.commerce-card h1,[\s\S]*?font-family: var\(--font-kawaii-display\), var\(--font-kawaii-ui\), sans-serif;[\s\S]*?font-weight: 720;/,
  );
  assert.match(
    css,
    /button,[\s\S]*?\.skeuo-button\s*\{[\s\S]*?font-family: var\(--font-kawaii-display\), var\(--font-kawaii-ui\), sans-serif;[\s\S]*?font-weight: 700;/,
  );
  assert.match(
    css,
    /\.site-brand,[\s\S]*?\.eyebrow\s*\{[\s\S]*?font-family: var\(--font-kawaii-ui\), var\(--font-montserrat\), system-ui, sans-serif;/,
  );
  assert.match(success, /We are checking your purchase/);
  assert.match(success, /Download MewMuze Pro 0\.1\.10/);
});

test("stops clip-path from cropping the cat's ears on phones", async () => {
  const css = await source("../app/globals.css");
  // clip-path crops strictly to .hero-cat-art's own box and ignores ancestor
  // overflow entirely, which is why relaxing overflow never fixed this. The
  // head unit is deliberately larger than that box for the ears and crown.
  assert.match(css, /\.hero-cat-art \{[\s\S]*clip-path: inset\(0\)/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.hero-cat-art \{\s*clip-path: none;/);
});

test("opens the realistic hero without the legacy splash", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /class="splash-disc"/);
  assert.match(html, /realistic-hero-video/);
  assert.match(html, /mewmuze-intro\.mp4/);
});

test("keeps the tablet band from dropping the cat on top of the headline", async () => {
  const css = await source("../app/globals.css");
  // .hero-copy goes full width at 1180px and below, but the hero only stacks at
  // 760px and below, so 761px to 1180px had the cat sitting over the copy
  assert.match(css, /@media \(min-width: 761px\) and \(max-width: 1180px\)/);
  // range scoped, so it can never override the phone rules earlier in the file
  assert.match(css, /@media \(min-width: 961px\) \{\s*\.desktop-nav \{\s*display: flex/);
});

test("keeps the phone nav bar on a single compact row", async () => {
  const css = await source("../app/globals.css");
  const page = await source("../components/SiteNav.tsx");
  // hiding only .nav-cta left .nav-auth as a third grid item, which wrapped to a
  // second row and doubled the dock height
  assert.match(css, /\.nav-auth \{\s*display: none;/);
  assert.match(css, /\.nav-dock \{\s*min-height: 54px/);
  // Download and support remain in the Menu drawer on phones.
  assert.match(page, /<a href=\{`\$\{base\}#pricing`\}>Download<\/a>/);
  assert.match(page, /<a href=\{sitePath\("\/support\/"\)\}>Support<\/a>/);
});

test("centres the nav logo without nudging it", async () => {
  const css = await source("../app/globals.css");
  // The old face art sat off-centre in its own canvas and the medallion pulled
  // it back with hand-measured offsets. The logo is centred now, so those
  // offsets would push it back out: the image simply fills the medallion.
  assert.match(css, /\.brand-medallion img\s*\{[^}]*object-fit: contain/s);
  assert.doesNotMatch(css, /\.brand-medallion img\s*\{[^}]*left: -6\.06%/s);
});

test("keeps the neutral pupil the same round shape as the painted ones", async () => {
  const css = await source("../app/globals.css");
  // Only the neutral head has pupil-less eyes, so these CSS pupils stand in for
  // the ones happy and sad have painted in. A stepped clip-path was tried to
  // "pixelate" them and read as a boxy rounded rectangle with square glints,
  // which matched the painted pupils worse than the round original did.
  assert.match(css, /\.hero-pupil \{[\s\S]*?border-radius: 47%/);
  assert.doesNotMatch(css, /\.hero-pupil \{[^}]*clip-path/s);
  assert.match(css, /\.hero-pupil::before,\s*\n\.hero-pupil::after \{[\s\S]*?border-radius: 48%/);
});

test("ships a production robots.txt that advertises the canonical sitemap", async () => {
  const robots = await source("../public/robots.txt");

  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/mewmuze\.com\/sitemap\.xml$/m);

  // Transactional pages, commerce endpoints, the signed updater manifest and
  // installer binaries must stay out of search.
  for (const path of ["/checkout/", "/api/", "/updates/", "/downloads/"]) {
    assert.match(robots, new RegExp(`^Disallow: ${path.replace(/\//g, "\/")}$`, "m"));
  }
});

test("ships a sitemap of canonical production URLs only", async () => {
  const sitemap = await source("../public/sitemap.xml");

  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  assert.deepEqual(locations, [
    "https://mewmuze.com/",
    "https://mewmuze.com/support/",
    "https://mewmuze.com/store/",
  ]);
  assert.equal(new Set(locations).size, locations.length, "sitemap has duplicate URLs");

  // /store/ is the only store URL now; there are no child routes to advertise.
  assert.doesNotMatch(sitemap, /\/store\/[a-z-]+\//);

  for (const forbidden of [
    "/checkout/",
    "/api/",
    "/updates/",
    "/downloads/",
    "localhost",
    "github.io",
    ".exe",
  ]) {
    assert.ok(!sitemap.includes(forbidden), `sitemap must not contain ${forbidden}`);
  }
});

test("describes the purchasable app with structured data at the USD list price", async () => {
  const response = await render();
  const html = await response.text();

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  assert.ok(blocks.length >= 2, "expected site-wide and app structured data");

  const app = blocks.find((block) => block["@type"] === "SoftwareApplication");
  assert.ok(app, "homepage is missing SoftwareApplication structured data");
  assert.equal(app.name, "MewMuze");
  assert.equal(app.operatingSystem, "Windows 10, Windows 11");
  assert.equal(app.offers.price, "7.99");
  assert.equal(app.offers.priceCurrency, "USD");

  // No real reviews exist, so rating markup would be fabricated.
  assert.ok(!("aggregateRating" in app), "must not claim ratings");
  assert.ok(!("review" in app), "must not claim reviews");

  const graph = blocks.find((block) => Array.isArray(block["@graph"]));
  assert.ok(graph, "site-wide structured data is missing");
  const types = graph["@graph"].map((node) => node["@type"]);
  assert.ok(types.includes("Organization"));
  assert.ok(types.includes("WebSite"));
});

test("keeps pricing structured data off the store page", async () => {
  const response = await render("/store");
  const html = await response.text();

  assert.doesNotMatch(html, /SoftwareApplication|priceCurrency|"price"/);
});

test("gives the support page its own canonical instead of inheriting the homepage's", async () => {
  const response = await render("/support");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>MewMuze Support — Purchase and Licence Help<\/title>/);
  assert.match(html, /<link rel="canonical" href="[^"]*\/support\/"\/?>/);
  assert.doesNotMatch(html, /<link rel="canonical" href="[^"]*\.com\/"\/?>/);
});

test("keeps the store index itself indexable", async () => {
  const response = await render("/store");
  const html = await response.text();

  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/);
  assert.match(html, /<link rel="canonical" href="[^"]*\/store\/"/);
});

test("publishes only to mewmuze.com and no longer to a public github.io copy", async () => {
  const workflow = await source("../.github/workflows/deploy.yml");

  // The duplicate public deployment is gone.
  assert.doesNotMatch(workflow, /actions\/deploy-pages/);
  assert.doesNotMatch(workflow, /actions\/upload-pages-artifact/);
  assert.doesNotMatch(workflow, /github\.io/);

  // ...but source control, the workflow and the Hostinger deployment remain.
  assert.match(workflow, /on:\s*\n\s*push:/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(workflow, /HOSTINGER_BUILD: "true"/);
  assert.match(workflow, /FTP-Deploy-Action/);
  assert.match(workflow, /api\/health\.php/);
  // Production deploys stay gated on the test suite.
  assert.match(workflow, /run: npm test/);

  // No code should fall back to the retired mirror domain.
  for (const file of [
    "../app/layout.tsx",
    "../app/store/layout.tsx",
    "../app/support/page.tsx",
  ]) {
    assert.doesNotMatch(await source(file), /github\.io/, `${file} still falls back to github.io`);
  }
});

// --- Website accounts -------------------------------------------------------
// Downloads sit behind a sign in. These pin the properties that matter if the
// endpoints are ever edited: passwords are hashed, the session cookie is not
// readable or replayable, and the billing tables are never written to.

test("gates both installers behind an account", async () => {
  const page = await source("../app/page.tsx");
  const success = await source("../app/checkout/success/page.tsx");
  const button = await source("../components/DownloadButton.tsx");

  assert.match(page, /<DownloadButton[^>]*edition="free"/);
  assert.match(success, /<DownloadButton[\s\S]*?edition="pro"/);
  // The real release URLs are still what gets opened.
  assert.match(page, /href=\{commerce\.freeDownloadUrl\}/);
  assert.match(success, /href=\{DOWNLOAD_URL\}/);
  // Signed out clicks open the dialog instead of the file, always: an
  // unreachable account service must not quietly hand the installer over.
  assert.match(button, /requestSignIn\(\{ edition, href \}\)/);
  assert.match(button, /const gated = !signedIn;/);

  // The account control is always in the navigation, signed in or not.
  const nav = await source("../components/SiteNav.tsx");
  assert.match(nav, /Log in \/ Sign up/);
  assert.match(nav, /<AccountControl \/>/);
});

test("stores account credentials safely and never touches the billing tables", async () => {
  const lib = await source("../hostinger-api/auth-lib.php");
  const signup = await source("../hostinger-api/auth-signup.php");
  const login = await source("../hostinger-api/auth-login.php");
  const schema = await source("../hostinger-api/schema.sql");
  const htaccess = await source("../hostinger-api/.htaccess");

  // Hashing, not storage.
  assert.match(signup, /password_hash\(\$password, PASSWORD_DEFAULT\)/);
  assert.match(login, /password_verify\(/);
  assert.doesNotMatch(signup + login + lib, /INSERT INTO users[^)]*password[^)]*VALUES[^)]*\$password\b/);

  // The cookie is random, HttpOnly and only ever stored as a hash.
  assert.match(lib, /bin2hex\(random_bytes\(32\)\)/);
  assert.match(lib, /'httponly' => true/);
  assert.match(lib, /'samesite' => 'Lax'/);
  assert.match(lib, /hash\('sha256', \$token\)/);

  // Brute force and cross site protections.
  assert.match(lib, /function auth_throttle/);
  assert.match(lib, /HTTP_ORIGIN/);
  assert.match(login, /Email or password is incorrect\./);

  // Billing data is read only from the account code: no writes to payments or
  // licences anywhere in the auth surface.
  for (const [name, src] of [["auth-lib", lib], ["signup", signup], ["login", login]]) {
    assert.doesNotMatch(src, /\b(INSERT INTO|UPDATE|DELETE FROM)\s+(payments|licences)\b/i, name);
  }
  assert.match(lib, /FROM payments p/);

  // The shared library must not be fetchable, like bootstrap.php.
  assert.match(htaccess, /auth-lib\\\.php/);

  // Tables exist for the deploy to run.
  for (const table of ["users", "user_sessions", "download_events", "auth_throttle"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`), table);
  }
  await access(new URL("../hostinger-api/migrations/003_accounts.sql", import.meta.url));
});

test("keeps the Pro download tied to a real paid purchase", async () => {
  const lib = await source("../hostinger-api/auth-lib.php");
  const record = await source("../hostinger-api/download-record.php");

  assert.match(lib, /function auth_has_pro/);
  // Same definition of "paid" as purchase-status.php, so the site cannot
  // disagree with itself about who owns Pro.
  assert.match(lib, /payment\.succeeded/);
  assert.match(lib, /refund\./);
  assert.match(lib, /entitlement_grant\.revoked/);
  assert.match(record, /edition === 'pro' && !auth_has_pro/);
  assert.match(record, /Sign in to download\./);

  // The button refuses too, so the link is never handed over in the first place.
  const button = await source("../components/DownloadButton.tsx");
  assert.match(button, /edition === "pro" && signedIn && account\?\.entitlements\.pro === false/);
});

test("tells the day as one story, in order", async () => {
  const html = await (await render()).text();

  // The arc: the hour nobody is around, she picks up, she feels it back, she
  // looks after you, she learns you, a whole day of that, the work, the looks, then the receipts.
  const order = [
    'id="companion"',
    'id="late-night"',
    'id="paper-preview"',
    'id="feelings"',
    'id="care"',
    'id="adapts"',
    'id="day"',
    'id="quick-tools"',
    'id="tasks"',
    'id="costumes"',
    'id="private"',
    'id="everything"',
    'id="directory"',
    'id="pricing"',
    'id="close"',
  ];
  let previous = -1;
  for (const marker of order) {
    const at = html.indexOf(marker);
    assert.ok(at > -1, `${marker} should render`);
    assert.ok(at > previous, `${marker} is out of story order`);
    previous = at;
  }

  // The beats that carry the emotional claim.
  assert.match(html, /She is still up\./);
  assert.match(html, /She is not an app you open\./);
  assert.match(html, /She runs on your computer\./);
  assert.match(html, /She is not going to fix your life\./);

  // Every promise the story makes about privacy must stay checkable.
  assert.match(html, /Nothing is uploaded/);
  assert.match(html, /She never reads your screen/);
  assert.match(html, /You are not training anything/);
});

test("shows Care as a labelled Paper preview that makes no health claims", async () => {
  const html = await (await render()).text();
  const start = html.indexOf('id="care"');
  const care = html.slice(start, html.indexOf("</section>", start));

  assert.match(care, /INSIDE THE PAPER LAB · CARE/);
  assert.match(care, /videos\/mewmuze-care\.mp4/);
  assert.match(care, /videos\/mewmuze-care-poster\.webp/);
  // The app's own boundaries, said on the page too.
  assert.match(care, /comes with MewMuze Pro/);
  assert.match(care, /nothing in it scores, diagnoses or judges/);
  assert.match(care, /every number stays on your\s+computer/);
  assert.match(care, /No streaks\./);
  assert.doesNotMatch(care, /therapy|treat|cure|clinical/i);
});

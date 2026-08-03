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

test("renders the exact full-screen MewMuze opening story", async () => {
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
  // scrolling is free from first paint - see the dedicated unlock test
  assert.match(html, /experience-unlocked/);
  assert.match(html, /mewmuze-hero-front-body-alive\.webp/);
  assert.match(html, /mewmuze-hero-front-head-app\.png/);
  assert.match(html, /mewmuze-face-logo-hd\.png/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /Store[\s\S]*Coming Soon/);
  assert.doesNotMatch(await source("../app/page.tsx"), /\bPawPico\b/);
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
  assert.match(page, /className="hero-explore"/);

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
  assert.doesNotMatch(workflow, /NEXT_PUBLIC_DODO_API_KEY/);
});

test("uses a large, seated app-density pixel cat with independent head and eye layers", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /HERO_CAT_BODY_ASSET = "\/cat\/mewmuze-hero-front-body-app\.png"/);
  assert.match(page, /HERO_CAT_BODY_ALIVE_ASSET = "\/cat\/mewmuze-hero-front-body-alive\.webp"/);
  assert.match(page, /HERO_CAT_HEAD_ASSET = "\/cat\/mewmuze-hero-front-head-app\.png"/);
  assert.match(page, /HERO_CAT_BLINK_ASSET = "\/cat\/mewmuze-hero-front-head-blink-app\.png"/);
  assert.match(page, /HERO_CAT_EARS_ASSET = "\/cat\/mewmuze-hero-front-head-ears-app\.png"/);
  assert.match(page, /width=\{128\}/);
  assert.match(page, /height=\{128\}/);
  assert.doesNotMatch(page, /mewmuze-flower-cat\.png/);
  assert.match(css, /\.hero-cat-peek \{[\s\S]*width: min\(59vw, 1000px\)/);
  assert.match(css, /\.hero-cat-motion \{[\s\S]*width: clamp\(760px, 57vw, 980px\)/);
  assert.match(css, /\.hero-cat-art \{[\s\S]*clip-path: inset\(0\)/);
  assert.match(css, /\.hero-cat-head-unit \{[\s\S]*will-change: transform/);
  assert.match(css, /\.hero-cat-layer \{[\s\S]*image-rendering: pixelated/);
  assert.match(css, /\.cat-figure > img,[\s\S]*image-rendering: pixelated/);
});

test("gives the landing cat an authentic moving tail and rotating emotional life", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");
  const renderer = await source("../scripts/render-authentic-web-assets.mjs");

  for (const emotion of ["happy", "sad", "cheerful"]) {
    const media = await readFile(
      new URL(`../public/cat/hero-emotions/${emotion}.webp`, import.meta.url),
    );
    assert.ok(media.length > 1_000, emotion);
    assert.equal(media.toString("ascii", 0, 4), "RIFF");
    assert.equal(media.toString("ascii", 8, 12), "WEBP");
    assert.match(
      page,
      new RegExp(`${emotion}: "/cat/hero-emotions/${emotion}\\.webp"`),
    );
  }

  const tail = await readFile(
    new URL("../public/cat/mewmuze-hero-front-body-alive.webp", import.meta.url),
  );
  assert.ok(tail.length > 1_000);
  assert.equal(tail.toString("ascii", 0, 4), "RIFF");
  assert.match(page, /const \[heroEmotion, setHeroEmotion\]/);
  assert.match(page, /"happy",\s+"cheerful",\s+"sad"/);
  assert.match(page, /setHeroEmotion\("neutral"\)/);
  assert.match(renderer, /renderHeroTailBody/);
  assert.match(renderer, /tailPhase < 40/);
  assert.match(css, /\.hero-cat-art\.emotion-happy \.hero-cat-emotion-happy/);
});

test("no longer follows the cursor, keeping only the cat's own animations", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  // the whole pointer-tracking loop is gone, along with the per-mood rig table
  // that existed only to drive it
  assert.doesNotMatch(page, /requestAnimationFrame/);
  assert.doesNotMatch(page, /pointermove/);
  assert.doesNotMatch(page, /emotionRig|EmotionRig|spritePixelRef/);
  assert.doesNotMatch(page, /heroHeadRef\.current\.style\.transform/);

  // the pupils still exist, sitting centred and looking straight ahead
  assert.match(css, /\.hero-pupil/);
  assert.match(page, /className="hero-pupil"/);

  // and every animation the cat owns itself is untouched
  assert.match(css, /@keyframes hero-authentic-blink/);
  assert.match(css, /@keyframes hero-ear-check/);
  assert.match(css, /@keyframes cat-alive/);
  assert.match(page, /const \[heroEmotion, setHeroEmotion\]/);
});

test("unlocks into the story while leaving the landing cat stationary", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /const unlockAndScroll = \(targetId: "#story" \| "#features" \| "#pricing"\)/);
  assert.match(page, /unlockAndScroll\("#story"\)/);
  assert.match(page, /window\.scrollTo\(\{/);
  assert.match(page, /target\.getBoundingClientRect\(\)\.top \+ window\.scrollY - 80/);
  assert.doesNotMatch(
    page,
    /setJourneyState|transitionScrollRafRef|theatreHeadingRef|storyHeadingRef/,
  );
  assert.match(page, /className="hero-cat-motion"/);
  assert.match(css, /\.hero-cat-motion\.is-travelling,[\s\S]*animation: none !important/);
});

test("ships a one-at-a-time keyboard and touch accessible 20-feature theatre", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const features = await source("../data/features.ts");

  assert.match(html, /THE FEATURE THEATRE/);
  assert.match(html, /aria-roledescription="carousel"/);
  assert.match(html, /Previous feature/);
  assert.match(html, /Next feature/);
  assert.equal((html.match(/feature-media-cat/g) ?? []).length, 1);
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

test("uses transparent authentic feature media and retains the verified source films", async () => {
  const features = await source("../data/features.ts");
  const ids = Array.from(features.matchAll(/id: "([^"]+)"/g), (match) => match[1]);
  const videos = Array.from(features.matchAll(/video: "(\/[^"]+\.mp4)"/g), (match) => match[1]);
  assert.equal(ids.length, 20);
  assert.equal(videos.length, 20);

  for (const id of ids) {
    const media = await readFile(new URL(`../public/cat/features/${id}.webp`, import.meta.url));
    assert.ok(media.length > 1_000, id);
    assert.equal(media.toString("ascii", 0, 4), "RIFF");
    assert.equal(media.toString("ascii", 8, 12), "WEBP");
  }
  for (const path of new Set(videos)) {
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).size > 10_000, path);
  }

  const page = await source("../app/page.tsx");
  assert.match(page, /\/cat\/features\/\$\{feature\.id\}\.webp/);
  assert.match(page, /AUTHENTIC APP-RENDERED MOTION · TRANSPARENT/);
  assert.doesNotMatch(page, /<video/);
});

test("hard-cuts through varied authentic cats and emotions while visible", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");

  assert.match(html, /Nothing is wrong\./);
  assert.match(html, /That is somehow the problem\./);
  assert.match(html, /Then a small pair of green eyes looks up at you\./);
  assert.match(html, /LIVE APPEARANCE \/ AUTHENTIC RENDERER/);
  assert.match(page, /white-grey-flower/);
  assert.match(page, /orange-happy/);
  assert.match(page, /calico-wave/);
  assert.match(page, /tuxedo-placard/);
  assert.match(page, /tabby-groom/);
  assert.match(page, /fluffy-stretch/);
  assert.match(page, /kitten-yawn/);
  assert.match(page, /siamese-celebrate/);
  assert.doesNotMatch(page, /previousIndex|is-previous/);
  assert.match(page, /window\.setInterval\(\(\) => \{[\s\S]*\}, 2200\)/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /if \(reducedMotion \|\| !isVisible\) return/);
  assert.match(page, /appearanceShowcase\.map\(\(\[id, label\], index\)/);
  assert.match(page, /loading="eager"/);
  assert.match(await source("../app/globals.css"), /\.showcase-cat-media \{[\s\S]*display: none/);

  for (const [id] of [
    ["white-grey-flower"],
    ["orange-happy"],
    ["calico-wave"],
    ["tuxedo-placard"],
    ["tabby-groom"],
    ["fluffy-stretch"],
    ["kitten-yawn"],
    ["siamese-celebrate"],
  ]) {
    assert.ok(
      (await stat(new URL(`../public/cat/appearance/${id}.webp`, import.meta.url))).size > 1_000,
      id,
    );
  }
});

test("keeps the complete grouped feature directory and day narrative", async () => {
  const response = await render();
  const html = await response.text();

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
  const page = await source("../app/page.tsx");

  for (const body of ["Classic", "Chonk", "Fluffy", "Siamese", "Kitten"]) {
    assert.match(html, new RegExp(`>${body}<`));
  }
  for (const pattern of ["Solid", "Tuxedo", "Tabby", "Socks", "Spotted", "Calico", "Bicolour"]) {
    assert.match(html, new RegExp(`>${pattern}<`));
  }
  assert.match(html, /White base · green eyes · pink ears/);
  assert.match(html, /Blink · curious look · happy response/);
  assert.match(html, /FLOWER BAND/);
  assert.match(html, /LIVE EMOTION/);
  assert.match(
    page,
    /Showing the authentic \{bodyLabel\} body with the \{patternLabel\} coat/,
  );
  assert.match(page, /\/cat\/studio\/\$\{body\}-\$\{pattern\}\.webp/);
  assert.match(page, /aria-pressed=\{body === value\}/);
  assert.match(page, /aria-pressed=\{pattern === value\}/);
  assert.doesNotMatch(html, /12 accessories/);

  for (const body of ["classic", "chonk", "fluffy", "siamese", "kitten"]) {
    for (const pattern of [
      "solid",
      "tuxedo",
      "tabby",
      "socks",
      "spotted",
      "calico",
      "bicolour",
    ]) {
      const media = await readFile(
        new URL(`../public/cat/studio/${body}-${pattern}.webp`, import.meta.url),
      );
      assert.ok(media.length > 1_000, `${body}-${pattern}`);
      assert.equal(media.toString("ascii", 0, 4), "RIFF");
      assert.equal(media.toString("ascii", 8, 12), "WEBP");
    }
  }
});

test("adds the live Dodo one-time $7.99 purchase section", async () => {
  const response = await render();
  const html = await response.text();
  const page = await source("../app/page.tsx");
  const commerce = await source("../lib/commerce.ts");

  assert.match(html, /ONE-TIME PRICE/);
  assert.match(html, /\$7\.99/);
  assert.match(html, /Pay once\. No subscription, ever\./);
  assert.match(html, /Personal Windows desktop cat/);
  assert.match(html, /Local-first privacy/);
  assert.match(html, /Dodo Payments/);
  assert.match(
    html,
    /checkout\.dodopayments\.com\/buy\/pdt_0NkWDKYYlGSBLf59iNa4q/,
  );
  assert.match(html, /redirect_url=https%3A%2F%2Fmewmuze\.com%2Fcheckout%2Fsuccess%2F/);
  assert.match(commerce, /url\.searchParams\.set\("redirect_url", CHECKOUT_SUCCESS_URL\)/);
  assert.doesNotMatch(html, /Checkout configuration pending/);
  assert.doesNotMatch(html, /pdt_0NkKxv8HzpZgMPTzpIeWT/);
  assert.match(page, /checkoutUrlFor/);
  assert.match(page, /Buy MewMuze securely/);
  assert.match(commerce, /NEXT_PUBLIC_DODO_CHECKOUT_URL/);
  assert.doesNotMatch(html, /Limited-time|refund policy/i);
});

test("shows rupees to Indian visitors and dollars to everyone else", async () => {
  const { prefersRupees, priceLabelFor } = await import("../lib/commerce.ts");
  const html = await (await render()).text();

  assert.equal(priceLabelFor(false, false), "$7.99");
  assert.equal(priceLabelFor(true, false), "₹549");
  assert.equal(priceLabelFor(true, true), "₹649");

  // Server-rendered HTML must stay in dollars: the export is one static file
  // served worldwide, so rupees are only ever swapped in after mount.
  assert.match(html, /\$7\.99/);
  assert.doesNotMatch(html, /₹/);

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

test("explains privacy without inventing screen, email-body, or microphone access", async () => {
  const html = await (await render()).text();

  assert.match(html, /Local file work/);
  assert.match(html, /Gmail envelope only/);
  assert.match(html, /Never the email body/);
  assert.match(html, /Private calendar feed/);
  assert.match(html, /No microphone audio/);
  assert.match(html, /not a recording or transcription/);
  assert.match(html, /No hidden screen reading/);
  assert.match(html, /Your reminders/);
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
  assert.match(storeCss, /\.store-hero h1,[\s\S]*line-height: 0\.94/);
  // Glass is now part of the design language, so backdrop-filter and the soft
  // radial auras behind it are expected. Repeating gradients stay out - they
  // were the pattern-y look the tactile system was defined against.
  assert.doesNotMatch(css, /repeating-linear-gradient/i);
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
  assert.match(html, /WHAT THIS CHANGES FOR YOU/);
  assert.match(html, /HOW IT HELPS/);
  // one payoff block per feature in the detailed directory
  assert.equal((html.match(/class="directory-helps"/g) ?? []).length, 20);
  const features = await source("../data/features.ts");
  // every feature id in the data must have a payoff line written for it
  const ids = [...features.matchAll(/^    id: "([a-z]+)",$/gm)].map((m) => m[1]);
  assert.equal(ids.length, 20);
  const helpsBlock = features.slice(features.indexOf("const helps"));
  for (const id of ids) {
    assert.match(helpsBlock, new RegExp(`\\n  ${id}:`), `${id} needs a payoff line`);
  }
});

test("keeps the optional supporter checkout behind its own configured Dodo link", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /\$7\.99/);
  assert.doesNotMatch(html, /\$8\.99/);
  assert.match(html, /Pay once\. No subscription, ever\./);
  assert.match(html, /All future updates and costumes included/);
  assert.match(html, /Every future update, free/);

  const page = await source("../app/page.tsx");
  const commerce = await source("../lib/commerce.ts");
  assert.match(page, /commerce\.supporterConfigured/);
  assert.match(page, /Add \$1 to support the developer/);
  assert.match(page, /priceLabelFor\(rupees, supportSelected\)/);
  assert.match(commerce, /supportDeveloper \? "\$8\.99" : "\$7\.99"/);
  assert.match(commerce, /NEXT_PUBLIC_DODO_SUPPORT_CHECKOUT_URL/);

  const css = await source("../app/globals.css");
  assert.match(css, /\.tip-toggle:has\(input:checked\)/);
});

test("tells the story of a flat day that a companion changes", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /Nothing is wrong\./);
  assert.match(html, /That is somehow the problem\./);
  assert.match(html, /give the best hours of your day to a screen/);
  assert.match(html, /Then a small pair of green eyes looks up at you\./);
  assert.match(html, /You close the laptop last/);
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
  assert.match(page, /cheerful: "\/cat\/hero-emotions\/cheerful\.webp"/);
  assert.match(page, /className="brand-link"/);
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
  assert.match(html, /class="skeuo-button skeuo-button-primary hero-buy"/);
  // it unlocks the locked hero and takes you to pricing
  assert.match(page, /unlockAndScroll\("#pricing"\)/);
  // the buy action leads, Explore Now steps back to secondary
  assert.match(page, /variant="secondary"\s+className="hero-explore"/);
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

test("dresses the site in the kawaii system without touching the cat", async () => {
  const layout = await source("../app/layout.tsx");
  const css = await source("../app/globals.css");

  // rounded display + UI faces
  assert.match(layout, /Baloo_2/);
  assert.match(layout, /Quicksand/);
  assert.match(layout, /variable: "--font-kawaii-display"/);
  assert.match(css, /--font-kawaii-display/);

  // the palette is applied by repainting the existing tokens, so the whole
  // site follows from one place rather than per-component overrides
  assert.match(css, /--background: var\(--kw-cream\)/);
  assert.match(css, /--text: #48505c/);
  assert.match(css, /--pink: #4fb2e8/);

  // skeuomorphism survives as puffy marshmallow bevels, glass stays milky
  assert.match(css, /\.skeuo-button\s*\{[^}]*border-radius: 999px/s);
  assert.match(css, /\.skeuo-button:active\s*\{[^}]*scale\(0\.97\)/s);
  assert.match(css, /--glass-tint-strong: rgba\(250, 253, 255/);

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

test("shows a welcome curtain with a loading bar before the site appears", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  // rendered server side too, so the page never flashes through underneath
  assert.match(html, /class="welcome-splash"/);
  assert.match(html, /Welcome to MewMuze/);
  assert.match(html, /class="splash-bar"/);

  // it lifts itself away and unlocks the page again
  assert.match(page, /setPhase\("leaving"\)/);
  assert.match(page, /setPhase\("gone"\)/);
  assert.match(page, /mewmuze-splash-open/);
  assert.match(css, /@keyframes splash-fill/);
  assert.match(css, /\.welcome-splash\.is-leaving/);
  // soft blue field, matching the page it hands over to
  assert.match(css, /\.welcome-splash\s*\{[^}]*background: #eef7ff/s);
});

test("uses Dodo checkout instead of collecting a local website account", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");

  assert.match(html, /ONE SAFE PURCHASE FLOW/);
  assert.match(html, /id="account"/);
  assert.match(html, /Secure checkout/);
  assert.match(html, /Copy your licence/);
  assert.match(html, /Unlock MewMuze/);
  assert.match(page, /pricing-gate/);
  assert.doesNotMatch(page, /type="password"|setPassword|localStorage|sessionStorage/);
  assert.doesNotMatch(html, /Create account|Log in|Signed in as/);
  assert.doesNotMatch(page, /localStorage|sessionStorage/);
});

test("writes the story as prose with no dashes anywhere in the copy", async () => {
  const page = await source("../app/page.tsx");
  const features = await source("../data/features.ts");

  // em dash and en dash are both out of the copy entirely
  for (const [name, src] of [["page.tsx", page], ["features.ts", features]]) {
    assert.doesNotMatch(src, /[–—]/, `${name} still contains a dash`);
  }

  const html = await (await render()).text();
  // the rewritten beats read as a narrative rather than feature captions
  assert.match(html, /The first thing that looks back/);
  assert.match(html, /It sits down when you do/);
  assert.match(html, /Somebody was paying attention to you today/);
  assert.match(html, /You laugh out loud, alone, at your desk/);
});

test("gives the splash a big title and a bare, blinking cat head", async () => {
  const html = await (await render()).text();
  const css = await source("../app/globals.css");

  // the head is the app's own sprite plus the hero's pupil and blink layers,
  // so it blinks with the real artwork rather than being a static logo tile
  assert.match(html, /class="splash-layer"/);
  assert.match(html, /splash-layer splash-blink/);
  assert.match(html, /hero-eye-track hero-eye-track-left/);
  assert.match(css, /\.splash-blink\s*\{[^}]*animation: hero-authentic-blink/s);

  // no card behind the head any more
  assert.match(css, /\.splash-cat\s*\{[^}]*background: transparent/s);
  assert.match(css, /\.splash-cat\s*\{[^}]*box-shadow: none/s);

  // and a much larger welcome
  assert.match(css, /\.splash-title\s*\{[^}]*font-size: clamp\(40px, 11vw, 104px\)/s);
});

test("puts the nav logo in a circle and centres the links", async () => {
  const css = await source("../app/globals.css");
  assert.match(css, /\.brand-medallion\s*\{\s*border-radius: 50%/);
  assert.match(css, /\.brand-medallion img\s*\{\s*border-radius: 50%/);
  // the links were baseline aligned in a taller row, riding high
  assert.match(css, /\.desktop-nav\s*\{[^}]*align-items: center;[^}]*align-self: center/s);
});

test("puts purchase and support links in the navigation", async () => {
  const html = await (await render()).text();
  const page = await source("../app/page.tsx");

  assert.doesNotMatch(html, /View the price/);
  assert.match(html, /nav-cta nav-cta-signup/);
  assert.match(html, />Buy MewMuze</);
  assert.match(html, />Support</);
  assert.doesNotMatch(page, /onAuthIntent|authMode|My account/);
});

test("renders purchase success, cancellation and support routes", async () => {
  const success = await (await render("/checkout/success")).text();
  const cancelled = await (await render("/checkout/cancelled")).text();
  const support = await (await render("/support")).text();
  const successSource = await source("../app/checkout/success/page.tsx");

  assert.match(success, /PURCHASE STATUS/);
  assert.match(successSource, /payment_id/);
  assert.match(successSource, /purchase-status\.php/);
  assert.doesNotMatch(successSource, /params\.get\("license_key"\)/);
  assert.match(successSource, /replaceState/);
  assert.match(successSource, /check your purchase email for the key/i);
  assert.match(success, /Download MewMuze 0\.1\.7/);
  assert.match(successSource, /href=\{DOWNLOAD_URL\}/);
  assert.doesNotMatch(successSource, /\{succeeded && \(\s*<a[^>]+href=\{DOWNLOAD_URL\}/);
  assert.match(cancelled, /Nothing was charged/);
  assert.match(support, /support@mewmuze\.com/);
  assert.match(support, /Never send a card number/);
});

test("stops clip-path from cropping the cat's ears on phones", async () => {
  const css = await source("../app/globals.css");
  // clip-path crops strictly to .hero-cat-art's own box and ignores ancestor
  // overflow entirely, which is why relaxing overflow never fixed this. The
  // head unit is deliberately larger than that box for the ears and crown.
  assert.match(css, /\.hero-cat-art \{[\s\S]*clip-path: inset\(0\)/);
  assert.match(css, /@media \(max-width: 760px\) \{\s*\.hero-cat-art \{\s*clip-path: none;/);
});

test("frames the splash head in a white skeuomorphic disc", async () => {
  const html = await (await render()).text();
  const css = await source("../app/globals.css");

  // disc clips, frame carries the sprite grid, so the eye sockets keep working
  // on the sprite's own coordinates without recalibration
  assert.match(html, /class="splash-disc"/);
  assert.match(html, /class="splash-frame"/);
  assert.match(css, /\.splash-disc\s*\{[^}]*border-radius: 50%/s);
  assert.match(css, /\.splash-disc\s*\{[^}]*background: #ffffff/s);
  // lit rim, seated edge and a contact shadow rather than a flat circle
  assert.match(css, /\.splash-disc\s*\{[^}]*inset 0 3px 0 #ffffff/s);
  assert.match(css, /\.splash-disc\s*\{[^}]*0 5px 0 #cfe4f7/s);

  // the head only fills the middle of its 128 frame, so the frame is scaled and
  // offset to centre the head in the disc and close the gap to the title
  assert.match(css, /\.splash-frame\s*\{[^}]*width: 150%/s);
  assert.match(css, /\.splash-frame\s*\{[^}]*left: -24\.4%/s);
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
  const page = await source("../app/page.tsx");
  // hiding only .nav-cta left .nav-auth as a third grid item, which wrapped to a
  // second row and doubled the dock height
  assert.match(css, /\.nav-auth \{\s*display: none;/);
  assert.match(css, /\.nav-dock \{\s*min-height: 54px/);
  // the purchase link moves into the Menu drawer so it stays reachable
  assert.match(page, /aria-label="Mobile navigation"[\s\S]{0,400}Buy MewMuze/);
});

test("centres the nav logo despite its off-centre source art", async () => {
  const css = await source("../app/globals.css");
  // measured on a 128 grid, the face-logo ink spans x11-127 and y9-121, so its
  // centre is (69, 65) not (64, 64) and it is clipped flush at the right edge.
  // The offsets below cancel exactly that error.
  assert.match(css, /\.brand-medallion img\s*\{[^}]*left: -6\.06%/s);
  assert.match(css, /\.brand-medallion img\s*\{[^}]*top: -2\.83%/s);
  assert.match(css, /\.brand-medallion img\s*\{[^}]*width: 104%/s);
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

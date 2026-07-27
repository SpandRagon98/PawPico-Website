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
  assert.match(html, /experience-locked/);
  assert.match(html, /mewmuze-hero-front-body-app\.png/);
  assert.match(html, /mewmuze-hero-front-head-app\.png/);
  assert.match(html, /mewmuze-face-logo-hd\.png/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /Store[\s\S]*Coming Soon/);
  assert.doesNotMatch(await source("../app/page.tsx"), /\bPawPico\b/);
});

test("locks scrolling until Explore Now unlocks the experience", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /const \[experienceUnlocked, setExperienceUnlocked\] = useState\(false\)/);
  assert.match(page, /mewmuze-scroll-locked/);
  assert.match(page, /setExperienceUnlocked\(true\)/);
  assert.match(page, /experience-\$\{experienceUnlocked \? "unlocked" : "locked"\}/);
  assert.match(css, /html\.mewmuze-scroll-locked/);
  assert.match(css, /body\.mewmuze-scroll-locked/);
  assert.match(css, /overflow: hidden !important/);
  assert.match(css, /\.hero \{[\s\S]*height: 100dvh/);
  assert.match(css, /\.experience-locked \.hero[\s\S]*touch-action: none/);
});

test("uses a large, seated app-density pixel cat with independent head and eye layers", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /HERO_CAT_BODY_ASSET = "\/cat\/mewmuze-hero-front-body-app\.png"/);
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

test("implements one efficient pupil-first and delayed-head cursor loop", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");
  const tracking = page.match(/useEffect\(\(\) => \{\s+if \(reducedMotion[\s\S]*?\}, \[finePointer, reducedMotion\]\);/)?.[0] ?? "";

  assert.match(tracking, /requestAnimationFrame/);
  assert.match(tracking, /window\.addEventListener\("pointermove", track/);
  assert.match(tracking, /IntersectionObserver/);
  assert.match(tracking, /visibilitychange/);
  assert.match(tracking, /pupil\.x \+= \(target\.x - pupil\.x\) \* 0\.22/);
  assert.match(tracking, /head\.x \+= \(target\.x - head\.x\) \* 0\.065/);
  assert.match(tracking, /heroHeadRef\.current\.style\.transform/);
  assert.doesNotMatch(tracking, /forcedLookRef/);
  assert.doesNotMatch(tracking.match(/const track =[\s\S]*?const returnToNeutral/)?.[0] ?? "", /set[A-Z]\w*\(/);
  assert.match(page, /prefers-reduced-motion: reduce/);
  assert.match(page, /\(pointer: fine\)/);
  assert.match(page, /touch-look/);
  assert.match(css, /\.hero-pupil/);
  assert.match(css, /@keyframes hero-authentic-blink/);
  assert.match(css, /@keyframes hero-ear-check/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("unlocks into the story while leaving the landing cat stationary", async () => {
  const page = await source("../app/page.tsx");
  const css = await source("../app/globals.css");

  assert.match(page, /const unlockAndScroll = \(targetId: "#story" \| "#features"\)/);
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

  assert.match(html, /Most desktops do their job\./);
  assert.match(html, /They just don&#x27;t keep you company\./);
  assert.match(html, /Then a tiny pair of green eyes appears\./);
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
  assert.match(page, /window\.setInterval\(\(\) => \{[\s\S]*\}, 2800\)/);
  assert.match(page, /IntersectionObserver/);
  assert.match(page, /if \(reducedMotion \|\| !isVisible\) return/);

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

test("adds an honest one-time $5.99 pricing section without a fake checkout", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /ONE-TIME PRICE/);
  assert.match(html, /\$5\.99/);
  assert.match(html, /No monthly or annual subscription/);
  assert.match(html, /Personal Windows desktop cat/);
  assert.match(html, /Local-first privacy/);
  assert.match(html, /Coming Soon/);
  assert.match(html, /Purchasing is not live yet/);
  assert.doesNotMatch(html, />\s*(?:Buy now|Checkout)\s*</i);
  assert.doesNotMatch(html, /Limited-time|refund policy/i);
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
  const renderer = await source("../scripts/render-authentic-web-assets.mjs");

  assert.equal(oldCat.readUInt32BE(16), 55);
  assert.equal(oldCat.readUInt32BE(20), 86);
  assert.equal(heroBody.readUInt32BE(16), 128);
  assert.equal(heroBody.readUInt32BE(20), 128);
  assert.equal(heroHead.readUInt32BE(16), 128);
  assert.equal(heroHead.readUInt32BE(20), 128);
  assert.equal(reference.readUInt32BE(16), 768);
  assert.equal(reference.readUInt32BE(20), 768);
  assert.equal(heroBody[25], 6);
  assert.equal(heroHead[25], 6);
  assert.match(renderer, /spriteLoader\.ts/);
  assert.match(renderer, /animationDefinitions\.ts/);
  assert.match(renderer, /export const ART = \$\{art\}/);
  assert.match(renderer, /PAWPICO_APP_ROOT is required and is used read-only/);
  assert.match(renderer, /Math\.round\(60 \/ meta\.fps\)/);
  assert.match(renderer, /durations\.push\(outputIndex % 3 === 2 \? 16 : 17\)/);
  assert.match(renderer, /furColor: "#eeeae3"/);
  assert.match(renderer, /pattern: "solid"/);
  assert.match(renderer, /accessory: "flowerCrown"/);
});

test("explains privacy without inventing screen, email-body, or microphone access", async () => {
  const html = await (await render()).text();

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

test("preserves the professional white tactile system and target breakpoints", async () => {
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
  assert.match(css, /\.cat-figure > img,[\s\S]*image-rendering: pixelated/);
  assert.match(css, /\.hero-cat-layer \{[\s\S]*image-rendering: pixelated/);
  assert.doesNotMatch(css, /backdrop-filter|repeating-linear-gradient|linear-gradient|radial-gradient/i);
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

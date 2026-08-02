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

  assert.match(html, /<title>MewMuze â€” Your Personal Desktop Cat<\/title>/);
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
  assert.match(page, /AUTHENTIC APP-RENDERED MOTION Â· TRANSPARENT/);
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
  assert.match(html, /White base Â· green eyes Â· pink ears/);
  assert.match(html, /Blink Â· curious look Â· happy response/);
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
      ëÝû¶‰žËkºwµç@ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±…å½ÕÐ¹ÑÍàˆ¤ì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì((€€¼¼É½Õ¹‘•‘¥ÍÁ±…ä€¬U$™…•Ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡±…å½ÕÐ°€½	…±½½|È¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡±…å½ÕÐ°€½EÕ¥­Í…¹¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡±…å½ÕÐ°€½Ù…É¥…‰±”è€ˆ´µ™½¹Ðµ­…Ý…¥¤µ‘¥ÍÁ±…äˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ™½¹Ðµ­…Ý…¥¤µ‘¥ÍÁ±…ä¼¤ì((€€¼¼Ñ¡”Á…±•ÑÑ”¥Ì…ÁÁ±¥•‰äÉ•Á…¥¹Ñ¥¹œÑ¡”•á¥ÍÑ¥¹œÑ½­•¹Ì°Í¼Ñ¡”Ý¡½±”(€€¼¼Í¥Ñ”™½±±½ÝÌ™É½´½¹”Á±…”É…Ñ¡•ÈÑ¡…¸Á•Èµ½µÁ½¹•¹Ð½Ù•ÉÉ¥‘•Ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ‰…­É½Õ¹èÙ…Ép ´µ­ÜµÉ•…µp¤¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µÑ•áÐè€ŒÐàÔÀÕŒ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µÁ¥¹¬è€ŒÑ™ˆÉ”à¼¤ì((€€¼¼Í­•Õ½µ½ÉÁ¡¥Í´ÍÕÉÙ¥Ù•Ì…ÌÁÕ™™äµ…ÉÍ¡µ…±±½Ü‰•Ù•±Ì°±…ÍÌÍÑ…åÌµ¥±­ä(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹Í­•Õ¼µ‰ÕÑÑ½¹qÌ©qímyõt©‰½É‘•ÈµÉ…‘¥ÕÌè€ääåÁà½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹Í­•Õ¼µ‰ÕÑÑ½¸é…Ñ¥Ù•qÌ©qímyõt©Í…±•p Áp¸äÝp¤½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ±…ÍÌµÑ¥¹ÐµÍÑÉ½¹œèÉ‰…p ÈÔÀ°€ÈÔÌ°€ÈÔÔ¼¤ì((€€¼¼ÕÑ”µ½Ñ¥½¸(€™½È€¡½¹ÍÐ­˜½˜l‰­Üµ‰½ˆˆ°€‰­ÜµÝ¥±”ˆ°€‰­Üµ™±½…Ðˆ°€‰­Üµ…Ðµ¥¸ˆ°€‰­ÜµÑ¥¬ˆ°€‰­Üµ¡•…ÉÑ‰•…Ð‰t¤ì(€€€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°¹•ÜI•áÀ¡­•å™É…µ•Ì€‘í­™õ€¤°€‘í­™ô­•å™É…µ”µ¥ÍÍ¥¹€¤ì(€ô((€€¼¼…¹Ñ¡”…Ð¥ÑÍ•±˜¥ÌÕ¹Ñ½Õ¡•(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µ•å”µÑÉ…­qÌ©qímqÍqMt¨ý‰½É‘•ÈµÉ…‘¥ÕÌéqÌ¨Ðà”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µÁÕÁ¥±qÌ©qímqÍqMt¨ý‰½É‘•ÈµÉ…‘¥ÕÌéqÌ¨ÐÜ”¼¤ì)ô¤ì()Ñ•ÍÐ ‰…±¥¹ÌÑ¡”µ½‰¥±”¹…Ø…¹­••ÁÌ­…Ý…¥¤Ñ•áÐÉ•…‘…‰±”ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì((€€¼¼€¹‰É…¹µ±¥¹¬Ý…Ì„‰±½¬°Í¼¥ÑÌ¥¹±¥¹”µ™±•à¡¥±Í…Ð™±ÕÍ Ñ¼Ñ¡”Ñ½À…¹(€€¼¼Ñ¡”‰É…¹•¹ÑÉ•€ÙÁà…‰½Ù”Ñ¡”5•¹Ô½¹ÑÉ½°½ÁÁ½Í¥Ñ”¥Ð(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µ±¥¹­qÌ©qímyõt©‘¥ÍÁ±…äè™±•àímyõt©…±¥¸µ¥Ñ•µÌè•¹Ñ•È½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¹…Øµ‘½­qÌ©qímyõt©Á…‘‘¥¹œè€áÁà€ÄÉÁà½Ì¤ì((€€¼¼Á…ÍÑ•°Ñ•áÐ¡…‘É¥™Ñ•Ñ½¼Á…±”è€àä¹½‘•ÌÝ•É”Õ¹‘•ÈÑ¡”]µ¥¹¥µÕ´(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µÑ•áÐµÍ•½¹‘…Éäè€ŒÔàØÈÜÀ¼¤ì(€€¼¼Ñ¡”ÁÉ¥Ù…ä‰±½¬­•ÁÐ„‘…É¬Á±Õ´™¥±°Ý¡¥±”¡•…‘¥¹ÌÑÕÉ¹•‘…É¬Á±Õ´°(€€¼¼±•…Ù¥¹œÑ¡”¡•…‘±¥¹”…Ð€Ä¸ÈÐèÄ(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÁÉ¥Ù…åqÌ©qíqÌ©‰…­É½Õ¹è€••˜Õ™¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÁÉ¥¥¹œµÁÉ¥”ÍÑÉ½¹qÌ©qíqÌ©½±½Èè€ŒÅ˜Ù™…”¼¤ì)ô¤ì()Ñ•ÍÐ ‰É•Ñ¥¹ÑÌÑ¡”Ý¡½±”Á¥¹¬Ñ¡•µ”Ñ¼±¥¡Ð‰±Õ”°É½½Ð…ÕÍ”…¹…±°ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€½¹ÍÐÍÑ½É”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½ÍÑ½É”½ÍÑ½É”¹ÍÌˆ¤ì((€€¼¼Q¡”‰…­É½Õ¹Ý…Í è™¥ÉÍÐÑÉ¥•…Ì„‰±Õ”½å•±±½ÜÉ½ÍÍ™…‘”°‰ÕÐÑ¡…Ð(€€¼¼Ý…Í¸ÐÑ¡”…ÑÕ…°Á¥¹¬ÕÍ•ÉÌ­•ÁÐÍ••¥¹œ€¡Í•”‰•±½Ü¤°Í¼¥ÐÍ¥µÁ±¥™¥•(€€¼¼‰…¬Ñ¼„Í¥¹±”ÍÑ…Ñ¥Œ±¥¡Ðµ‰±Õ”Ñ¥¹Ð½¹”Ñ¡”É•…°Í½ÕÉ”Ý…Ì™¥á•¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½‰½‘äèé…™Ñ•ÉqÌ©qímyõt©‰…­É½Õ¹émqÍqMt¨ýÉ‰…p ÄäØ°€ÈÈä°€ÈÔÔ°¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€½­•å™É…µ•Ì­Üµ…ÕÉ„µ‰±Õ”¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€½­•å™É…µ•Ì­Üµ…ÕÉ„µå•±±½Ü¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€½É‰…p ÈÔÔ°€ÈÄÐ°€ÈÌÈ°¼¤ì€¼¼Ñ¡”½±Á¥¹¬Ý…Í ((€€¼¼Q¡”…ÑÕ…°‘½µ¥¹…¹ÐÁ¥¹¬Ý…ÌÑ¡”Í¡…É•‰½É‘•È½Í¡…‘½ÜÑ½­•¹ÌÕÍ•‰ä(€€¼¼•Ù•Éä…É°‰ÕÑÑ½¸…¹Ñ¡”¹…ØÁ¥±°€´¹½ÐÑ¡”Á…”µÝ¥‘”Ý…Í ¸¥á•…Ð(€€¼¼Ñ¡”Ñ½­•¸±•Ù•°Í¼•Ù•Éä½¹ÍÕµ•ÈÁ¥­Ì¥ÐÕÀ¥¸½¹”Á±…”¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ‰½É‘•Èè€™”Ñ˜Ü¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ‰½É‘•Èµ‘…É¬è€Œá•ŒÍ•„¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µÍ¡…‘½ÜµÉ…¥Í•è€À€ÍÁà€À€™”Ñ˜Ü°€À€ÄÉÁà€ÈÙÁàÉ‰…p ÄÈÀ°€ÄØÔ°€ÈÄÐ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ±…ÍÌµ±¥¹”èÉ‰…p ÄÐÀ°€ÄäÀ°€ÈÌÀ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼´µ±…ÍÌµÍ¡…‘½Üè€À€ÄÉÁà€ÌÁÁàÉ‰…p ÄÈÀ°€ÄØÔ°€ÈÄÐ¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€¼´µ‰½É‘•Èè€™™Í”Ð¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€¼´µ‰½É‘•Èµ‘…É¬è€˜ÕˆÍ”¼¤ì((€€¼¼=¹”…Í­•Ñ¼É•Ñ¥¹ÐÑ¡”Ý¡½±”Ñ¡•µ”€¡¹½Ð©ÕÍÐÑ¡”…µ‰¥•¹ÐÝ…Í ¤°Ñ¡”(€€¼¼ÁÉ¥µ…ÉäQ€¼¡¥Àµ…Ñ¥Ù”€¼ÁÉ¥”€¼•å•‰É½Ü€¼ÅÕ¥•Ðµ±¥¹¬…•¹Ð½±½ÕÉÌ(€€¼¼€´ÁÉ•Ù¥½ÕÍ±ä±•™Ð…±½¹”…Ì€‰‘•±¥‰•É…Ñ”Á¥¹¬…•¹ÑÌˆ€´µ½Ù•Ñ½¼¸(€™½È€¡½¹ÍÐ½±‘!•à½˜lˆ™˜å‘ŒÀˆ°€ˆ™™ŒÉ‘Œˆ°€ˆ˜Ôá‰ˆÈˆ°€ˆäÝ™„àˆ°€ˆ”àÜÀåŒ‰t¤ì(€€€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°¹•ÜI•áÀ¡½±‘!•à¹É•Á±…” ˆŒˆ°€ˆŒˆ¤¤°€‘í½±‘!•áôÍ¡½Õ±‰”™Õ±±äÉ•Ñ¥É•‘€¤ì(€ô(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼ŒÑ™ˆÉ”à¼¤ì€¼¼Ù¥Ù¥…•¹ÐÉ•Á±…¥¹œ€™˜å‘ŒÀ(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€¼‰™”Á™ˆ¼¤ì€¼¼™¥±°É•Á±…¥¹œ€™™ŒÉ‘Œ((€€¼¼Q¡”ÍÑ½É”ÍÕˆµÁ…”¡…Ì¥ÑÌ½Ý¸ÍÑå±•Í¡••Ð…¹¹••‘•Ñ¡”Í…µ”Á…ÍÌ¸(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÑ½É”°€¼Í„ÙˆÕð™™˜Á˜Õð„å…ð™™‘™•Œ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÑ½É”°€¼Œá•ŒÍ•…ð•…˜Ñ™˜¼¤ì)ô¤ì()Ñ•ÍÐ ‰­••ÁÌÑ¡”µ½‰¥±”…Ð™Õ±±äÙ¥Í¥‰±”¥¹ÍÑ•…½˜±¥ÁÁ•‰ä¥ÑÌ½Ý¸™É…µ”ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼€¹¡•É¼µ…ÐµÁ••¬ÕÍ•Ñ¼±¥ÀÝ¥Ñ ½Ù•É™±½Üé¡¥‘‘•¸Ý¡¥±”¥ÑÌ½Ý¸¡¥±‘É•¸(€€¼¼€ ¹¡•É¼µ…Ðµµ½Ñ¥½¸°Ñ¡•¸€¹¡•É¼µ…Ðµ¡•…µÕ¹¥Ð½Ù•ÉÍ¡½½Ñ¥¹œ™ÕÉÑ¡•È™½ÈÑ¡”(€€¼¼•…ÈÑÕ™ÑÌ…¹™±½Ý•ÈÉ½Ý¸¤É•Í½±Ù•Ñ…±±•ÈÑ¡…¸¥Ð½¸„É•…°€ÌäÍààÔÈ(€€¼¼Ù¥•ÝÁ½ÉÐ°É½ÁÁ¥¹œÑ¡”Ñ½À…¹‰½ÑÑ½´½˜Ñ¡”…Ð(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½¥A¡½¹”€ÄÔ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½µ•‘¥„p¡µ…àµÝ¥‘Ñ è€ÜØÁÁáp¤qíqÌ©p¹¡•É¼µ…ÐµÁ••¬qíqÌ©½Ù•É™±½ÜèÙ¥Í¥‰±”íqÌ©¡•¥¡Ðè…ÕÑ¼ì¼¤ì(€€¼¼‘Ù ¥¹ÍÑ•…½˜Ù Í¼Ñ¡”Í¥é¥¹œÑÉ…­ÌM…™…É¤ÌÉ•…°Ù¥Í¥‰±”Ù¥•ÝÁ½ÉÐ(€€¼¼É…Ñ¡•ÈÑ¡…¸Ñ¡”…‘‘É•ÍÌµ‰…Èµ¡¥‘‘•¸€‰±…É”ˆÙ¥•ÝÁ½ÉÐ(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µ…Ðµµ½Ñ¥½¹qÌ©qímyõt©Ý¥‘Ñ éqÌ©µ¥¹p ÈÈÁÁà°€ÈÕ‘Ù¡p¤½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰É•Í•ÉÙ•Ì„™¥á•Ñ¥Ñ±”¡•¥¡ÐÍ¼‘…äµÑ¥µ•±¥¹”…É‘ÌÍÑ…ä…±¥¹•ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼„½¹”µ±¥¹”Ñ¥Ñ±”±•ÐÑ¡”Á…É…É…Á ‰•¹•…Ñ ¥ÐÍÑ…ÉÐ„™Õ±°±¥¹”€ ÈÕÁà¤(€€¼¼¡¥¡•ÈÑ¡…¸„ÑÝ¼µ±¥¹”Ñ¥Ñ±”ÌÁ…É…É…Á ¥¸Ñ¡”Í…µ”É½ÜìÑ¡”€äØÅÁà(€€¼¼Ý¥‘Ñ €¡©ÕÍÐ…‰½Ù”Ñ¡”‰É•…­Á½¥¹ÐÑ¡…ÐÍÑ…­ÌÑ¡¥Ì¥¹Ñ¼½¹”½±Õµ¸¤ÝÉ…ÁÌ(€€¼¼Ñ¡”±½¹•ÍÐÑ¥Ñ±”Ñ¼€Ð±¥¹•Ì°Í¼Ñ¡”É•Í•ÉÙ…Ñ¥½¸½Ù•ÉÌÑ¡…ÐÝ½ÉÍÐ…Í”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‘…äµÑ¥µ•±¥¹” ÍqÌ©qímyõt©‘¥ÍÁ±…äè™±•àímyõt©µ¥¸µ¡•¥¡Ðè€ÄÀÕÁàímyõt©…±¥¸µ¥Ñ•µÌè•¹Ñ•Èímyõt©©ÕÍÑ¥™äµ½¹Ñ•¹Ðè•¹Ñ•Èì½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰¥Ù•Ì¡•…‘¥¹œµ±¥­”€ñÍÑÉ½¹œø±…‰•±ÌÑ¡”Í…µ”‘¥ÍÁ±…ä™½¹Ð…ÌÉ•…°¡•…‘¥¹Ìˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼Ñ¡”™•…ÑÕÉ”…É½ÕÍ•°ÌÑ¥Ñ±”•¡¼…¹Ñ¡”¹…Ø‰É…¹Ý½É‘µ…É¬Ý•É”‰½Ñ (€€¼¼µ…É­•ÕÀ…Ì€ñÍÑÉ½¹œø°Í¼Ñ¡” Äµ Ð‘¥ÍÁ±…äµ™½¹ÐÉÕ±”¹•Ù•ÈÉ•…¡•Ñ¡•´(€€¼¼…¹Ñ¡•ä™•±°‰…¬Ñ¼Ñ¡”Á±…¥¸U$™½¹Ð¹•áÐÑ¼µ…Ñ¡¥¹œ	…±½¼€ÈÑ•áÐ(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹Ñ¡•…ÑÉ”µ½Õ¹Ñ•ÈÍÑÉ½¹œ±qÌ©q¹p¹Í¡½Ý…Í”µÑ¥­•ÐÍÑÉ½¹œ±qÌ©q¹p¹ÁÉ•Í•ÐµÑ¥­•ÐÍÑÉ½¹œ±qÌ©q¹p¹ÁÉ¥¥¹œµ‰É…¹ÍÑÉ½¹œ±qÌ©q¹p¹Í¥Ñ”µ‰É…¹ÍÑÉ½¹qÌ©qíqÌ©™½¹Ðµ™…µ¥±äèÙ…Ép ´µ™½¹Ðµ­…Ý…¥¤µ‘¥ÍÁ±…åp¤¼¤ì)ô¤ì()Ñ•ÍÐ ‰µ…­•ÌÑ¡”¹…Ø‰…È„™Õ±°Á•‰‰±”½Á¥±°Í¡…Á”…Ð•Ù•ÉäÝ¥‘Ñ ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¹…Øµ‘½­qÌ©qíqÌ©‰½É‘•ÈµÉ…‘¥ÕÌè€ääåÁàíqÌ©qõqÌ¨½´¤ì)ô¤ì()Ñ•ÍÐ ‰Í¡½ÝÌ„Ý•±½µ”ÕÉÑ…¥¸Ý¥Ñ „±½…‘¥¹œ‰…È‰•™½É”Ñ¡”Í¥Ñ”…ÁÁ•…ÉÌˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÁ…”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½Á…”¹ÑÍàˆ¤ì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì((€€¼¼É•¹‘•É•Í•ÉÙ•ÈÍ¥‘”Ñ½¼°Í¼Ñ¡”Á…”¹•Ù•È™±…Í¡•ÌÑ¡É½Õ Õ¹‘•É¹•…Ñ (€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½±…ÍÌô‰Ý•±½µ”µÍÁ±…Í ˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½]•±½µ”Ñ¼5•Ý5Õé”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½±…ÍÌô‰ÍÁ±…Í µ‰…Èˆ¼¤ì((€€¼¼¥Ð±¥™ÑÌ¥ÑÍ•±˜…Ý…ä…¹Õ¹±½­ÌÑ¡”Á…”……¥¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡Á…”°€½Í•ÑA¡…Í•p ‰±•…Ù¥¹œ‰p¤¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡Á…”°€½Í•ÑA¡…Í•p ‰½¹”‰p¤¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡Á…”°€½µ•ÝµÕé”µÍÁ±…Í µ½Á•¸¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½­•å™É…µ•ÌÍÁ±…Í µ™¥±°¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹Ý•±½µ”µÍÁ±…Í¡p¹¥Ìµ±•…Ù¥¹œ¼¤ì(€€¼¼Í½™Ð‰±Õ”™¥•±°µ…Ñ¡¥¹œÑ¡”Á…”¥Ð¡…¹‘Ì½Ù•ÈÑ¼(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹Ý•±½µ”µÍÁ±…Í¡qÌ©qímyõt©‰…­É½Õ¹è€••˜Ý™˜½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰ÕÍ•Ì½‘¼¡•­½ÕÐ¥¹ÍÑ•…½˜½±±•Ñ¥¹œ„±½…°Ý•‰Í¥Ñ”…½Õ¹Ðˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÁ…”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½Á…”¹ÑÍàˆ¤ì((€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½=9MAUI!M1=\¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½¥ô‰…½Õ¹Ðˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½M•ÕÉ”¡•­½ÕÐ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½½Áäå½ÕÈ±¥•¹”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½U¹±½¬5•Ý5Õé”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡Á…”°€½ÁÉ¥¥¹œµ…Ñ”¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡Á…”°€½ÑåÁ”ô‰Á…ÍÍÝ½É‰ñÍ•ÑA…ÍÍÝ½É‘ñ±½…±MÑ½É…•ñÍ•ÍÍ¥½¹MÑ½É…”¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡¡Ñµ°°€½É•…Ñ”…½Õ¹Ññ1½œ¥¹ñM¥¹•¥¸…Ì¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡Á…”°€½±½…±MÑ½É…•ñÍ•ÍÍ¥½¹MÑ½É…”¼¤ì)ô¤ì()Ñ•ÍÐ ‰ÝÉ¥Ñ•ÌÑ¡”ÍÑ½Éä…ÌÁÉ½Í”Ý¥Ñ ¹¼‘…Í¡•Ì…¹åÝ¡•É”¥¸Ñ¡”½Áäˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÁ…”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½Á…”¹ÑÍàˆ¤ì(€½¹ÍÐ™•…ÑÕÉ•Ì€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½‘…Ñ„½™•…ÑÕÉ•Ì¹ÑÌˆ¤ì((€€¼¼•´‘…Í …¹•¸‘…Í …É”‰½Ñ ½ÕÐ½˜Ñ¡”½Áä•¹Ñ¥É•±ä(€™½È€¡½¹ÍÐm¹…µ”°ÍÉt½˜ml‰Á…”¹ÑÍàˆ°Á…•t°l‰™•…ÑÕÉ•Ì¹ÑÌˆ°™•…ÑÕÉ•Íut¤ì(€€€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÉŒ°€½oŠOŠQt¼°€‘í¹…µ•ôÍÑ¥±°½¹Ñ…¥¹Ì„‘…Í¡€¤ì(€ô((€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€€¼¼Ñ¡”É•ÝÉ¥ÑÑ•¸‰•…ÑÌÉ•……Ì„¹…ÉÉ…Ñ¥Ù”É…Ñ¡•ÈÑ¡…¸™•…ÑÕÉ”…ÁÑ¥½¹Ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½Q¡”™¥ÉÍÐÑ¡¥¹œÑ¡…Ð±½½­Ì‰…¬¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½%ÐÍ¥ÑÌ‘½Ý¸Ý¡•¸å½Ô‘¼¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½M½µ•‰½‘äÝ…ÌÁ…å¥¹œ…ÑÑ•¹Ñ¥½¸Ñ¼å½ÔÑ½‘…ä¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½e½Ô±…Õ ½ÕÐ±½Õ°…±½¹”°…Ðå½ÕÈ‘•Í¬¼¤ì)ô¤ì()Ñ•ÍÐ ‰¥Ù•ÌÑ¡”ÍÁ±…Í „‰¥œÑ¥Ñ±”…¹„‰…É”°‰±¥¹­¥¹œ…Ð¡•…ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì((€€¼¼Ñ¡”¡•…¥ÌÑ¡”…ÁÀÌ½Ý¸ÍÁÉ¥Ñ”Á±ÕÌÑ¡”¡•É¼ÌÁÕÁ¥°…¹‰±¥¹¬±…å•ÉÌ°(€€¼¼Í¼¥Ð‰±¥¹­ÌÝ¥Ñ Ñ¡”É•…°…ÉÑÝ½É¬É…Ñ¡•ÈÑ¡…¸‰•¥¹œ„ÍÑ…Ñ¥Œ±½¼Ñ¥±”(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½±…ÍÌô‰ÍÁ±…Í µ±…å•Èˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½ÍÁ±…Í µ±…å•ÈÍÁ±…Í µ‰±¥¹¬¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½¡•É¼µ•å”µÑÉ…¬¡•É¼µ•å”µÑÉ…¬µ±•™Ð¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ‰±¥¹­qÌ©qímyõt©…¹¥µ…Ñ¥½¸è¡•É¼µ…ÕÑ¡•¹Ñ¥Œµ‰±¥¹¬½Ì¤ì((€€¼¼¹¼…É‰•¡¥¹Ñ¡”¡•……¹äµ½É”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ…ÑqÌ©qímyõt©‰…­É½Õ¹èÑÉ…¹ÍÁ…É•¹Ð½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ…ÑqÌ©qímyõt©‰½àµÍ¡…‘½Üè¹½¹”½Ì¤ì((€€¼¼…¹„µÕ ±…É•ÈÝ•±½µ”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µÑ¥Ñ±•qÌ©qímyõt©™½¹ÐµÍ¥é”è±…µÁp ÐÁÁà°€ÄÅÙÜ°€ÄÀÑÁáp¤½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰ÁÕÑÌÑ¡”¹…Ø±½¼¥¸„¥É±”…¹•¹ÑÉ•ÌÑ¡”±¥¹­Ìˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µµ•‘…±±¥½¹qÌ©qíqÌ©‰½É‘•ÈµÉ…‘¥ÕÌè€ÔÀ”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µµ•‘…±±¥½¸¥µqÌ©qíqÌ©‰½É‘•ÈµÉ…‘¥ÕÌè€ÔÀ”¼¤ì(€€¼¼Ñ¡”±¥¹­ÌÝ•É”‰…Í•±¥¹”…±¥¹•¥¸„Ñ…±±•ÈÉ½Ü°É¥‘¥¹œ¡¥ (€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‘•Í­Ñ½Àµ¹…ÙqÌ©qímyõt©…±¥¸µ¥Ñ•µÌè•¹Ñ•Èímyõt©…±¥¸µÍ•±˜è•¹Ñ•È½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰ÁÕÑÌÁÕÉ¡…Í”…¹ÍÕÁÁ½ÉÐ±¥¹­Ì¥¸Ñ¡”¹…Ù¥…Ñ¥½¸ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÁ…”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½Á…”¹ÑÍàˆ¤ì((€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡¡Ñµ°°€½Y¥•ÜÑ¡”ÁÉ¥”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½¹…ØµÑ„¹…ØµÑ„µÍ¥¹ÕÀ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€¼ù	Õä5•Ý5Õé”ð¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€¼ùMÕÁÁ½ÉÐð¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡Á…”°€½½¹ÕÑ¡%¹Ñ•¹Ññ…ÕÑ¡5½‘•ñ5ä…½Õ¹Ð¼¤ì)ô¤ì()Ñ•ÍÐ ‰É•¹‘•ÉÌÁÕÉ¡…Í”ÍÕ•ÍÌ°…¹•±±…Ñ¥½¸…¹ÍÕÁÁ½ÉÐÉ½ÕÑ•Ìˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÕ•ÍÌ€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ˆ½¡•­½ÕÐ½ÍÕ•ÍÌˆ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐ…¹•±±•€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ˆ½¡•­½ÕÐ½…¹•±±•ˆ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÍÕÁÁ½ÉÐ€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ˆ½ÍÕÁÁ½ÉÐˆ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÍÕ•ÍÍM½ÕÉ”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½¡•­½ÕÐ½ÍÕ•ÍÌ½Á…”¹ÑÍàˆ¤ì((€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕ•ÍÌ°€½AUI!MMQQUL¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕ•ÍÍM½ÕÉ”°€½Á…åµ•¹Ñ}¥¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕ•ÍÍM½ÕÉ”°€½ÁÕÉ¡…Í”µÍÑ…ÑÕÍp¹Á¡À¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÕ•ÍÍM½ÕÉ”°€½Á…É…µÍp¹•Ñp ‰±¥•¹Í•}­•ä‰p¤¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕ•ÍÍM½ÕÉ”°€½É•Á±…•MÑ…Ñ”¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕ•ÍÍM½ÕÉ”°€½¡•¬å½ÕÈÁÕÉ¡…Í”•µ…¥°™½ÈÑ¡”­•ä½¤¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡…¹•±±•°€½9½Ñ¡¥¹œÝ…Ì¡…É•¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕÁÁ½ÉÐ°€½ÍÕÁÁ½ÉÑµ•ÝµÕé•p¹½´¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÕÁÁ½ÉÐ°€½9•Ù•ÈÍ•¹„…É¹Õµ‰•È¼¤ì)ô¤ì()Ñ•ÍÐ ‰ÍÑ½ÁÌ±¥ÀµÁ…Ñ ™É½´É½ÁÁ¥¹œÑ¡”…ÐÌ•…ÉÌ½¸Á¡½¹•Ìˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼±¥ÀµÁ…Ñ É½ÁÌÍÑÉ¥Ñ±äÑ¼€¹¡•É¼µ…Ðµ…ÉÐÌ½Ý¸‰½à…¹¥¹½É•Ì…¹•ÍÑ½È(€€¼¼½Ù•É™±½Ü•¹Ñ¥É•±ä°Ý¡¥ ¥ÌÝ¡äÉ•±…á¥¹œ½Ù•É™±½Ü¹•Ù•È™¥á•Ñ¡¥Ì¸Q¡”(€€¼¼¡•…Õ¹¥Ð¥Ì‘•±¥‰•É…Ñ•±ä±…É•ÈÑ¡…¸Ñ¡…Ð‰½à™½ÈÑ¡”•…ÉÌ…¹É½Ý¸¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µ…Ðµ…ÉÐqímqÍqMt©±¥ÀµÁ…Ñ è¥¹Í•Ñp Áp¤¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½µ•‘¥„p¡µ…àµÝ¥‘Ñ è€ÜØÁÁáp¤qíqÌ©p¹¡•É¼µ…Ðµ…ÉÐqíqÌ©±¥ÀµÁ…Ñ è¹½¹”ì¼¤ì)ô¤ì()Ñ•ÍÐ ‰™É…µ•ÌÑ¡”ÍÁ±…Í ¡•…¥¸„Ý¡¥Ñ”Í­•Õ½µ½ÉÁ¡¥Œ‘¥ÍŒˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐ¡Ñµ°€ô…Ý…¥Ð€¡…Ý…¥ÐÉ•¹‘•È ¤¤¹Ñ•áÐ ¤ì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì((€€¼¼‘¥ÍŒ±¥ÁÌ°™É…µ”…ÉÉ¥•ÌÑ¡”ÍÁÉ¥Ñ”É¥°Í¼Ñ¡”•å”Í½­•ÑÌ­••ÀÝ½É­¥¹œ(€€¼¼½¸Ñ¡”ÍÁÉ¥Ñ”Ì½Ý¸½½É‘¥¹…Ñ•ÌÝ¥Ñ¡½ÕÐÉ•…±¥‰É…Ñ¥½¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½±…ÍÌô‰ÍÁ±…Í µ‘¥ÍŒˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡¡Ñµ°°€½±…ÍÌô‰ÍÁ±…Í µ™É…µ”ˆ¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ‘¥ÍqÌ©qímyõt©‰½É‘•ÈµÉ…‘¥ÕÌè€ÔÀ”½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ‘¥ÍqÌ©qímyõt©‰…­É½Õ¹è€™™™™™˜½Ì¤ì(€€¼¼±¥ÐÉ¥´°Í•…Ñ••‘”…¹„½¹Ñ…ÐÍ¡…‘½ÜÉ…Ñ¡•ÈÑ¡…¸„™±…Ð¥É±”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ‘¥ÍqÌ©qímyõt©¥¹Í•Ð€À€ÍÁà€À€™™™™™˜½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ‘¥ÍqÌ©qímyõt¨À€ÕÁà€À€™”Ñ˜Ü½Ì¤ì((€€¼¼Ñ¡”¡•…½¹±ä™¥±±ÌÑ¡”µ¥‘‘±”½˜¥ÑÌ€ÄÈà™É…µ”°Í¼Ñ¡”™É…µ”¥ÌÍ…±•…¹(€€¼¼½™™Í•ÐÑ¼•¹ÑÉ”Ñ¡”¡•…¥¸Ñ¡”‘¥ÍŒ…¹±½Í”Ñ¡”…ÀÑ¼Ñ¡”Ñ¥Ñ±”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ™É…µ•qÌ©qímyõt©Ý¥‘Ñ è€ÄÔÀ”½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹ÍÁ±…Í µ™É…µ•qÌ©qímyõt©±•™Ðè€´ÈÑp¸Ð”½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰­••ÁÌÑ¡”Ñ…‰±•Ð‰…¹™É½´‘É½ÁÁ¥¹œÑ¡”…Ð½¸Ñ½À½˜Ñ¡”¡•…‘±¥¹”ˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼€¹¡•É¼µ½Áä½•Ì™Õ±°Ý¥‘Ñ …Ð€ÄÄàÁÁà…¹‰•±½Ü°‰ÕÐÑ¡”¡•É¼½¹±äÍÑ…­Ì…Ð(€€¼¼€ÜØÁÁà…¹‰•±½Ü°Í¼€ÜØÅÁàÑ¼€ÄÄàÁÁà¡…Ñ¡”…ÐÍ¥ÑÑ¥¹œ½Ù•ÈÑ¡”½Áä(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½µ•‘¥„p¡µ¥¸µÝ¥‘Ñ è€ÜØÅÁáp¤…¹p¡µ…àµÝ¥‘Ñ è€ÄÄàÁÁáp¤¼¤ì(€€¼¼É…¹”Í½Á•°Í¼¥Ð…¸¹•Ù•È½Ù•ÉÉ¥‘”Ñ¡”Á¡½¹”ÉÕ±•Ì•…É±¥•È¥¸Ñ¡”™¥±”(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½µ•‘¥„p¡µ¥¸µÝ¥‘Ñ è€äØÅÁáp¤qíqÌ©p¹‘•Í­Ñ½Àµ¹…ØqíqÌ©‘¥ÍÁ±…äè™±•à¼¤ì)ô¤ì()Ñ•ÍÐ ‰­••ÁÌÑ¡”Á¡½¹”¹…Ø‰…È½¸„Í¥¹±”½µÁ…ÐÉ½Üˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€½¹ÍÐÁ…”€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½Á…”¹ÑÍàˆ¤ì(€€¼¼¡¥‘¥¹œ½¹±ä€¹¹…ØµÑ„±•™Ð€¹¹…Øµ…ÕÑ …Ì„Ñ¡¥ÉÉ¥¥Ñ•´°Ý¡¥ ÝÉ…ÁÁ•Ñ¼„(€€¼¼Í•½¹É½Ü…¹‘½Õ‰±•Ñ¡”‘½¬¡•¥¡Ð(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¹…Øµ…ÕÑ qíqÌ©‘¥ÍÁ±…äè¹½¹”ì¼¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¹…Øµ‘½¬qíqÌ©µ¥¸µ¡•¥¡Ðè€ÔÑÁà¼¤ì(€€¼¼Ñ¡”ÁÕÉ¡…Í”±¥¹¬µ½Ù•Ì¥¹Ñ¼Ñ¡”5•¹Ô‘É…Ý•ÈÍ¼¥ÐÍÑ…åÌÉ•…¡…‰±”(€…ÍÍ•ÉÐ¹µ…Ñ ¡Á…”°€½…É¥„µ±…‰•°ô‰5½‰¥±”¹…Ù¥…Ñ¥½¸‰mqÍqMuìÀ°ÐÀÁõ	Õä5•Ý5Õé”¼¤ì)ô¤ì()Ñ•ÍÐ ‰•¹ÑÉ•ÌÑ¡”¹…Ø±½¼‘•ÍÁ¥Ñ”¥ÑÌ½™˜µ•¹ÑÉ”Í½ÕÉ”…ÉÐˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼µ•…ÍÕÉ•½¸„€ÄÈàÉ¥°Ñ¡”™…”µ±½¼¥¹¬ÍÁ…¹ÌàÄÄ´ÄÈÜ…¹ää´ÄÈÄ°Í¼¥ÑÌ(€€¼¼•¹ÑÉ”¥Ì€ Øä°€ØÔ¤¹½Ð€ ØÐ°€ØÐ¤…¹¥Ð¥Ì±¥ÁÁ•™±ÕÍ …ÐÑ¡”É¥¡Ð•‘”¸(€€¼¼Q¡”½™™Í•ÑÌ‰•±½Ü…¹•°•á…Ñ±äÑ¡…Ð•ÉÉ½È¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µµ•‘…±±¥½¸¥µqÌ©qímyõt©±•™Ðè€´Ùp¸ÀØ”½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µµ•‘…±±¥½¸¥µqÌ©qímyõt©Ñ½Àè€´Ép¸àÌ”½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹‰É…¹µµ•‘…±±¥½¸¥µqÌ©qímyõt©Ý¥‘Ñ è€ÄÀÐ”½Ì¤ì)ô¤ì()Ñ•ÍÐ ‰­••ÁÌÑ¡”¹•ÕÑÉ…°ÁÕÁ¥°Ñ¡”Í…µ”É½Õ¹Í¡…Á”…ÌÑ¡”Á…¥¹Ñ•½¹•Ìˆ°…Íå¹Œ€ ¤€ôøì(€½¹ÍÐÍÌ€ô…Ý…¥ÐÍ½ÕÉ” ˆ¸¸½…ÁÀ½±½‰…±Ì¹ÍÌˆ¤ì(€€¼¼=¹±äÑ¡”¹•ÕÑÉ…°¡•…¡…ÌÁÕÁ¥°µ±•ÍÌ•å•Ì°Í¼Ñ¡•Í”MLÁÕÁ¥±ÌÍÑ…¹¥¸™½È(€€¼¼Ñ¡”½¹•Ì¡…ÁÁä…¹Í…¡…Ù”Á…¥¹Ñ•¥¸¸ÍÑ•ÁÁ•±¥ÀµÁ…Ñ Ý…ÌÑÉ¥•Ñ¼(€€¼¼€‰Á¥á•±…Ñ”ˆÑ¡•´…¹É•……Ì„‰½áäÉ½Õ¹‘•É•Ñ…¹±”Ý¥Ñ ÍÅÕ…É”±¥¹ÑÌ°(€€¼¼Ý¡¥ µ…Ñ¡•Ñ¡”Á…¥¹Ñ•ÁÕÁ¥±ÌÝ½ÉÍ”Ñ¡…¸Ñ¡”É½Õ¹½É¥¥¹…°‘¥¸(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µÁÕÁ¥°qímqÍqMt¨ý‰½É‘•ÈµÉ…‘¥ÕÌè€ÐÜ”¼¤ì(€…ÍÍ•ÉÐ¹‘½•Í9½Ñ5…Ñ ¡ÍÌ°€½p¹¡•É¼µÁÕÁ¥°qímyõt©±¥ÀµÁ…Ñ ½Ì¤ì(€…ÍÍ•ÉÐ¹µ…Ñ ¡ÍÌ°€½p¹¡•É¼µÁÕÁ¥°èé‰•™½É”±qÌ©q¹p¹¡•É¼µÁÕÁ¥°èé…™Ñ•ÈqímqÍqMt¨ý‰½É‘•ÈµÉ…‘¥ÕÌè€Ðà”¼¤ì)ô¤ì
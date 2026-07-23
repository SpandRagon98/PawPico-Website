import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete PawPico product story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>PawPico — One tiny cat\. An entire inner life\.<\/title>/i);
  assert.match(html, /One tiny cat\./);
  assert.match(html, /87[\s\S]*animation states/);
  assert.match(html, /Work mode &amp; Quick Tools/);
  assert.match(html, /Music &amp; singing/);
  assert.match(html, /Local AI-agent companion/);
  assert.match(html, /THE COMPLETE ANIMATION LEDGER/);
  assert.doesNotMatch(html, /voice commands/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|Your site is taking shape/i);
});

test("ships eight app-faithful feature films and accessible product navigation", async () => {
  const response = await render();
  const html = await response.text();
  const filmFiles = (await readdir(new URL("../public/videos/", import.meta.url)))
    .filter((name) => [
      "desktop-physics.mp4",
      "touch-and-mochi.mp4",
      "work-mode.mp4",
      "context-companion.mp4",
      "music-and-singing.mp4",
      "rest-and-emotion.mp4",
      "customization-studio.mp4",
      "focus-and-agent.mp4",
    ].includes(name));
  assert.equal(new Set(filmFiles).size, 8);
  for (const label of ["Desktop physics", "Touch &amp; mochi", "Work mode", "Context companion", "Music &amp; singing", "Rest &amp; emotion", "Customization", "Focus &amp; agent"]) {
    assert.match(html, new RegExp(label));
  }
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="#films"/);
  assert.match(html, /href="#complete"/);
  assert.match(html, /href="#atelier"/);
  assert.match(html, /href="#privacy"/);
  assert.match(html, /og:image/);
  assert.match(html, /\/og\.png/);
});

test("ships the animated hero, new logo, pricing, and phone-first breakpoints", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /\/pawpico-idle-reel\.mp4/);
  assert.match(html, /\/pawpico-face-logo\.png/);
  assert.equal((html.match(/\$5\.99/g) ?? []).length, 1);
  assert.match(html, /ONE-TIME PRICE/);
  assert.match(html, /Cheer · sing · listen · groom · rest/);
  assert.ok((await stat(new URL("../public/pawpico-idle-reel.mp4", import.meta.url))).size > 100_000);
  assert.ok((await stat(new URL("../public/pawpico-face-logo.png", import.meta.url))).size > 1_000_000);
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 1040px\)/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /safe-area-inset/);
  assert.match(css, /\.section-shell\s*\{\s*width:\s*100%/);
  assert.match(css, /100svh/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.drawer-cat-stage\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*7/s);
});

test("keeps the orange theme and animates a relevant cat beside every feature description", async () => {
  const response = await render();
  const html = await response.text();
  assert.equal((html.match(/class="drawer-cat-stage"/g) ?? []).length, 9);
  for (const preview of [
    "desktop-physics.mp4",
    "touch-and-mochi.mp4",
    "rest-and-emotion.mp4",
    "context-companion.mp4",
    "work-mode.mp4",
    "focus-and-agent.mp4",
    "customization-studio.mp4",
    "pawpico-idle-reel.mp4",
  ]) {
    assert.match(html, new RegExp(preview.replace(".", "\\.")));
  }
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /setInterval|data-theme|paletteIndex|Soft gray|Blush pink/);
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.drawer-cat-stage/);
  assert.doesNotMatch(css, /data-theme|theme-cycle|palette-dots/);
});

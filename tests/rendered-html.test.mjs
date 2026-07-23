import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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

test("server-renders the complete current PawPico product story", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>PawPico — One tiny cat\. An entire inner life\.<\/title>/i);
  assert.match(html, /Your desktop,/);
  assert.match(html, /87[\s\S]*motion states/);
  assert.match(html, /Work mode &amp; Quick Tools/);
  assert.match(html, /Gmail connector/);
  assert.match(html, /Google Calendar connector/);
  assert.match(html, /Notifications &amp; reminders/);
  assert.match(html, /Music, microphone &amp; sound/);
  assert.match(html, /Local AI-agent companion/);
  assert.match(html, /THE COMPLETE MOTION LEDGER/);
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
  assert.match(css, /var\(--font-cormorant\)/);
  assert.match(css, /backdrop-filter:\s*blur\(18px\)/);
  assert.match(css, /@media \(max-width: 1180px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /safe-area-inset/);
  assert.match(css, /\.section-shell\s*\{\s*width:\s*min\(1540px/);
  assert.match(css, /100svh/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /\.drawer-film\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.doesNotMatch(css, /data-theme|theme-cycle|palette-dots/);
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

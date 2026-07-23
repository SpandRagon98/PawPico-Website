import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website";
const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");

for (const expected of [
  `${basePath}/_next/`,
  `${basePath}/videos/`,
  `${basePath}/pawpico-face-logo.png`,
  `${basePath}/pawpico-idle-reel.mp4`,
]) {
  assert.ok(html.includes(expected), `Static export is missing ${expected}`);
}

assert.doesNotMatch(html, /(?:src|href|poster)="\/(?:_next|videos|pawpico-)/);

for (const file of [
  "../out/index.html",
  "../out/pawpico-face-logo.png",
  "../out/pawpico-idle-reel.mp4",
  "../out/videos/desktop-physics.mp4",
]) {
  assert.ok((await stat(new URL(file, import.meta.url))).size > 0, `${file} is empty`);
}

console.log(`GitHub Pages export verified for ${basePath}`);

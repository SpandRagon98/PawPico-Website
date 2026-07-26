import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website";
const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const storeHtml = await readFile(new URL("../out/store/index.html", import.meta.url), "utf8");
const detailHtml = await readFile(new URL("../out/store/space-explorer/index.html", import.meta.url), "utf8");

for (const expected of [
  `${basePath}/_next/`,
  `${basePath}/videos/`,
  `${basePath}/pawpico-face-logo.png`,
  `${basePath}/pawpico-idle-reel.mp4`,
]) {
  assert.ok(html.includes(expected), `Static export is missing ${expected}`);
}

assert.doesNotMatch(html, /(?:src|href|poster)="\/(?:_next|videos|pawpico-)/);
assert.ok(storeHtml.includes("Dress"), "Static export is missing the Store hero");
assert.ok(storeHtml.includes(`${basePath}/store/space-explorer/`), "Store links do not include the Pages base path");
assert.ok(detailHtml.includes("Space Explorer"), "Static export is missing product detail pages");
assert.ok(
  !storeHtml.includes(`href="${basePath}${basePath}`),
  "A Store link contains the Pages base path twice",
);
assert.doesNotMatch(storeHtml, /(?:src|href)="\/(?:_next|store|pawpico-)/);

for (const file of [
  "../out/index.html",
  "../out/pawpico-face-logo.png",
  "../out/pawpico-idle-reel.mp4",
  "../out/videos/desktop-physics.mp4",
  "../out/store/index.html",
  "../out/store/space-explorer/index.html",
  "../out/store/specs/costume-manifest.schema.json",
  "../out/store/samples/space-explorer-sample.mewcostume",
]) {
  assert.ok((await stat(new URL(file, import.meta.url))).size > 0, `${file} is empty`);
}

console.log(`GitHub Pages export verified for ${basePath}`);

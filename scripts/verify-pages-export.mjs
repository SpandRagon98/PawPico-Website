import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const basePath =
  process.env.HOSTINGER_BUILD === "true"
    ? ""
    : process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website";
const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
const storeHtml = await readFile(new URL("../out/store/index.html", import.meta.url), "utf8");
const detailHtml = await readFile(
  new URL("../out/store/mecha-hero/index.html", import.meta.url),
  "utf8",
);

for (const expected of [
  `${basePath}/_next/`,
  `${basePath}/cat/`,
  `${basePath}/og-mewmuze.png`,
]) {
  assert.ok(html.includes(expected), `Static export is missing ${expected}`);
}

if (basePath) {
  assert.doesNotMatch(
    html,
    /(?:src|href|poster)="\/(?:_next|cat|videos|mewmuze-|pawpico-)/,
  );
}
assert.ok(
  storeHtml.includes("The wardrobe is still being stitched."),
  "Static export is missing the Store hero",
);
assert.ok(
  storeHtml.includes(`${basePath}/store/mecha-hero/`),
  "Store links do not include the Pages base path",
);
assert.ok(detailHtml.includes("Mecha Hero"), "Static export is missing concept detail pages");
if (basePath) {
  assert.ok(
    !storeHtml.includes(`href="${basePath}${basePath}`),
    "A Store link contains the Pages base path twice",
  );
}
if (basePath) {
  assert.doesNotMatch(
    storeHtml,
    /(?:src|href)="\/(?:_next|cat|store|mewmuze-|pawpico-)/,
  );
}
assert.doesNotMatch(
  storeHtml,
  /Iron Man|Spider-Man|Captain America|Avengers|Naruto|Itachi|Mock buy|\$\d+\.\d{2}|Dummy total|USD/i,
);
assert.doesNotMatch(storeHtml, /\sdownload(?:=|\s|>)/i);

for (const file of [
  "../out/index.html",
  "../out/cat/mewmuze-hero-front-body-hd.png",
  "../out/cat/mewmuze-hero-front-head-hd.png",
  "../out/cat/mewmuze-face-logo-hd.png",
  "../out/cat/features/cursor.webp",
  "../out/cat/appearance/white-curious.webp",
  "../out/og-mewmuze.png",
  "../out/videos/desktop-physics.mp4",
  "../out/store/index.html",
  "../out/store/mecha-hero/index.html",
]) {
  assert.ok((await stat(new URL(file, import.meta.url))).size > 0, `${file} is empty`);
}

await assert.rejects(access(new URL("../out/store/products", import.meta.url)));
await assert.rejects(access(new URL("../out/store/samples", import.meta.url)));

console.log(`GitHub Pages export verified for ${basePath}`);

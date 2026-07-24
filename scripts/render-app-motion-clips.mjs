/**
 * Render three motion-only clips directly from PawPico's real sprite system.
 *
 * The application source is imported read-only and bundled into a temporary
 * browser page. No file in the application repository is created or changed.
 */

import { build } from "esbuild";
import { chromium } from "playwright-core";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const appRoot = process.env.PAWPICO_APP_ROOT?.replaceAll("\\", "/");
if (!appRoot) throw new Error("PAWPICO_APP_ROOT is required (read-only application source directory)");
const ffmpeg = process.env.FFMPEG_EXE;
if (!ffmpeg) throw new Error("FFMPEG_EXE is required");

const temp = await mkdtemp(join(tmpdir(), "pawpico-motion-"));
const entryPath = join(temp, "entry.ts");
const bundlePath = join(temp, "bundle.js");
const htmlPath = join(temp, "index.html");

const entry = `
import { ANIMATIONS } from "${appRoot}/src/animation/animationDefinitions.ts";
import {
  configureAppearance,
  DEFAULT_APPEARANCE,
  renderFrame,
} from "${appRoot}/src/animation/spriteLoader.ts";

configureAppearance({
  ...DEFAULT_APPEARANCE,
  furColor: "#a96216",
  eyeColor: "#66d943",
  earColor: "#e35b78",
});

const sequences = {
  gmail: [
    ["idle", 0, 2],
    ["wave", 2, 4],
    ["happy", 4, 7],
    ["idle", 7, 10],
  ],
  calendar: [
    ["sit", 0, 2.7],
    ["alarmClap", 2.7, 6.2],
    ["panic", 6.2, 9],
    ["sit", 9, 10],
  ],
  notices: [
    ["stretch", 0, 3.2],
    ["alarmClap", 3.2, 6.2],
    ["panic", 6.2, 9],
    ["sit", 9, 10],
  ],
};

const scene = new URLSearchParams(location.search).get("scene") || "gmail";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

function draw(t) {
  ctx.fillStyle = "#eadcc4";
  ctx.fillRect(0, 0, 720, 480);

  const segment = sequences[scene].find(([, start, end]) => t >= start && t < end) || sequences[scene].at(-1);
  const [name, start] = segment;
  const def = ANIMATIONS[name];
  const local = Math.max(0, t - start);
  const frame = def.frames[Math.floor(local * def.fps) % def.frames.length];
  const sprite = renderFrame(frame);
  const size = 310;
  ctx.drawImage(sprite, 360 - size / 2, 416 - size, size, size);
}

draw(0);
window.record = () => new Promise((resolve, reject) => {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 3_500_000 });
  const chunks = [];
  recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
  recorder.onerror = reject;
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = scene + "-motion.webm";
    document.body.append(anchor);
    anchor.click();
    resolve(true);
  };
  recorder.start();
  const start = performance.now();
  function tick(now) {
    const elapsed = Math.min(10, (now - start) / 1000);
    draw(elapsed);
    if (elapsed >= 10) recorder.stop();
    else requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
`;

const html = `<!doctype html>
<meta charset="utf-8">
<style>html,body{margin:0;background:#eadcc4}canvas{display:block;width:720px;height:480px;image-rendering:pixelated}</style>
<canvas width="720" height="480"></canvas>
<script src="./bundle.js"></script>`;

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited ${code}`)));
  });
}

try {
  await writeFile(entryPath, entry, "utf8");
  await writeFile(htmlPath, html, "utf8");
  await build({ entryPoints: [entryPath], outfile: bundlePath, bundle: true, format: "iife", platform: "browser" });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  try {
    for (const scene of ["gmail", "calendar", "notices"]) {
      const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 720, height: 480 } });
      const page = await context.newPage();
      await page.goto(`file:///${htmlPath.replaceAll("\\\\", "/")}?scene=${scene}`);
      const downloadPromise = page.waitForEvent("download");
      await page.evaluate(() => window.record());
      const download = await downloadPromise;
      const webm = join(temp, `${scene}.webm`);
      const mp4 = join(temp, `${scene}.mp4`);
      await download.saveAs(webm);
      await run(ffmpeg, [
        "-y", "-loglevel", "error", "-i", webm,
        "-c:v", "libx264", "-preset", "slow", "-crf", "18",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4,
      ]);
      const data = await readFile(mp4);
      await writeFile(new URL(`../public/videos/${scene}-motion.mp4`, import.meta.url), data);
      await context.close();
      console.log(`rendered ${scene}-motion.mp4 from the app sprite system`);
    }
  } finally {
    await browser.close();
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

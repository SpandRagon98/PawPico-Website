/**
 * Render transparent, high-native-resolution website assets from MewMuze's
 * authentic procedural desktop sprite system.
 *
 * The desktop application source is imported read-only into a temporary build.
 * Only files under this website's public/cat directory are created.
 */

import { build } from "esbuild";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const appRoot = process.env.PAWPICO_APP_ROOT;
if (!appRoot) {
  throw new Error("PAWPICO_APP_ROOT is required and is used read-only");
}

const runtimeModules = process.env.CODEX_RUNTIME_NODE_MODULES;
if (!runtimeModules) {
  throw new Error("CODEX_RUNTIME_NODE_MODULES is required for browser rendering");
}

const python = process.env.PYTHON_EXE ?? "python";
const repoRoot = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const publicCat = join(repoRoot, "public", "cat");
const helper = join(repoRoot, "scripts", "assemble-transparent-assets.py");
const tempRoot = await mkdtemp(join(tmpdir(), "mewmuze-web-assets-"));

const runtimeRequire = createRequire(join(runtimeModules, "package.json"));
const { chromium } = runtimeRequire("playwright");

const currentAppearance = {
  furColor: "#5a5b63",
  eyeColor: "#76df31",
  earColor: "#e06e91",
  pattern: "tuxedo",
  accessory: "flowerCrown",
  species: "classic",
  eyelashes: true,
  stroke: false,
  strokeColor: "#ffffff",
};

const featureSequences = {
  cursor: ["watch", "approach", "pounce"],
  petting: ["petted", "purr"],
  sleep: ["yawn", "sleep"],
  work: ["quickTools"],
  clipboard: ["clipboardNotice", "clipboardHold"],
  focus: ["typeKeys", "cuteNod"],
  pomodoro: ["think", "celebrate"],
  breaks: ["stretch", "drinkWater"],
  reminders: ["placard", "alarmClap"],
  gmail: ["wave", "happy"],
  calendar: ["alarmClap", "panic"],
  physics: ["balance", "jump", "softLand"],
  context: ["writeNotes", "typeKeys", "readBook"],
  music: ["danceBop"],
  microphone: ["sing", "bow"],
  appearance: ["lookAround", "happy"],
  personality: ["groom", "happy", "sad"],
  peek: ["edgePeek"],
  agent: ["think", "celebrate"],
  lightweight: ["idle", "blink"],
};

const appearanceShowcase = [
  {
    id: "white-grey-flower",
    label: "White & grey · Flower Band · curious",
    animation: "lookAround",
    appearance: currentAppearance,
  },
  {
    id: "orange-happy",
    label: "Orange · happy",
    animation: "happy",
    appearance: { ...currentAppearance, furColor: "#b86b22", pattern: "solid", accessory: "none" },
  },
  {
    id: "calico-wave",
    label: "Calico · wave",
    animation: "wave",
    appearance: { ...currentAppearance, furColor: "#d8d1c8", pattern: "calico", accessory: "none" },
  },
  {
    id: "tuxedo-placard",
    label: "Tuxedo · placard",
    animation: "placard",
    appearance: { ...currentAppearance, furColor: "#303139", pattern: "tuxedo", accessory: "bandana" },
  },
  {
    id: "tabby-groom",
    label: "Tabby · groom",
    animation: "groom",
    appearance: { ...currentAppearance, furColor: "#7b7269", pattern: "tabby", accessory: "none" },
  },
  {
    id: "fluffy-stretch",
    label: "Fluffy · stretch",
    animation: "stretch",
    appearance: { ...currentAppearance, species: "fluffy", accessory: "flowerCrown" },
  },
  {
    id: "kitten-yawn",
    label: "Kitten · yawn",
    animation: "yawn",
    appearance: { ...currentAppearance, species: "kitten", pattern: "bicolour", accessory: "none" },
  },
  {
    id: "siamese-celebrate",
    label: "Siamese · celebration",
    animation: "celebrate",
    appearance: {
      ...currentAppearance,
      furColor: "#5b463d",
      species: "siamese",
      pattern: "solid",
      accessory: "none",
    },
  },
];

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function prepareRenderer(art, pupilFree = false) {
  const target = join(tempRoot, `${art}-${pupilFree ? "pupil-free" : "complete"}`);
  await mkdir(target, { recursive: true });

  const sourceSpritePath = join(appRoot, "src", "animation", "spriteLoader.ts");
  const sourceAnimationsPath = join(appRoot, "src", "animation", "animationDefinitions.ts");
  let sprite = await readFile(sourceSpritePath, "utf8");
  sprite = sprite.replace(
    /export const ART = 128;/,
    `export const ART = ${art};`,
  );
  if (pupilFree) {
    sprite = sprite
      .replace('const EYE_PUPIL = "#0b1410";', "const EYE_PUPIL = EYE_MID;")
      .replace('const EYE_SHINE = "#ffffff";', 'const EYE_SHINE = "rgba(0,0,0,0)";');
  }
  if (!sprite.includes(`export const ART = ${art};`)) {
    throw new Error("Could not set the authentic renderer resolution");
  }

  await writeFile(join(target, "spriteLoader.ts"), sprite, "utf8");
  await writeFile(
    join(target, "animationDefinitions.ts"),
    await readFile(sourceAnimationsPath, "utf8"),
    "utf8",
  );

  const entry = `
import { ANIMATIONS } from "./animationDefinitions.ts";
import { configureAppearance, renderFrame } from "./spriteLoader.ts";

window.MewMuzeWebRender = {
  meta(name) {
    const animation = ANIMATIONS[name];
    if (!animation) throw new Error("Unknown authentic animation: " + name);
    return { fps: animation.fps, frameCount: animation.frames.length };
  },
  render({ name, frameIndex, appearance, tailPhase = 0, overrides = {} }) {
    configureAppearance(appearance);
    const animation = ANIMATIONS[name];
    if (!animation) throw new Error("Unknown authentic animation: " + name);
    const source = animation.frames[frameIndex % animation.frames.length];
    const canvas = renderFrame({ ...source, ...overrides, tailPhase });
    canvas.id = "asset";
    document.body.replaceChildren(canvas);
    return { width: canvas.width, height: canvas.height };
  },
};
`;
  await writeFile(join(target, "entry.ts"), entry, "utf8");
  await build({
    entryPoints: [join(target, "entry.ts")],
    outfile: join(target, "bundle.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
  });
  await writeFile(
    join(target, "index.html"),
    '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:transparent}canvas{display:block}</style><script src="./bundle.js"></script>',
    "utf8",
  );
  return join(target, "index.html");
}

async function openRenderer(browser, art, pupilFree = false) {
  const html = await prepareRenderer(art, pupilFree);
  const context = await browser.newContext({
    viewport: { width: art, height: art },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(pathToFileURL(html).href);
  return { context, page };
}

async function renderPng(page, output, options) {
  const dimensions = await page.evaluate(
    (renderOptions) => window.MewMuzeWebRender.render(renderOptions),
    options,
  );
  if (dimensions.width !== dimensions.height) {
    throw new Error("Authentic renderer returned an unexpected non-square canvas");
  }
  await mkdir(dirname(output), { recursive: true });
  await page.locator("#asset").screenshot({ path: output, omitBackground: true });
}

async function renderAnimation(page, id, animations, appearance, output) {
  const frames = join(tempRoot, "frames", id);
  await mkdir(frames, { recursive: true });
  const durations = [];
  let outputIndex = 0;

  for (const name of animations) {
    const meta = await page.evaluate(
      (animationName) => window.MewMuzeWebRender.meta(animationName),
      name,
    );
    for (let frameIndex = 0; frameIndex < meta.frameCount; frameIndex += 1) {
      await renderPng(
        page,
        join(frames, `${String(outputIndex).padStart(3, "0")}.png`),
        {
          name,
          frameIndex,
          appearance,
          tailPhase: (outputIndex * 5) % 40,
        },
      );
      durations.push(Math.max(70, Math.round(1000 / meta.fps)));
      outputIndex += 1;
    }
  }

  const durationsFile = join(frames, "durations.json");
  await writeFile(durationsFile, JSON.stringify(durations), "utf8");
  await run(python, [
    helper,
    "webp",
    "--frames",
    frames,
    "--durations",
    durationsFile,
    "--output",
    output,
  ]);
}

await mkdir(publicCat, { recursive: true });
const browser = await chromium.launch(
  process.env.BROWSER_EXE
    ? { executablePath: process.env.BROWSER_EXE, headless: true }
    : { channel: "msedge", headless: true },
);

try {
  const completeHero = await openRenderer(browser, 768, false);
  const pupilFreeHero = await openRenderer(browser, 768, true);
  const featureRenderer = await openRenderer(browser, 512, false);

  try {
    await renderPng(
      completeHero.page,
      join(publicCat, "mewmuze-hero-reference-hd.png"),
      {
        name: "edgePeek",
        frameIndex: 0,
        appearance: currentAppearance,
        overrides: { tail: "wrap" },
      },
    );
    await renderPng(
      pupilFreeHero.page,
      join(publicCat, "mewmuze-hero-peek-hd.png"),
      {
        name: "edgePeek",
        frameIndex: 0,
        appearance: currentAppearance,
        overrides: { tail: "wrap" },
      },
    );
    await renderPng(
      pupilFreeHero.page,
      join(publicCat, "mewmuze-hero-peek-hd-blink.png"),
      {
        name: "edgePeek",
        frameIndex: 2,
        appearance: currentAppearance,
        overrides: { tail: "wrap" },
      },
    );
    await renderPng(
      pupilFreeHero.page,
      join(publicCat, "mewmuze-hero-peek-hd-ears.png"),
      {
        name: "edgePeek",
        frameIndex: 3,
        appearance: currentAppearance,
        overrides: { tail: "wrap" },
      },
    );

    await run(python, [
      helper,
      "face",
      "--source",
      join(publicCat, "mewmuze-hero-reference-hd.png"),
      "--output-dir",
      publicCat,
    ]);

    for (const [id, animations] of Object.entries(featureSequences)) {
      await renderAnimation(
        featureRenderer.page,
        `feature-${id}`,
        animations,
        currentAppearance,
        join(publicCat, "features", `${id}.webp`),
      );
    }

    for (const preset of appearanceShowcase) {
      await renderAnimation(
        featureRenderer.page,
        `appearance-${preset.id}`,
        [preset.animation],
        preset.appearance,
        join(publicCat, "appearance", `${preset.id}.webp`),
      );
    }
  } finally {
    await completeHero.context.close();
    await pupilFreeHero.context.close();
    await featureRenderer.context.close();
  }
} finally {
  await browser.close();
  await rm(tempRoot, { recursive: true, force: true });
}

console.log("Rendered authentic high-density MewMuze website assets.");

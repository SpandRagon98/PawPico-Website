import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const isHostingerBuild = process.env.HOSTINGER_BUILD === "true";
const pagesEnvironment = {
  ...process.env,
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_BASE_PATH:
    isHostingerBuild
      ? ""
      : process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website",
};

for (const script of [
  "node_modules/next/dist/bin/next",
  "scripts/verify-pages-export.mjs",
]) {
  const args = script.includes("next") ? [script, "build"] : [script];
  const result = spawnSync(process.execPath, args, {
    cwd: repositoryRoot,
    env: pagesEnvironment,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

// Hostinger serves the static Next export and the tiny signed-webhook PHP
// endpoint from the same HTTPS origin. GitHub Pages intentionally receives
// only the static site, because it cannot execute PHP.
if (isHostingerBuild) {
  const apiTarget = fileURLToPath(new URL("../out/api/", import.meta.url));
  mkdirSync(apiTarget, { recursive: true });
  cpSync(fileURLToPath(new URL("../hostinger-api/", import.meta.url)), apiTarget, {
    recursive: true,
  });
}

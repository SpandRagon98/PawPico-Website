import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const pagesEnvironment = {
  ...process.env,
  GITHUB_PAGES: "true",
  NEXT_PUBLIC_BASE_PATH:
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/PawPico-Website",
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

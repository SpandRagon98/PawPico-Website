import { spawn } from "node:child_process";

const command = process.argv[2] ?? "dev";
const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(executable, ["vinext", command], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, WRANGLER_LOG_PATH: ".wrangler/wrangler.log" },
});

child.on("exit", (code) => process.exit(code ?? 1));

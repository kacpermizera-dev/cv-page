// Builds the interactive weather app from its repository and copies the output
// to public/demos/weather, so the portfolio can embed it from its own origin.
//
//   npm run demo:weather            -> latest commit of the default branch
//   npm run demo:weather -- <ref>   -> a specific branch, tag or commit

import { execSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const REPO = "https://github.com/kacpermizera-dev/interactive-weather-app.git";
const BASE = "/demos/weather/";
const OUT = resolve("public/demos/weather");
const ref = process.argv[2];

const work = mkdtempSync(join(tmpdir(), "weather-demo-"));
const run = (cmd, cwd = work) => execSync(cmd, { cwd, stdio: "inherit" });

try {
  run(`git clone --depth 1 ${ref ? `--branch ${ref} ` : ""}${REPO} app`);
  const app = join(work, "app");
  run("npm ci --no-audit --no-fund", app);
  run(`npx vite build --base=${BASE}`, app);

  rmSync(OUT, { recursive: true, force: true });
  cpSync(join(app, "dist"), OUT, { recursive: true });
  console.log(`\nWeather demo copied to ${OUT}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

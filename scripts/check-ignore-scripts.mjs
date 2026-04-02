#!/usr/bin/env node
/**
 * Ensures global package-manager settings do not disable lifecycle scripts.
 * Run with: node scripts/check-ignore-scripts.mjs
 * (Safe even when ignore-scripts is true — does not rely on npm/pnpm install hooks.)
 */
import { execSync } from "node:child_process";

function trimOut(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function tryExec(cmd) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return "";
  }
}

function hasCmd(name) {
  try {
    execSync(process.platform === "win32" ? `where ${name}` : `command -v ${name}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const problems = [];

if (hasCmd("pnpm")) {
  const v = trimOut(tryExec("pnpm config get ignore-scripts"));
  if (v === "true") {
    problems.push(
      "pnpm: global ignore-scripts is true. Unset with: pnpm config delete ignore-scripts (or set to false).",
    );
  }
}

if (hasCmd("npm")) {
  const v = trimOut(tryExec("npm config get ignore-scripts"));
  if (v === "true") {
    problems.push(
      "npm: global ignore-scripts is true. Unset with: npm config delete ignore-scripts (or npm config set ignore-scripts false).",
    );
  }
}

if (hasCmd("yarn")) {
  const ignore = trimOut(tryExec("yarn config get ignore-scripts"));
  if (ignore === "true") {
    problems.push(
      "yarn: global ignore-scripts is true. Adjust your .yarnrc / yarn config so lifecycle scripts can run.",
    );
  }
  const enableScripts = trimOut(tryExec("yarn config get enableScripts"));
  if (enableScripts === "false") {
    problems.push(
      "yarn: enableScripts is false (Yarn Berry). Enable lifecycle scripts for installs to work correctly.",
    );
  }
}

if (problems.length > 0) {
  console.error(
    "Package manager settings would skip install/lifecycle scripts (unsafe for this repo):\n",
  );
  for (const p of problems) {
    console.error(`  - ${p}`);
  }
  console.error(
    "\nThis project expects lifecycle scripts to run during installs. Fix the above, then retry.\n",
  );
  process.exit(1);
}

console.log("OK: pnpm/npm/yarn are not configured to ignore scripts globally.");

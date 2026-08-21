#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const name = "construction-technical-bid-project-understanding";
const source = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const homeIndex = args.indexOf("--codex-home");
if (homeIndex >= 0 && !args[homeIndex + 1]) {
  console.error("--codex-home requires a directory path.");
  process.exit(2);
}
const codexHome = homeIndex >= 0 ? path.resolve(args[homeIndex + 1]) : process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const target = path.join(codexHome, "skills", name);
const force = args.includes("--force");
const entries = ["SKILL.md", "agents", "assets", "evals", "references", "scripts"];

if (fs.existsSync(target)) {
  if (!force) {
    console.error(`Skill already exists: ${target}\nRun again with --force to replace it safely.`);
    process.exit(1);
  }
  const backup = `${target}.backup-${Date.now()}`;
  fs.renameSync(target, backup);
  console.log(`Existing skill backed up to: ${backup}`);
}

fs.mkdirSync(target, { recursive: true });
for (const entry of entries) {
  fs.cpSync(path.join(source, entry), path.join(target, entry), { recursive: true });
}
console.log(`Installed ${name} to: ${target}`);

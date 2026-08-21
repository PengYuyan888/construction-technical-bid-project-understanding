#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const name = "construction-technical-bid-project-understanding";
const source = path.resolve(__dirname, "..");
const version = require(path.join(source, "package.json")).version;
const args = process.argv.slice(2).filter((arg) => arg !== "--");
let force = false;
let customCodexHome;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") {
    force = true;
  } else if (arg === "--codex-home") {
    customCodexHome = args[index + 1];
    if (!customCodexHome) {
      console.error("--codex-home 后必须提供目录路径。");
      process.exit(2);
    }
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`安装 ${name}

用法：
  npx -y ${name}@latest
  npx -y ${name}@latest -- --force
  npx -y ${name}@latest -- --codex-home <目录>

参数：
  --force              备份并替换已安装版本
  --codex-home <目录>  指定 Codex 主目录
  --version            显示版本`);
    process.exit(0);
  } else if (arg === "--version" || arg === "-v") {
    console.log(version);
    process.exit(0);
  } else {
    console.error(`未知参数：${arg}。使用 --help 查看帮助。`);
    process.exit(2);
  }
}

const codexHome = customCodexHome ? path.resolve(customCodexHome) : process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
const target = path.join(codexHome, "skills", name);
const parent = path.dirname(target);
const entries = ["SKILL.md", "agents", "assets", "evals", "references", "scripts"];

if (fs.existsSync(target)) {
  if (!force) {
    console.error(`Skill already exists: ${target}\nRun again with --force to replace it safely.`);
    process.exit(1);
  }
}

function validateSkill(directory) {
  for (const entry of entries) {
    if (!fs.existsSync(path.join(directory, entry))) {
      throw new Error(`安装内容缺少：${entry}`);
    }
  }
  const skill = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
  if (!skill.includes(`name: ${name}`)) {
    throw new Error("SKILL.md 中的名称与安装目录不一致。");
  }
}

function copyEntry(from, to) {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const child of fs.readdirSync(from)) {
      copyEntry(path.join(from, child), path.join(to, child));
    }
  } else {
    fs.copyFileSync(from, to);
  }
}

fs.mkdirSync(parent, { recursive: true });
const staging = path.join(parent, `.${name}.tmp-${process.pid}-${Date.now()}`);
let backup;

try {
  fs.mkdirSync(staging);
  for (const entry of entries) {
    copyEntry(path.join(source, entry), path.join(staging, entry));
  }
  validateSkill(staging);

  if (fs.existsSync(target)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    backup = `${target}.backup-${timestamp}`;
    fs.renameSync(target, backup);
  }

  fs.renameSync(staging, target);
  validateSkill(target);
  if (backup) {
    console.log(`旧版本已备份到：${backup}`);
  }
  console.log(`已安装 ${name}@${version}：${target}`);
} catch (error) {
  if (fs.existsSync(staging)) {
    fs.rmSync(staging, { recursive: true, force: true });
  }
  if (backup && fs.existsSync(backup)) {
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    fs.renameSync(backup, target);
  }
  console.error(`安装失败：${error.message}`);
  process.exit(1);
}

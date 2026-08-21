#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const name = "construction-technical-bid-project-understanding";
const source = path.resolve(__dirname, "..");
const version = require(path.join(source, "package.json")).version;
const entries = ["SKILL.md", "LICENSE", "agents", "assets", "evals", "references", "scripts"];
const userHome = os.homedir();
const agentHomes = {
  universal: () => path.join(userHome, ".agents"),
  codex: () => process.env.CODEX_HOME || path.join(userHome, ".codex"),
  "claude-code": () => path.join(userHome, ".claude"),
  cursor: () => path.join(userHome, ".cursor"),
  "gemini-cli": () => path.join(userHome, ".gemini"),
  "github-copilot": () => path.join(userHome, ".copilot"),
};
const aliases = {
  claude: "claude-code",
  gemini: "gemini-cli",
  copilot: "github-copilot",
  "openai-codex": "codex",
};

const args = process.argv.slice(2).filter((arg) => arg !== "--");
let agent = "universal";
let allDetected = false;
let customCodexHome;
let customTarget;
let dryRun = false;
let force = false;
let projectRoot = process.cwd();
let scope = "user";
let agentWasSet = false;

function nextValue(index, option) {
  const value = args[index + 1];
  if (!value) {
    console.error(`${option} 后必须提供参数。`);
    process.exit(2);
  }
  return value;
}

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--force") {
    force = true;
  } else if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--all-detected") {
    allDetected = true;
  } else if (arg === "--agent") {
    agent = nextValue(index, arg);
    agentWasSet = true;
    index += 1;
  } else if (arg === "--scope") {
    scope = nextValue(index, arg);
    index += 1;
  } else if (arg === "--target") {
    customTarget = nextValue(index, arg);
    index += 1;
  } else if (arg === "--project-root") {
    projectRoot = path.resolve(nextValue(index, arg));
    index += 1;
  } else if (arg === "--codex-home") {
    customCodexHome = nextValue(index, arg);
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`安装 ${name}

用法：
  npx -y ${name}@latest
  npx -y ${name}@latest -- --agent codex
  npx -y ${name}@latest -- --scope project
  npx -y ${name}@latest -- --target <技能目录>
  npx -y ${name}@latest -- --all-detected --force

参数：
  --agent <名称>       universal、codex、claude-code、cursor、gemini-cli 或 github-copilot
  --scope <范围>       user（默认）或 project
  --target <目录>      指定 skills 父目录，安装器会在其下创建同名 Skill
  --project-root <目录> 指定 project 范围的项目根目录，默认当前目录
  --all-detected       安装到已检测到的受支持客户端；未检测到时使用 universal
  --force              备份并替换已安装版本
  --dry-run            只显示目标目录，不写入文件
  --codex-home <目录>  兼容 1.0.x 的 Codex 安装参数
  --version            显示版本

其他 Agent 请优先使用 GitHub CLI 的 gh skill install，或用 --target 指定其技能目录。`);
    process.exit(0);
  } else if (arg === "--version" || arg === "-v") {
    console.log(version);
    process.exit(0);
  } else {
    console.error(`未知参数：${arg}。使用 --help 查看帮助。`);
    process.exit(2);
  }
}

agent = agent.toLowerCase();
scope = scope.toLowerCase();
agent = aliases[agent] || agent;
if (!agentHomes[agent]) {
  console.error(`npm 安装器不认识 Agent：${agent}。请改用 --target，或使用 gh skill install。`);
  process.exit(2);
}
if (!new Set(["user", "project"]).has(scope)) {
  console.error("--scope 只能是 user 或 project。");
  process.exit(2);
}
if (allDetected && (agentWasSet || customTarget || customCodexHome)) {
  console.error("--all-detected 不能与 --agent、--target 或 --codex-home 同时使用。");
  process.exit(2);
}
if (customTarget && (agentWasSet || customCodexHome)) {
  console.error("--target 不能与 --agent 或 --codex-home 同时使用。");
  process.exit(2);
}
if (customCodexHome && scope !== "user") {
  console.error("--codex-home 只能用于 user 范围。");
  process.exit(2);
}

function targetFor(selectedAgent) {
  if (customTarget) return path.join(path.resolve(customTarget), name);
  if (customCodexHome) return path.join(path.resolve(customCodexHome), "skills", name);
  if (scope === "project") return path.join(projectRoot, ".agents", "skills", name);
  return path.join(agentHomes[selectedAgent](), "skills", name);
}

function selectedTargets() {
  if (!allDetected) {
    if (customTarget) return [{ agent: "custom", target: targetFor(agent) }];
    if (customCodexHome) return [{ agent: "codex", target: targetFor("codex") }];
    return [{ agent, target: targetFor(agent) }];
  }
  if (scope === "project") return [{ agent: "universal", target: targetFor("universal") }];

  const detected = Object.keys(agentHomes)
    .filter((candidate) => fs.existsSync(agentHomes[candidate]()))
    .map((candidate) => ({ agent: candidate, target: targetFor(candidate) }));
  if (!detected.length) detected.push({ agent: "universal", target: targetFor("universal") });

  const seen = new Set();
  return detected.filter((item) => {
    const key = process.platform === "win32" ? item.target.toLowerCase() : item.target;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function validateSkill(directory) {
  for (const entry of entries) {
    if (!fs.existsSync(path.join(directory, entry))) throw new Error(`安装内容缺少：${entry}`);
  }
  const skill = fs.readFileSync(path.join(directory, "SKILL.md"), "utf8");
  if (!new RegExp(`^name:\\s*${name}\\s*$`, "m").test(skill)) {
    throw new Error("SKILL.md 中的名称与安装目录不一致。");
  }
  const escapedVersion = version.replaceAll(".", "\\.");
  if (!new RegExp(`^\\s*version:\\s*[\"']?${escapedVersion}[\"']?\\s*$`, "m").test(skill)) {
    throw new Error("SKILL.md 与 npm 包版本不一致。");
  }
}

function copyEntry(from, to) {
  if (fs.statSync(from).isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const child of fs.readdirSync(from)) copyEntry(path.join(from, child), path.join(to, child));
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

const targets = selectedTargets();
if (dryRun) {
  for (const item of targets) console.log(`${item.agent}: ${item.target}`);
  process.exit(0);
}

const existing = targets.filter((item) => fs.existsSync(item.target));
if (existing.length && !force) {
  for (const item of existing) console.error(`Skill already exists: ${item.target}`);
  console.error("使用 --force 备份并替换现有版本。");
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupHome = process.env.AGENT_SKILL_BACKUP_HOME || path.join(userHome, ".agent-skill-backups");
const backupRoot = path.join(path.resolve(backupHome), name);
const completed = [];

function restore(record) {
  if (fs.existsSync(record.target)) fs.rmSync(record.target, { recursive: true, force: true });
  if (record.backup) copyEntry(record.backup, record.target);
}

function installOne(item, index) {
  const parent = path.dirname(item.target);
  const staging = path.join(parent, `.${name}.tmp-${process.pid}-${Date.now()}-${index}`);
  let backup;
  let targetChanged = false;
  fs.mkdirSync(parent, { recursive: true });

  try {
    fs.mkdirSync(staging);
    for (const entry of entries) copyEntry(path.join(source, entry), path.join(staging, entry));
    validateSkill(staging);

    if (fs.existsSync(item.target)) {
      fs.mkdirSync(backupRoot, { recursive: true });
      backup = path.join(backupRoot, `${timestamp}-${String(index + 1).padStart(2, "0")}`);
      copyEntry(item.target, backup);
      targetChanged = true;
      fs.rmSync(item.target, { recursive: true, force: true });
    }

    fs.renameSync(staging, item.target);
    targetChanged = true;
    validateSkill(item.target);
    return { ...item, backup };
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true, force: true });
    if (targetChanged) restore({ target: item.target, backup });
    throw error;
  }
}

try {
  targets.forEach((item, index) => completed.push(installOne(item, index)));
  for (const item of completed) {
    if (item.backup) console.log(`旧版本已备份到：${item.backup}`);
    console.log(`已为 ${item.agent} 安装 ${name}@${version}：${item.target}`);
  }
} catch (error) {
  for (const record of completed.reverse()) restore(record);
  console.error(`安装失败，已回滚本次安装：${error.message}`);
  process.exit(1);
}

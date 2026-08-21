# construction-technical-bid-project-understanding

这是一个遵循 [Agent Skills 开放规范](https://agentskills.io/specification)的建筑工程技术标技能，用于依据招标文件、澄清答疑、工程量清单、施工图、勘察资料、现场资料、参考标书和 Word 模板，编制或修改“项目认识／工程概况”类章节。

技能主要面向新建住宅、公共建筑、商业综合体、学校、医院、场馆、工业厂房等项目，也兼容改扩建、修缮和城市更新工程。章节名称不必固定为“对项目拟建工程现状的了解与认识”，只要任务实质包含项目定位、建设意义、工程概况、设计概况、项目特点、施工现场现状或周边环境，即可使用。

## 跨 Agent 兼容说明

本项目把“适配所有 Agent”定义为以下三个层级：

| 兼容层级 | 使用方式 | 能力范围 |
|---|---|---|
| 原生 Agent Skills 客户端 | 安装到客户端识别的技能目录 | 可按技能描述自动发现和触发 |
| 能读取文件但不支持 Agent Skills 的客户端 | 上传或挂载技能目录，并使用 `agents/generic-prompt.md` | 可手动遵循技能流程，不能保证自动触发 |
| 不能读取文件、不能添加长提示词或缺少文档工具的客户端 | 无法完整运行 | 只能复制部分规则使用，不能声称已完成文件读取、Word 生成或渲染 |

技能核心不绑定 Codex、Claude、Gemini 或其他特定模型。`agents/openai.yaml` 只是 OpenAI／Codex 的可选界面配置，其他客户端可以忽略。不同客户端的文件读取、DOCX、PDF、OCR、图纸识读、渲染和作图能力不同；安装成功不等于具备全部工具能力。

GitHub CLI 的 [`gh skill install`](https://cli.github.com/manual/gh_skill_install) 已支持 Codex、Claude Code、Cursor、Gemini CLI、GitHub Copilot、Cline、Roo Code、OpenCode、OpenHands、Warp 等多种 Agent，并负责选择相应安装目录，因此这是推荐的跨 Agent 安装方式。

## 主要能力

- 盘点并区分招标文件、施工图、清单、勘察资料、格式模板和参考标书；
- 建立内部事实台账，记录项目名称、范围、规模、参数、材料和做法的来源；
- 识别文件版本、专业口径和数据冲突，不擅自取值或补齐缺失数据；
- 根据项目类型选择新建或改造分支，按建筑、结构、机电、室外和专项工程展开；
- 使用表格和工程行业语言编写内容，减少空泛套话、含糊引用和不完整句子；
- 有模板时严格沿用，无模板时先征得用户授权；
- 在开始阶段确认是否需要作图；模型作图时先提交一张代表性样图；
- 先提交编写或修改计划，只有用户明确确认后才生成或修改 Word；
- 对 Word 成品进行渲染、表格段落、批注、修订痕迹和局部修改差异检查。

## 适用场景

### 新建工程

- 住宅及配套、人才房、保障房；
- 办公楼、商业综合体和公共建筑；
- 学校、医院、文化体育场馆；
- 工业厂房、仓储物流和产业园；
- 高层、超高层、地下室及深基坑工程。

### 改扩建和修缮工程

- 既有建筑改扩建、功能调整和结构加固；
- 老旧小区、公共建筑和工业设施修缮；
- 屋面、外墙、公共部位和附属设施改造；
- 既有机电系统、室外管网、道路和园林改造。

### 典型任务表达

- “根据招标文件和全套图纸编写技术标第一章项目总体认识。”
- “把住宅项目的工程概况按建筑、结构、机电和室外工程展开。”
- “参考我提供的技术标写法，按现有 Word 模板编制项目概况。”
- “修改现状认识章节，保持表格和版式不变，只调整指定内容。”

## 不适用的任务

- 单独编制施工组织设计、专项施工方案或应急预案；
- 编制商务标、投标报价、成本测算或合同索赔文件；
- 只读取、OCR 或摘要某一份 PDF／设计说明；
- 只进行 Word 排版、图片编辑或图纸深化，不编写项目认识类内容；
- 在缺少项目资料时要求凭经验生成具体工程参数。

## 安装

### 方式一：使用 GitHub CLI 安装到任意受支持 Agent（推荐）

下面命令中的 `--agent` 可替换为目标客户端名称：

```powershell
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent codex --scope user
```

常用示例：

```powershell
# Claude Code
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent claude-code --scope user

# Cursor
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent cursor --scope user

# Gemini CLI
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent gemini-cli --scope user

# GitHub Copilot
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent github-copilot --scope user

# 通用 Agent Skills 目录
gh skill install PengYuyan888/construction-technical-bid-project-understanding SKILL.md --agent universal --scope user
```

将 `--scope user` 改为 `--scope project`，可只为当前项目安装。全部受支持的 `--agent` 名称以 [`gh skill install` 官方说明](https://cli.github.com/manual/gh_skill_install)为准；新增 Agent 通常不需要修改本技能仓库。

### 方式二：使用 npm 安装器

安装最新版到通用用户目录 `~/.agents/skills/`：

```powershell
npx -y construction-technical-bid-project-understanding@latest
```

安装到常用客户端的用户目录：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --agent codex
npx -y construction-technical-bid-project-understanding@latest -- --agent claude-code
npx -y construction-technical-bid-project-understanding@latest -- --agent cursor
npx -y construction-technical-bid-project-understanding@latest -- --agent gemini-cli
npx -y construction-technical-bid-project-understanding@latest -- --agent github-copilot
```

npm 安装器只内置少量已核实的常用目录。其他 Agent 使用 `gh skill install`，或者指定该客户端的 `skills` 父目录：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --target "D:\Agent\skills"
```

只为当前项目安装到 `.agents/skills/`：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --scope project
```

安装到本机已检测到的常用客户端：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --all-detected
```

安装前查看目标目录而不写入文件：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --all-detected --dry-run
```

### 方式三：使用 Gemini CLI 原生命令

[Gemini CLI](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/using-agent-skills.md) 可以直接从 GitHub 仓库安装：

```powershell
gemini skills install https://github.com/PengYuyan888/construction-technical-bid-project-understanding
```

### 方式四：手动安装或手动加载

支持 Agent Skills 的客户端可将完整仓库复制到其用户级或项目级技能目录，目录中必须保留 `SKILL.md`、`references/`、`scripts/`、`assets/` 和 `agents/` 的相对关系。

不支持 Agent Skills、但能够读取文件的客户端，可上传完整目录，并把 [通用手动加载提示词](agents/generic-prompt.md)发送给代理。该方式不保证自动发现和自动触发。

## 更新、备份和卸载

使用 GitHub CLI 安装的版本可通过 `gh skill update` 更新。使用 npm 安装器更新时执行：

```powershell
npx -y construction-technical-bid-project-understanding@latest -- --agent codex --force
```

`--force` 会先复制旧版本，再启用新版本。备份统一保存在用户目录下：

```text
~/.agent-skill-backups/construction-technical-bid-project-understanding/
```

备份不会放在 `.codex/skills`、`.agents/skills` 等扫描目录内，避免同名备份被 Agent 识别为第二个技能。安装失败时，安装器会恢复原版本；批量安装中途失败时，会回滚本次已经完成的目标。

卸载时可使用对应客户端或 `gh skill` 的卸载命令，也可以删除目标 `skills` 目录下的同名文件夹。删除前应确认路径准确。

## 使用方法

安装后可以直接描述任务，例如：

```text
请使用 construction-technical-bid-project-understanding，依据本项目招标文件、图纸和 Word 模板编制技术标中的项目总体认识与工程概况。先核查资料并提交编写计划，我确认后再生成 Word。
```

支持自动触发的 Agent 会根据 `SKILL.md` 中的名称和描述判断是否加载技能。`$construction-technical-bid-project-understanding` 等显式调用语法属于部分客户端的界面能力，不是 Agent Skills 统一语法。

### 示例一：新建学校项目

```text
根据“招标文件”“图纸”和“投标模板”编写新建学校技术标中的项目总体认识和工程概况，需要从总平面图提取两张图片。
```

### 示例二：工业厂房项目

```text
重点梳理厂房的生产功能、结构体系、吊车荷载、动力介质、室外管网和物流条件，先给我编写计划，确认后再生成 Word。
```

### 示例三：改造项目局部修改

```text
修改现有 Word 中的项目概况表，把省略主语的句子改完整，表格内分点改为真正的 Word 段落，其他文字和格式不动。
```

## 使用前准备

建议把下列资料放在命名清晰的项目目录中：

1. 招标公告、招标文件、合同条件、补充通知和答疑；
2. 工程量清单、招标范围和专业责任划分；
3. 建筑、结构、给排水、消防、电气、暖通、园林、道路和基坑等施工图；
4. 岩土勘察、测绘、既有管线、现场照片和踏勘资料；
5. Word 模板、章节大纲、格式要求、表格示例和图片示例；
6. 参考技术标。参考标书只用于学习结构、深度和表达方式，不作为当前项目事实来源。

## 具体工作流程

### 1. 开始确认

技能首先确认是否需要图片、图片采用模型制作／图纸提取／占位符中的哪种方式，以及是否有必须沿用的 Word 模板。没有模板时，只有用户明确授权才会使用内置备用模板。

### 2. 资料盘点

检查文件能否读取，区分招标资料、设计资料、现场资料、格式模板和参考标书，并确认各文件版本和适用范围。

### 3. 事实核查

为项目名称、地点、建设单位、规模、范围、工期、质量目标、材料、构造和系统参数建立内部事实台账。数据冲突时列明双方来源和影响，不自行选择。

### 4. 项目类型和章节映射

判断项目属于新建、改扩建、修缮还是混合工程，再把用户现有章节名称映射到项目定位、建设意义、工程概况、设计概况、特点和现状等功能模块。标题是否调整，以用户模板、大纲和授权为准。

### 5. 提交计划并等待确认

在生成或修改 Word 前，先提交具体的编写／修改计划，包括资料范围、章节安排、表格和图片设置、事实冲突、格式处理及交付文件名。用户没有明确确认计划时，不生成或修改 Word；此阶段仍可继续进行只读核查和问题汇总。

### 6. 编写和排版

确认后按事实台账编写内容。项目概况优先采用表格，项目定位、建设意义和特点采用适量文字。表格句子保持完整，具体做法写清部位、对象、材料、动作和参数含义。

### 7. Word 核验和交付

渲染全部页面，检查标题层级、表格跨页、图片清晰度、空白页、批注和修订痕迹。表格内的多个列点使用独立 Word 段落，不使用 Shift+Enter 手动换行或可见的 `^p` 字符。用户要求“其他内容不动”时，只修改指定段落、单元格或图片对象，并比较修改前后的 Word 包部件。

## 事实和资料使用范围

- 项目名称、范围、规模、工期和目标以当前项目有效招标资料为准；
- 建筑、结构和机电做法以相应专业有效施工图为准；
- 地质、水文、周边建构筑物和地下管线以勘察、测绘和现场资料为准；
- 工程量清单可用于判断单位工程构成和数量，但不能代替施工图完整做法；
- 通用规范参数不能写成本项目设计参数；
- 参考标书的项目名称、地点、规模、参数、做法和承诺不得写入当前项目；
- 资料缺失时不凭经验补齐关键数据；资料冲突时等待用户裁定。

## Word、表格和图片规则

- 有用户模板时严格沿用页面、样式、标题、表格、页眉页脚和题注；
- 没有模板时先询问，用户授权后才能使用内置模板；
- 表格内容可详细，但句子必须完整，不能省略部位、对象或参数用途；
- 不使用“按图施工”“详相应大样”等无法独立阅读的含糊表达；
- 是否增加、删除或调整标题，以用户授权为准；未获得授权时保留现有结构；
- 模型制作图片时先提交一张样图；无法识图或作图时如实说明并使用占位符；
- 多代理可用于并行读取大量资料，但只能由一名汇总者统一事实，由一名编辑者处理最终 Word。

## 使用范围

本技能负责把项目资料转换成技术标项目认识类内容，不代替设计复核、图纸会审、现场探测、工程量核算和执业人员审签。输出内容仍应由投标编制人员结合最新招标补遗、现场情况及企业承诺进行最终审核。

技能不会因为用户要求“内容丰富”而虚构面积、栋数、户数、工期、结构参数、绿色等级、奖项目标或示范地位。项目定位和建设意义可以在事实基础上提升表达，但不能创造新的客观事实。

## 运行条件

- 目标 Agent 能读取当前项目文件；
- 使用 npm 安装器时需要 Node.js 16.7 或更高版本；
- 运行 `scripts/` 中的检查工具时需要 Python 3.10 或更高版本；
- 生成或修改 Word 时，运行环境需要具备 DOCX 创建和渲染能力；
- PDF、扫描图、DWG 等文件能否直接识读，取决于当前 Agent 和可用工具。能力不足时应说明限制，并采用 OCR、转换、截图或占位符等可行方式。

## 项目结构

```text
SKILL.md                  通用 Agent Skills 入口、主流程和使用规则
agents/openai.yaml        OpenAI／Codex 可选界面配置
agents/generic-prompt.md  不支持 Agent Skills 时的手动加载提示词
references/               资料、写作、项目类型和专业检查规则
scripts/                  资料盘点、事实台账和 DOCX 检查工具
assets/                   内置备用 Word 模板和事实台账模板
evals/                    行为测试和触发边界测试
bin/install.cjs           npm 跨 Agent 备用安装器
```

## 开发和验证

```powershell
node --check bin\install.cjs
node bin\install.cjs --dry-run
npm pack --dry-run
```

GitHub 自动检查会验证 Agent Skills 元数据、版本一致性、JSON 测试文件、安装器语法、npm 打包内容、通用安装、客户端目录安装、更新备份和项目级安装结果。

## 问题反馈

如发现资料冲突处理、Word 格式保持、安装更新或特定工程类型支持方面的问题，请在 [GitHub Issues](https://github.com/PengYuyan888/construction-technical-bid-project-understanding/issues) 提交问题。

## 许可证

本项目采用 MIT License，详见 [LICENSE](LICENSE)。

# construction-technical-bid-project-understanding

面向建筑工程技术标“项目认识／工程概况”类章节的 Codex Skill，主要支持新建项目，也兼容改扩建、修缮和城市更新项目。

## 安装

```powershell
npx construction-technical-bid-project-understanding
```

安装程序会把 Skill 复制到 `%CODEX_HOME%\skills`；未设置 `CODEX_HOME` 时复制到用户目录下的 `.codex\skills`。目标已存在时不会覆盖；如需更新，可增加 `--force`，原目录会先改名备份。

## 使用

```text
$construction-technical-bid-project-understanding
```

Skill 会先确认图片和 Word 模板要求，盘点招标文件、图纸及其他资料，提交编写或修改计划；只有用户确认后才会生成或修改 Word。

## 许可

本包当前未授予开源许可证。未经权利人另行许可，不得复制、修改或再分发。

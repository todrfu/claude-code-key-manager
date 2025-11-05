## cc-key.sh 使用说明

### 概述

`cc-key.sh` 是一个统一的 Claude API Key 管理与切换脚本，支持 `list`、`add`、`current`、`remove`、`use` 五个子命令。

依赖与存储：
- 依赖：`bash`、`python3`、同目录的 `json-helper.py`
- 存储：`~/.claude/claude-api-project-keys.json`
- 切换：更新 `~/.claude/settings.json` 的 `env` 中 `ANTHROPIC_AUTH_TOKEN` 与可选 `ANTHROPIC_BASE_URL`

### 安装

```bash
chmod +x ./cc-key.sh
```

### 基本用法

```bash
# 列出所有 Key（掩码显示，标注默认）
./cc-key.sh list

# 交互式添加 Key（名称、Key、Base URL、备注）
./cc-key.sh add

# 查看当前默认 Key 信息
./cc-key.sh current

# 删除指定 Key
./cc-key.sh remove <name>

# 切换到指定或默认 Key，并更新 ~/.claude/settings.json
./cc-key.sh use [name]
```

### 注意事项

- 首次运行会在家目录创建 `~/.claude/claude-api-project-keys.json`（权限 600）。
- 执行 `use` 时会自动备份 `~/.claude/settings.json` 为 `settings.json.backup`。
- 切换后需退出并重启 `claude` 命令使配置生效。



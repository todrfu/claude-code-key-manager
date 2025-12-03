# CCK - Claude Code Key Manager

> 轻松管理多个 Anthropic API 密钥并启动 Claude CLI。

## 特性

- 🔐 **安全的密钥管理** - 安全存储多个 API 密钥
- 🎯 **智能选择** - 使用 fzf 或备用 UI 进行交互式密钥选择
- 🚀 **无缝 CLI 启动** - 透明的 Claude CLI 集成
- 💾 **智能缓存** - 记住最后使用的密钥
- 🎨 **美观的界面** - 彩色、直观的命令行界面
- ⚙️ **可配置** - 通过 `~/.cckrc` 自定义行为

## 安装

```bash
npm install -g @todrfu/cck
```

或使用 pnpm：

```bash
pnpm add -g @todrfu/cck
```

## 快速开始

```bash
# 添加你的第一个 API 密钥
cck add

# 启动 Claude CLI（交互式密钥选择）
cck

# 列出所有密钥
cck list
```

## 使用说明

### 管理命令

```bash
# 列出所有 API 密钥
cck list
cck ls

cck list -f # 显示完整密钥，请注意保护隐私

# 添加新的 API 密钥
cck add

# 删除 API 密钥
cck remove <key-name>
cck rm <key-name>

# 显示当前默认密钥
cck current

# 切换默认密钥
cck use <key-name>

# 显示帮助
cck help
```

### 启动 Claude CLI

```bash
# 交互式密钥选择
cck

# 使用默认密钥
cck --use-default

# 使用指定密钥
cck --key <key-name>

# 传递参数给 Claude CLI
cck -r                    # 重置会话
cck --verbose             # 详细输出
cck -r --verbose          # 组合参数

# 混合 CCK 和 Claude 选项
cck --key prod -r --verbose
```

## 配置

创建 `~/.cckrc` 文件来自定义行为：

```json
{
  "version": "1.0.0",
  "keysFile": "~/.cck/keys.json",
  "cacheFile": "~/.cck/cache",
  "logLevel": "info",
  "selector": {
    "type": "fzf",
    "fallback": "builtin"
  },
  "display": {
    "colorEnabled": true
  }
}
```
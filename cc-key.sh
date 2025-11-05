#!/usr/bin/env bash
#
# cc-key.sh - 统一的 Claude API Key 管理与切换脚本
#
# 子命令：
#   - list               列出所有 Key（掩码显示，标注默认）
#   - add                交互式添加 Key（名称、Key、Base URL、备注）
#   - current            显示当前默认 Key 信息
#   - remove <name>      删除指定名称的 Key
#   - use [name]         切换到指定 Key（未提供则使用默认），并更新 ~/.claude/settings.json
#
# 存储：~/.claude/claude-api-project-keys.json
# 依赖：python3、同目录下 json-helper.py

set -euo pipefail

KEYS_FILE="$HOME/.claude/claude-api-project-keys.json"
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JSON_HELPER="$SCRIPT_DIR/json-helper.py"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

die() { echo -e "${RED}错误:${NC} $*" >&2; exit 1; }

mask_key() {
  local k="$1"
  local len=${#k}
  if (( len <= 12 )); then
    printf '%s' "$k"
  else
    printf '%s…%s' "${k:0:8}" "${k: -4}"
  fi
}

get_beijing_time() {
  TZ='Asia/Shanghai' date '+%Y-%m-%dT%H:%M:%S+08:00'
}

check_dependencies() {
  command -v python3 >/dev/null 2>&1 || die "未安装 python3"
  [ -f "$JSON_HELPER" ] || die "未找到 json-helper.py，期望位置: $JSON_HELPER"
}

init_storage_if_needed() {
  if [ ! -f "$KEYS_FILE" ]; then
    cat >"$KEYS_FILE" <<'JSON'
{
  "version": 1,
  "keys": [],
  "default": ""
}
JSON
    chmod 600 "$KEYS_FILE" || true
    echo -e "${GREEN}已创建存储文件:${NC} $KEYS_FILE"
  fi
}

validate_json() {
  python3 "$JSON_HELPER" validate "$KEYS_FILE" >/dev/null 2>&1 || die "$KEYS_FILE 格式损坏"
}

show_usage() {
  cat <<EOF
${BLUE}cc-key - Claude API Key 管理工具${NC}

用法:
  $(basename "$0") <command> [args]

命令:
  ${GREEN}list${NC}                 列出所有 Key
  ${GREEN}add${NC}                  交互式添加 Key
  ${GREEN}current${NC}              显示当前默认 Key
  ${GREEN}remove${NC} <name>        删除指定 Key
  ${GREEN}use${NC} [name]           切换到指定/默认 Key 并更新 ~/.claude/settings.json
  ${GREEN}help${NC}                 显示帮助
EOF
}

cmd_add() {
  echo -e "${BLUE}=== 添加新的 API Key ===${NC}\n"

  read -p "请输入 Key 名称（如: project-x）: " key_name
  [ -n "$key_name" ] || die "Key 名称不能为空"

  existing_key_json=$(python3 "$JSON_HELPER" find "$KEYS_FILE" .keys name "$key_name" 2>/dev/null || echo "")
  if [ -n "$existing_key_json" ] && [ "$existing_key_json" != "null" ]; then
    existing_key=$(echo "$existing_key_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('key',''))")
    masked=$(mask_key "$existing_key")
    echo -e "${YELLOW}警告:${NC} Key '$key_name' 已存在 ($masked)"
    read -p "是否覆盖？[y/N] " -n 1 -r; echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "已取消"; exit 0
    fi
    python3 "$JSON_HELPER" remove "$KEYS_FILE" .keys name "$key_name"
  fi

  read -p "请输入 API Key: " api_key
  [ -n "$api_key" ] || die "API Key 不能为空"

  read -p "请输入 Base URL（可选，如: https://api.anthropic.com）: " base_url
  read -p "请输入描述信息（可选）: " note

  timestamp=$(get_beijing_time)
  new_key_json=$(python3 - <<PY
import json
print(json.dumps({
  'name': '''$key_name''',
  'key': '''$api_key''',
  'baseUrl': '''$base_url''',
  'createdAt': '''$timestamp''',
  'note': '''$note'''
}))
PY
)
  python3 "$JSON_HELPER" add "$KEYS_FILE" .keys "$new_key_json"

  key_count=$(python3 "$JSON_HELPER" length "$KEYS_FILE" .keys)
  if [ "$key_count" -eq 1 ]; then
    python3 "$JSON_HELPER" set "$KEYS_FILE" .default "$key_name"
    echo -e "${GREEN}已自动设为默认 Key${NC}"
  fi

  echo -e "\n${GREEN}✓ 成功添加 Key:${NC} $key_name"
  echo "  Key: $(mask_key "$api_key")"
  echo "  Base URL: ${base_url:-（无）}"
  echo "  描述: ${note:-（无）}"
  echo "  创建时间: $timestamp"
}

cmd_remove() {
  local key_name="${1:-}"
  [ -n "$key_name" ] || die "请指定要删除的 Key 名称。用法: $(basename "$0") remove <name>"

  existing_key_json=$(python3 "$JSON_HELPER" find "$KEYS_FILE" .keys name "$key_name" 2>/dev/null || echo "")
  if [ -z "$existing_key_json" ] || [ "$existing_key_json" = "null" ]; then
    die "Key '$key_name' 不存在"
  fi

  existing_key=$(echo "$existing_key_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('key',''))")
  echo -e "${YELLOW}将要删除 Key:${NC} $key_name ($(mask_key "$existing_key"))"
  read -p "确认删除？[y/N] " -n 1 -r; echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then echo "已取消"; exit 0; fi

  python3 "$JSON_HELPER" remove "$KEYS_FILE" .keys name "$key_name"

  current_default=$(python3 "$JSON_HELPER" get "$KEYS_FILE" .default 2>/dev/null || echo "")
  if [ "$current_default" = "$key_name" ]; then
    python3 "$JSON_HELPER" set "$KEYS_FILE" .default ""
    echo -e "${YELLOW}已清除默认 Key 设置${NC}"
  fi

  echo -e "${GREEN}✓ 成功删除 Key:${NC} $key_name"
}

cmd_list() {
  key_count=$(python3 "$JSON_HELPER" length "$KEYS_FILE" .keys)
  echo -e "${BLUE}=== API Key 列表 ===${NC}\n"
  if [ "$key_count" -eq 0 ]; then
    echo "（无 Key）\n使用 '$(basename "$0") add' 添加新的 Key"
    exit 0
  fi

  current_default=$(python3 "$JSON_HELPER" get "$KEYS_FILE" .default 2>/dev/null || echo "")
  printf "%-20s %-30s %-40s %-30s %s\n" "名称" "Key（掩码）" "Base URL" "描述" "状态"
  printf "%-20s %-30s %-40s %-30s %s\n" "----" "----------" "--------" "----" "----"
  python3 "$JSON_HELPER" list-array "$KEYS_FILE" .keys name key baseUrl note createdAt | while IFS='|' read -r name key baseUrl note created; do
    status=""; [ "$name" = "$current_default" ] && status="${GREEN}[默认]${NC}"
    printf "%-20s %-30s %-40s %-30s %b\n" "$name" "$(mask_key "$key")" "${baseUrl:0:40}" "${note:0:30}" "$status"
  done
  echo
  echo "总计: $key_count 个 Key"
  if [ -n "$current_default" ]; then echo -e "默认: ${GREEN}$current_default${NC}"; else echo "默认: （未设置）"; fi
}

cmd_current() {
  current_default=$(python3 "$JSON_HELPER" get "$KEYS_FILE" .default 2>/dev/null || echo "")
  if [ -z "$current_default" ]; then echo "当前未设置默认 Key"; exit 0; fi

  key_info=$(python3 "$JSON_HELPER" find "$KEYS_FILE" .keys name "$current_default" 2>/dev/null || echo "")
  [ -n "$key_info" ] && [ "$key_info" != "null" ] || die "默认 Key '$current_default' 不存在"

  key=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('key',''))")
  baseUrl=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('baseUrl',''))")
  note=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('note',''))")

  echo -e "${BLUE}当前默认 Key:${NC}"
  echo "  名称: $current_default"
  echo "  Key:  $(mask_key "$key")"
  echo "  Base URL: ${baseUrl:-（无）}"
  echo "  描述: ${note:-（无）}"
}

cmd_use() {
  local key_name="${1:-}"

  if [ -z "$key_name" ]; then
    key_name=$(python3 "$JSON_HELPER" get "$KEYS_FILE" .default 2>/dev/null || echo "")
    [ -n "$key_name" ] || die "未提供 key-name 且未设置默认 Key。请先设置默认或指定名称"
  fi

  key_info=$(python3 "$JSON_HELPER" find "$KEYS_FILE" .keys name "$key_name" 2>/dev/null || echo "")
  [ -n "$key_info" ] && [ "$key_info" != "null" ] || die "Key 不存在：$key_name"

  API_KEY=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('key',''))")
  BASE_URL=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('baseUrl',''))")
  note=$(echo "$key_info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('note',''))")

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}正在切换到 API Key:${NC} $key_name"
  echo "  Key: $(mask_key "$API_KEY")"
  [ -n "$BASE_URL" ] && echo "  Base URL: $BASE_URL"
  [ -n "$note" ] && echo "  描述: $note"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  # 确保 settings.json 存在
  if [ ! -f "$CLAUDE_SETTINGS" ]; then
    echo -e "${YELLOW}Claude settings 文件不存在，正在创建...${NC}"
    mkdir -p "$(dirname "$CLAUDE_SETTINGS")"
    echo '{}' > "$CLAUDE_SETTINGS"
  fi

  # 备份
  cp "$CLAUDE_SETTINGS" "${CLAUDE_SETTINGS}.backup"
  echo -e "已备份原配置到: ${CLAUDE_SETTINGS}.backup\n"

  settings_content=$(cat "$CLAUDE_SETTINGS")
  python3 << EOF > "${CLAUDE_SETTINGS}.tmp"
import json
import sys

try:
    settings = json.loads('''$settings_content''')
except Exception:
    settings = {}

if 'env' not in settings:
    settings['env'] = {}

settings['env']['ANTHROPIC_AUTH_TOKEN'] = '''$API_KEY'''

if '''$BASE_URL''':
    settings['env']['ANTHROPIC_BASE_URL'] = '''$BASE_URL'''
else:
    settings['env'].pop('ANTHROPIC_BASE_URL', None)

print(json.dumps(settings, indent=2, ensure_ascii=False))
EOF

  if python3 "$JSON_HELPER" validate "${CLAUDE_SETTINGS}.tmp" >/dev/null 2>&1; then
    mv "${CLAUDE_SETTINGS}.tmp" "$CLAUDE_SETTINGS"
    echo -e "${GREEN}✓ 成功更新 Claude settings${NC}\n"
  else
    rm -f "${CLAUDE_SETTINGS}.tmp"
    die "生成的 settings.json 格式无效，已回滚"
  fi

  # 同步默认 Key
  python3 "$JSON_HELPER" set "$KEYS_FILE" .default "$key_name"

  echo -e "${YELLOW}⚠️  需要重启 Claude Code 才能生效${NC}\n"
  echo "请执行以下步骤："
  echo "1. 退出当前会话（Ctrl+C 或 /exit）"
  echo "2. 重新运行 'claude' 命令启动"
  echo
  echo -e "${BLUE}当前 settings.json 中的 env 配置：${NC}"
  python3 "$JSON_HELPER" format "$CLAUDE_SETTINGS" .env | sed 's/^/  /'
}

main() {
  local command="${1:-help}"
  shift || true

  check_dependencies
  init_storage_if_needed
  validate_json

  case "$command" in
    list|ls)        cmd_list ;;
    add)            cmd_add ;;
    current)        cmd_current ;;
    remove|rm)      cmd_remove "${1:-}" ;;
    use)            cmd_use "${1:-}" ;;
    help|-h|--help) show_usage ;;
    *)              show_usage; exit 1 ;;
  esac
}

main "$@"



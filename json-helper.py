#!/usr/bin/env python3
"""
JSON 处理辅助工具 - 替代 jq
用于处理 Claude API Key 管理中的 JSON 操作

用法示例:
  python3 json-helper.py get file.json '.keys'
  python3 json-helper.py get file.json '.keys[0].name'
  python3 json-helper.py set file.json '.default' 'project-x'
  python3 json-helper.py add file.json '.keys' '{"name":"x","key":"y"}'
  python3 json-helper.py remove file.json '.keys' 'name' 'project-x'
  python3 json-helper.py validate file.json
  python3 json-helper.py length file.json '.keys'
  python3 json-helper.py find file.json '.keys' 'name' 'project-x'
  python3 json-helper.py format file.json '.env'
"""

import json
import sys
import os
from typing import Any, Optional


def load_json(file_path: str) -> dict:
    """加载 JSON 文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {e}", file=sys.stderr)
        sys.exit(1)


def save_json(file_path: str, data: dict) -> None:
    """保存 JSON 文件"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
    except Exception as e:
        print(f"Error: Failed to save {file_path}: {e}", file=sys.stderr)
        sys.exit(1)


def get_nested_value(data: dict, path: str) -> Any:
    """获取嵌套路径的值

    支持的路径格式:
    - '.key' - 获取顶层键
    - '.keys[0]' - 获取数组元素
    - '.keys[0].name' - 获取嵌套属性
    """
    if path == '.':
        return data

    # 移除开头的点
    path = path.lstrip('.')
    if not path:
        return data

    parts = path.replace('[', '.').replace(']', '').split('.')
    result = data

    for part in parts:
        if not part:
            continue

        if isinstance(result, dict):
            result = result.get(part, None)
        elif isinstance(result, list):
            try:
                index = int(part)
                result = result[index] if 0 <= index < len(result) else None
            except (ValueError, IndexError):
                return None
        else:
            return None

    return result


def set_nested_value(data: dict, path: str, value: Any) -> dict:
    """设置嵌套路径的值"""
    if path == '.':
        return value if isinstance(value, dict) else data

    path = path.lstrip('.')
    if not path:
        return data

    parts = path.split('.')
    current = data

    # 遍历到倒数第二个部分
    for part in parts[:-1]:
        if part not in current:
            current[part] = {}
        current = current[part]

    # 设置最后一个键的值
    current[parts[-1]] = value
    return data


def delete_nested_value(data: dict, path: str) -> dict:
    """删除嵌套路径的值"""
    if path == '.':
        return {}

    path = path.lstrip('.')
    if not path:
        return data

    parts = path.split('.')
    current = data

    # 遍历到倒数第二个部分
    for part in parts[:-1]:
        if part not in current:
            return data
        current = current[part]

    # 删除最后一个键
    if parts[-1] in current:
        del current[parts[-1]]

    return data


def cmd_get(args: list) -> None:
    """获取 JSON 值"""
    if len(args) < 2:
        print("Usage: json-helper.py get <file> <path>", file=sys.stderr)
        sys.exit(1)

    file_path, path = args[0], args[1]
    data = load_json(file_path)
    result = get_nested_value(data, path)

    if result is None:
        print("")
    elif isinstance(result, (dict, list)):
        print(json.dumps(result, ensure_ascii=False))
    elif isinstance(result, bool):
        print(str(result).lower())
    else:
        print(result)


def cmd_set(args: list) -> None:
    """设置 JSON 值"""
    if len(args) < 3:
        print("Usage: json-helper.py set <file> <path> <value>", file=sys.stderr)
        sys.exit(1)

    file_path, path, value_str = args[0], args[1], args[2]
    data = load_json(file_path)

    # 尝试解析 value 为 JSON，如果失败则作为字符串
    try:
        value = json.loads(value_str)
    except json.JSONDecodeError:
        value = value_str

    data = set_nested_value(data, path, value)
    save_json(file_path, data)


def cmd_delete(args: list) -> None:
    """删除 JSON 键"""
    if len(args) < 2:
        print("Usage: json-helper.py delete <file> <path>", file=sys.stderr)
        sys.exit(1)

    file_path, path = args[0], args[1]
    data = load_json(file_path)
    data = delete_nested_value(data, path)
    save_json(file_path, data)


def cmd_add(args: list) -> None:
    """向数组添加元素"""
    if len(args) < 3:
        print("Usage: json-helper.py add <file> <array_path> <value_json>", file=sys.stderr)
        sys.exit(1)

    file_path, path, value_str = args[0], args[1], args[2]
    data = load_json(file_path)

    # 解析要添加的值
    try:
        value = json.loads(value_str)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON value: {e}", file=sys.stderr)
        sys.exit(1)

    # 获取数组
    array = get_nested_value(data, path)
    if array is None:
        array = []
        data = set_nested_value(data, path, array)
    elif not isinstance(array, list):
        print(f"Error: Path {path} is not an array", file=sys.stderr)
        sys.exit(1)

    # 添加元素
    array.append(value)
    save_json(file_path, data)


def cmd_remove(args: list) -> None:
    """从数组中移除匹配的元素"""
    if len(args) < 4:
        print("Usage: json-helper.py remove <file> <array_path> <field> <value>", file=sys.stderr)
        sys.exit(1)

    file_path, path, field, value = args[0], args[1], args[2], args[3]
    data = load_json(file_path)

    # 获取数组
    array = get_nested_value(data, path)
    if array is None or not isinstance(array, list):
        print(f"Error: Path {path} is not an array", file=sys.stderr)
        sys.exit(1)

    # 过滤掉匹配的元素
    filtered = [item for item in array if not (isinstance(item, dict) and item.get(field) == value)]
    data = set_nested_value(data, path, filtered)
    save_json(file_path, data)


def cmd_validate(args: list) -> None:
    """验证 JSON 文件格式"""
    if len(args) < 1:
        print("Usage: json-helper.py validate <file>", file=sys.stderr)
        sys.exit(1)

    file_path = args[0]
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            json.load(f)
        # 成功，不输出任何内容，exit code 为 0
    except:
        sys.exit(1)


def cmd_length(args: list) -> None:
    """获取数组或对象的长度"""
    if len(args) < 2:
        print("Usage: json-helper.py length <file> <path>", file=sys.stderr)
        sys.exit(1)

    file_path, path = args[0], args[1]
    data = load_json(file_path)
    result = get_nested_value(data, path)

    if isinstance(result, (list, dict)):
        print(len(result))
    else:
        print(0)


def cmd_find(args: list) -> None:
    """在数组中查找匹配的元素"""
    if len(args) < 4:
        print("Usage: json-helper.py find <file> <array_path> <field> <value>", file=sys.stderr)
        sys.exit(1)

    file_path, path, field, value = args[0], args[1], args[2], args[3]
    data = load_json(file_path)

    # 获取数组
    array = get_nested_value(data, path)
    if array is None or not isinstance(array, list):
        print("")
        return

    # 查找匹配的元素
    for item in array:
        if isinstance(item, dict) and item.get(field) == value:
            print(json.dumps(item, ensure_ascii=False))
            return

    print("")


def cmd_format(args: list) -> None:
    """格式化输出 JSON（用于显示）"""
    if len(args) < 2:
        print("Usage: json-helper.py format <file> <path>", file=sys.stderr)
        sys.exit(1)

    file_path, path = args[0], args[1]
    data = load_json(file_path)
    result = get_nested_value(data, path)

    if result is not None:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("{}")


def cmd_list_array(args: list) -> None:
    """列出数组元素，输出格式：field1|field2|field3..."""
    if len(args) < 3:
        print("Usage: json-helper.py list-array <file> <array_path> <field1> [field2] [field3] ...", file=sys.stderr)
        sys.exit(1)

    file_path = args[0]
    path = args[1]
    fields = args[2:]

    data = load_json(file_path)
    array = get_nested_value(data, path)

    if array is None or not isinstance(array, list):
        return

    for item in array:
        if not isinstance(item, dict):
            continue

        values = []
        for field in fields:
            value = item.get(field, "")
            # 处理 None 值
            if value is None:
                value = ""
            values.append(str(value))

        print("|".join(values))


def main():
    if len(sys.argv) < 2:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]
    args = sys.argv[2:]

    commands = {
        'get': cmd_get,
        'set': cmd_set,
        'delete': cmd_delete,
        'add': cmd_add,
        'remove': cmd_remove,
        'validate': cmd_validate,
        'length': cmd_length,
        'find': cmd_find,
        'format': cmd_format,
        'list-array': cmd_list_array,
    }

    if command not in commands:
        print(f"Error: Unknown command '{command}'", file=sys.stderr)
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    commands[command](args)


if __name__ == '__main__':
    main()

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { LogLevel } from '../application/ports/ILogger';

/**
 * 应用程序配置数据接口
 */
export interface AppConfigData {
  keysFilePath: string; // API 密钥文件路径
  cacheFilePath: string; // 缓存文件路径
  logLevel: LogLevel; // 日志级别
  editor: string; // 默认编辑器
  selector: {
    type: 'fzf' | 'builtin'; // 密钥选择器类型
    fallback: 'fzf' | 'builtin'; // 备用选择器类型
    fzfOptions: {
      height: string; // fzf 高度
      border: boolean; // 是否显示边框
      reverse: boolean; // 是否反向显示
    };
  };
  display: {
    colorEnabled: boolean; // 是否启用颜色
    tableFormat: 'simple' | 'bordered'; // 表格格式
  };
}

/**
 * 应用程序配置管理类
 * 负责加载和合并用户配置与默认配置
 */
export class AppConfig {
  private static readonly CONFIG_FILE = join(homedir(), '.cckrc');
  private static readonly DEFAULT_KEYS_FILE = join(homedir(), '.cck/keys.json');
  private static readonly DEFAULT_CACHE_FILE = join(homedir(), '.cck/cache');

  /**
   * 加载配置
   * 如果用户配置文件存在，则合并用户配置和默认配置
   * 否则返回默认配置
   */
  static load(): AppConfigData {
    const defaults: AppConfigData = {
      keysFilePath: this.DEFAULT_KEYS_FILE,
      cacheFilePath: this.DEFAULT_CACHE_FILE,
      logLevel: LogLevel.INFO,
      editor: process.env.EDITOR || 'vim',
      selector: {
        type: 'fzf',
        fallback: 'builtin',
        fzfOptions: {
          height: '40%',
          border: true,
          reverse: true,
        },
      },
      display: {
        colorEnabled: true,
        tableFormat: 'bordered',
      },
    };

    if (!existsSync(this.CONFIG_FILE)) {
      return defaults;
    }

    try {
      const userConfig = JSON.parse(readFileSync(this.CONFIG_FILE, 'utf8'));
      return this.merge(defaults, userConfig);
    } catch {
      console.warn(`无法加载配置文件 ${this.CONFIG_FILE}，使用默认配置`);
      return defaults;
    }
  }

  /**
   * 合并默认配置和用户配置
   * 深层合并 selector 和 display 对象
   */
  private static merge(defaults: AppConfigData, user: Partial<AppConfigData>): AppConfigData {
    return {
      ...defaults,
      ...user,
      selector: { ...defaults.selector, ...user.selector },
      display: { ...defaults.display, ...user.display },
    };
  }

  /**
   * 获取配置文件路径
   */
  static getConfigPath(): string {
    return this.CONFIG_FILE;
  }
}

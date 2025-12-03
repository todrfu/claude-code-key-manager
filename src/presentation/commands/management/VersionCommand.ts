import { BaseCommand } from '../BaseCommand';
import { colors } from '../../../shared/constants/colors';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * 版本命令
 * 显示当前 CCK 的版本信息
 */
export class VersionCommand extends BaseCommand {
  async execute(_args: string[]): Promise<void> {
    const version = this.getVersion();
    console.log(`\n${colors.bright}CCK (Claude Code Key Manager)${colors.reset} ${colors.cyan}v${version}${colors.reset}\n`);
  }

  getDescription(): string {
    return '显示版本信息';
  }

  getUsage(): string {
    return 'cck --version | cck -V | cck version';
  }

  /**
   * 从 package.json 读取版本号
   */
  private getVersion(): string {
    try {
      // 使用 import.meta.url 获取当前文件路径
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      // 从编译后的位置向上查找 package.json
      // dist/index.js -> ../package.json
      const packageJsonPath = join(__dirname, '../package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}

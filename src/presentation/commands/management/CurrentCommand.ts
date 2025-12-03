import { BaseCommand } from '../BaseCommand';
import { GetCurrentKeyUseCase } from '../../../application/use-cases/key-management/GetCurrentKeyUseCase';
import { colors } from '../../../shared/constants/colors';

/**
 * 显示当前密钥命令
 * 显示当前设置的默认 API 密钥信息
 */
export class CurrentCommand extends BaseCommand {
  constructor(private readonly getCurrentKeyUseCase: GetCurrentKeyUseCase) {
    super();
  }

  async execute(_args: string[]): Promise<void> {
    const key = await this.getCurrentKeyUseCase.execute();

    if (!key) {
      console.log(`\n${colors.yellow}未设置默认密钥。${colors.reset}`);
      console.log(`运行 ${colors.cyan}cck use <key-name>${colors.reset} 来设置默认密钥。\n`);
      return;
    }

    console.log(`\n${colors.blue}当前默认密钥:${colors.reset}\n`);
    console.log(`  名称:    ${colors.bright}${key.name}${colors.reset}`);
    console.log(`  密钥:    ${colors.dim}${key.maskedKey}${colors.reset}`);
    if (key.baseUrl) {
      console.log(`  URL:     ${colors.dim}${key.baseUrl}${colors.reset}`);
    }
    if (key.note) {
      console.log(`  备注:    ${colors.dim}${key.note}${colors.reset}`);
    }
    console.log();
  }

  getDescription(): string {
    return '显示当前默认 API 密钥';
  }

  getUsage(): string {
    return 'cck current';
  }
}

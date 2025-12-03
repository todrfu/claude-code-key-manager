import { BaseCommand } from '../BaseCommand';
import { SwitchKeyUseCase } from '../../../application/use-cases/key-management/SwitchKeyUseCase';
import { colors } from '../../../shared/constants/colors';

/**
 * 切换密钥命令
 * 将指定的密钥设置为默认密钥
 */
export class UseCommand extends BaseCommand {
  constructor(private readonly switchKeyUseCase: SwitchKeyUseCase) {
    super();
  }

  async execute(args: string[]): Promise<void> {
    this.validateArgs(args, 1);

    const keyName = args[0];
    await this.switchKeyUseCase.execute(keyName);

    console.log(`\n${colors.green}✓ 已切换默认密钥为: ${keyName}${colors.reset}\n`);
  }

  getDescription(): string {
    return '切换默认 API 密钥';
  }

  getUsage(): string {
    return 'cck use <key-name>';
  }
}

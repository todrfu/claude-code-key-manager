import { BaseCommand } from '../BaseCommand';
import { RemoveKeyUseCase } from '../../../application/use-cases/key-management/RemoveKeyUseCase';
import { colors } from '../../../shared/constants/colors';
import readline from 'readline';

/**
 * 删除密钥命令
 * 删除指定的 API 密钥（需要用户确认）
 */
export class RemoveCommand extends BaseCommand {
  constructor(private readonly removeKeyUseCase: RemoveKeyUseCase) {
    super();
  }

  async execute(args: string[]): Promise<void> {
    this.validateArgs(args, 1);

    const keyName = args[0];

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirmed = await new Promise<boolean>((resolve) => {
      rl.question(
        `${colors.yellow}⚠️  确定要删除密钥 '${keyName}' 吗？ [y/N] ${colors.reset}`,
        (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        }
      );
    });

    if (!confirmed) {
      console.log('\n已取消。\n');
      return;
    }

    await this.removeKeyUseCase.execute(keyName);
    console.log(`\n${colors.green}✓ 成功删除 API 密钥: ${keyName}${colors.reset}\n`);
  }

  getDescription(): string {
    return '删除 API 密钥';
  }

  getUsage(): string {
    return 'cck remove <key-name>';
  }
}

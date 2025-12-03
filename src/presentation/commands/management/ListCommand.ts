import { BaseCommand } from '../BaseCommand';
import { ListKeysUseCase } from '../../../application/use-cases/key-management/ListKeysUseCase';
import { colors } from '../../../shared/constants/colors';

/**
 * 列出密钥命令
 * 显示所有已保存的 API 密钥信息
 */
export class ListCommand extends BaseCommand {
  constructor(private readonly listKeysUseCase: ListKeysUseCase) {
    super();
  }

  async execute(args: string[]): Promise<void> {
    const showFull = args.includes('-f') || args.includes('--full');
    const keys = await this.listKeysUseCase.execute({ showFull });

    console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     API 密钥                           ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

    if (showFull) {
      console.log(`${colors.yellow}⚠️  警告: 显示完整密钥，请注意保护隐私${colors.reset}\n`);
    }

    if (keys.length === 0) {
      console.log('未找到 API 密钥。');
      console.log(`\n运行 ${colors.cyan}cck add${colors.reset} 来添加你的第一个密钥。\n`);
      return;
    }

    keys.forEach((key) => {
      const defaultMarker = key.isDefault ? `${colors.green} [默认]${colors.reset}` : '';
      const displayKey = showFull && key.fullKey ? key.fullKey : key.maskedKey;
      console.log(`${colors.bright}${key.name}${colors.reset}${defaultMarker}`);
      console.log(`  密钥:    ${colors.dim}${displayKey}${colors.reset}`);
      if (key.baseUrl) {
        console.log(`  URL:     ${colors.dim}${key.baseUrl}${colors.reset}`);
      }
      if (key.note) {
        console.log(`  备注:    ${colors.dim}${key.note}${colors.reset}`);
      }
      console.log(`  创建时间: ${colors.dim}${new Date(key.createdAt).toLocaleString()}${colors.reset}`);
      console.log();
    });

    console.log(`${colors.dim}总计: ${keys.length} 个密钥${colors.reset}\n`);
  }

  getDescription(): string {
    return '列出所有 API 密钥';
  }

  getUsage(): string {
    return 'cck list [-f|--full]';
  }
}

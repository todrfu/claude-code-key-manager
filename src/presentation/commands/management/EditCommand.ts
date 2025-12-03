import readline from 'readline';
import { BaseCommand } from '../BaseCommand';
import { UpdateKeyUseCase } from '../../../application/use-cases/key-management/UpdateKeyUseCase';
import { colors } from '../../../shared/constants/colors';

/**
 * 编辑密钥命令
 * 提供交互式界面让用户编辑现有密钥的信息
 */
export class EditCommand extends BaseCommand {
  constructor(private readonly updateKeyUseCase: UpdateKeyUseCase) {
    super();
  }

  async execute(args: string[]): Promise<void> {
    this.validateArgs(args, 1);

    const keyName = args[0];

    console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     编辑 API 密钥: ${keyName.padEnd(20)}║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);
    console.log(`${colors.dim}提示：留空表示不修改该项${colors.reset}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));

    try {
      const key = await question('新的 API 密钥（留空保持不变）: ');
      const baseUrl = await question('新的基础 URL（留空保持不变，输入"-"清空）: ');
      const note = await question('新的描述（留空保持不变，输入"-"清空）: ');

      // 检查是否至少有一个字段被修改
      if (!key.trim() && !baseUrl.trim() && !note.trim()) {
        console.log(`\n${colors.yellow}⚠️  没有提供任何更新内容，操作已取消。${colors.reset}\n`);
        return;
      }

      // 准备更新数据
      const updateData: {
        name: string;
        key?: string;
        baseUrl?: string;
        note?: string;
      } = { name: keyName };

      if (key.trim()) {
        updateData.key = key.trim();
      }

      if (baseUrl.trim()) {
        updateData.baseUrl = baseUrl.trim() === '-' ? '' : baseUrl.trim();
      }

      if (note.trim()) {
        updateData.note = note.trim() === '-' ? '' : note.trim();
      }

      await this.updateKeyUseCase.execute(updateData);

      console.log(`\n${colors.green}✓ 成功编辑 API 密钥: ${keyName}${colors.reset}\n`);
    } finally {
      rl.close();
    }
  }

  getDescription(): string {
    return '编辑现有的 API 密钥信息';
  }

  getUsage(): string {
    return 'cck edit <key-name>';
  }
}

import readline from 'readline';
import { BaseCommand } from '../BaseCommand';
import { AddKeyUseCase } from '../../../application/use-cases/key-management/AddKeyUseCase';
import { colors } from '../../../shared/constants/colors';

/**
 * 添加密钥命令
 * 提供交互式界面让用户输入密钥信息
 */
export class AddCommand extends BaseCommand {
  constructor(private readonly addKeyUseCase: AddKeyUseCase) {
    super();
  }

  async execute(_args: string[]): Promise<void> {
    console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     添加新的 API 密钥                  ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> =>
      new Promise((resolve) => rl.question(prompt, resolve));

    try {
      const name = await question('输入密钥名称（例如：project-x）: ');
      if (!name.trim()) {
        throw new Error('密钥名称不能为空');
      }

      const key = await question('输入 API 密钥: ');
      if (!key.trim()) {
        throw new Error('API 密钥不能为空');
      }

      const baseUrl = await question('输入基础 URL（可选，按 Enter 跳过）: ');
      const note = await question('输入描述（可选）: ');

      await this.addKeyUseCase.execute({
        name: name.trim(),
        key: key.trim(),
        baseUrl: baseUrl.trim() || undefined,
        note: note.trim() || undefined,
      });

      console.log(`\n${colors.green}✓ 成功添加 API 密钥: ${name}${colors.reset}\n`);
    } finally {
      rl.close();
    }
  }

  getDescription(): string {
    return '交互式添加新的 API 密钥';
  }

  getUsage(): string {
    return 'cck add';
  }
}

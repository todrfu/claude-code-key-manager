import { BaseCommand } from '../BaseCommand';
import { LaunchClaudeUseCase } from '../../../application/use-cases/cli-launcher/LaunchClaudeUseCase';
import { LaunchOptionsDto } from '../../../application/dto/LaunchOptionsDto';

/**
 * 启动命令
 * 解析启动选项并启动 Claude CLI
 */
export class LaunchCommand extends BaseCommand {
  constructor(private readonly launchClaudeUseCase: LaunchClaudeUseCase) {
    super();
  }

  async execute(args: string[]): Promise<void> {
    const options = this.parseOptions(args);
    await this.launchClaudeUseCase.execute(options);
  }

  /**
   * 解析命令行参数
   * 提取 CCK 特定选项（--key, --use-default），其余参数传递给 Claude CLI
   */
  private parseOptions(args: string[]): LaunchOptionsDto {
    const options: LaunchOptionsDto = {
      claudeArgs: [],
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--key' && args[i + 1]) {
        options.keyName = args[i + 1];
        i++; // 跳过下一个参数（密钥名称）
      } else if (arg === '--use-default') {
        options.useDefault = true;
      } else {
        // 传递给 Claude CLI 的参数
        options.claudeArgs.push(arg);
      }
    }

    return options;
  }

  getDescription(): string {
    return '使用选定的 API 密钥启动 Claude CLI';
  }

  getUsage(): string {
    return 'cck [--key <name>] [--use-default] [claude-args...]';
  }
}

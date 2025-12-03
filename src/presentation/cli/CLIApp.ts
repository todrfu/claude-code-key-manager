import { CommandDispatcher } from './CommandDispatcher';
import { DIContainer } from '../../config/DIContainer';
import { colors } from '../../shared/constants/colors';

// 命令导入
import { AddCommand } from '../commands/management/AddCommand';
import { ListCommand } from '../commands/management/ListCommand';
import { RemoveCommand } from '../commands/management/RemoveCommand';
import { CurrentCommand } from '../commands/management/CurrentCommand';
import { UseCommand } from '../commands/management/UseCommand';
import { EditCommand } from '../commands/management/EditCommand';
import { VersionCommand } from '../commands/management/VersionCommand';
import { LaunchCommand } from '../commands/launcher/LaunchCommand';

/**
 * CLI 应用程序主类
 * 负责命令注册和路由分发
 */
export class CLIApp {
  private dispatcher: CommandDispatcher;

  constructor(private readonly container: DIContainer) {
    this.dispatcher = new CommandDispatcher();
    this.registerCommands();
  }

  /**
   * 注册所有可用命令
   */
  private registerCommands(): void {
    // 管理命令
    this.dispatcher.register('add', new AddCommand(this.container.getAddKeyUseCase()));
    this.dispatcher.register('list', new ListCommand(this.container.getListKeysUseCase()));
    this.dispatcher.register('ls', new ListCommand(this.container.getListKeysUseCase()));
    this.dispatcher.register('remove', new RemoveCommand(this.container.getRemoveKeyUseCase()));
    this.dispatcher.register('rm', new RemoveCommand(this.container.getRemoveKeyUseCase()));
    this.dispatcher.register('current', new CurrentCommand(this.container.getCurrentKeyUseCase()));
    this.dispatcher.register('use', new UseCommand(this.container.getSwitchKeyUseCase()));
    this.dispatcher.register('edit', new EditCommand(this.container.getUpdateKeyUseCase()));
    this.dispatcher.register('version', new VersionCommand());
    this.dispatcher.register('-V', new VersionCommand());
    this.dispatcher.register('--version', new VersionCommand());
    this.dispatcher.register('help', new HelpCommand(this.dispatcher));
    this.dispatcher.register('-h', new HelpCommand(this.dispatcher));
    this.dispatcher.register('--help', new HelpCommand(this.dispatcher));

    // 启动命令（内部命令，用于启动 Claude CLI）
    this.dispatcher.register('__launch', new LaunchCommand(this.container.getLaunchClaudeUseCase()));
  }

  /**
   * 运行 CLI 应用
   * 根据参数判断是执行管理命令还是启动 Claude CLI
   */
  async run(args: string[]): Promise<void> {
    if (args.length === 0) {
      // 无参数时，使用交互式密钥选择启动
      await this.dispatcher.dispatch('__launch', []);
      return;
    }

    const firstArg = args[0];

    if (this.dispatcher.isManagementCommand(firstArg)) {
      // 管理命令：执行对应的管理操作
      await this.dispatcher.dispatch(firstArg, args.slice(1));
    } else {
      // 启动模式：将所有参数传递给 Claude CLI
      await this.dispatcher.dispatch('__launch', args);
    }
  }
}

// 帮助命令
import { BaseCommand } from '../commands/BaseCommand';

/**
 * 帮助命令
 * 显示使用说明和命令列表
 */
class HelpCommand extends BaseCommand {
  constructor(_dispatcher: CommandDispatcher) {
    super();
  }

  async execute(_args: string[]): Promise<void> {
    console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║     CCK - Claude Code Key Manager      ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

    console.log(`${colors.bright}用法:${colors.reset}`);
    console.log(`  cck <command> [options]\n`);

    console.log(`${colors.bright}管理命令:${colors.reset}`);
    console.log(`  ${colors.cyan}list, ls${colors.reset}          列出所有 API 密钥`);
    console.log(`  ${colors.cyan}add${colors.reset}               交互式添加新的 API 密钥`);
    console.log(`  ${colors.cyan}edit <name>${colors.reset}        编辑现有 API 密钥信息`);
    console.log(`  ${colors.cyan}remove, rm <name>${colors.reset}  删除 API 密钥`);
    console.log(`  ${colors.cyan}current${colors.reset}           显示当前默认密钥`);
    console.log(`  ${colors.cyan}use <name>${colors.reset}         切换默认 API 密钥`);
    console.log(`  ${colors.cyan}version, -V${colors.reset}        显示版本信息`);
    console.log(`  ${colors.cyan}help, -h, --help${colors.reset}   显示此帮助信息\n`);

    console.log(`${colors.bright}启动 Claude CLI:${colors.reset}`);
    console.log(`  ${colors.cyan}cck${colors.reset}                        交互式密钥选择`);
    console.log(`  ${colors.cyan}cck --use-default${colors.reset}        使用默认密钥`);
    console.log(`  ${colors.cyan}cck --key <name>${colors.reset}          使用指定密钥`);
    console.log(`  ${colors.cyan}cck [options] <args>${colors.reset}      传递参数给 Claude CLI\n`);

    console.log(`${colors.bright}示例:${colors.reset}`);
    console.log(`  ${colors.dim}cck add${colors.reset}                   添加你的第一个 API 密钥`);
    console.log(`  ${colors.dim}cck list${colors.reset}                  查看所有密钥`);
    console.log(`  ${colors.dim}cck${colors.reset}                       使用密钥选择启动`);
    console.log(`  ${colors.dim}cck -r${colors.reset}                    使用 -r 标志启动`);
    console.log(`  ${colors.dim}cck --key prod -r${colors.reset}         使用 'prod' 密钥和 -r 标志\n`);
  }

  getDescription(): string {
    return '显示帮助信息';
  }

  getUsage(): string {
    return 'cck help';
  }
}

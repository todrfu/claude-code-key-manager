import { BaseCommand } from '../commands/BaseCommand';
import { MANAGEMENT_COMMANDS } from '../../shared/constants/commands';

/**
 * 命令分发器
 * 负责命令注册、路由和执行
 */
export class CommandDispatcher {
  private commands: Map<string, BaseCommand> = new Map();

  /**
   * 注册命令
   * @param name 命令名称
   * @param command 命令实例
   */
  register(name: string, command: BaseCommand): void {
    this.commands.set(name, command);
  }

  /**
   * 判断是否为管理命令
   * @param commandName 命令名称
   */
  isManagementCommand(commandName: string): boolean {
    return (MANAGEMENT_COMMANDS as readonly string[]).includes(commandName);
  }

  /**
   * 分发并执行命令
   * @param commandName 命令名称
   * @param args 命令参数
   */
  async dispatch(commandName: string, args: string[]): Promise<void> {
    const command = this.commands.get(commandName);

    if (!command) {
      throw new Error(`未知命令: ${commandName}`);
    }

    await command.execute(args);
  }

  /**
   * 获取所有可用命令名称
   */
  getAvailableCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * 根据名称获取命令实例
   */
  getCommand(name: string): BaseCommand | undefined {
    return this.commands.get(name);
  }
}

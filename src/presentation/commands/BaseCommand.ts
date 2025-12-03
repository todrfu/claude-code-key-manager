/**
 * 命令基类
 * 所有命令都继承此类，提供统一的接口和参数验证
 */
export abstract class BaseCommand {
  abstract execute(args: string[]): Promise<void>;
  abstract getDescription(): string;
  abstract getUsage(): string;

  /**
   * 验证参数数量
   * @param args 参数数组
   * @param minArgs 最少参数数量
   */
  protected validateArgs(args: string[], minArgs: number = 0): void {
    if (args.length < minArgs) {
      throw new Error(`参数不足。用法: ${this.getUsage()}`);
    }
  }
}

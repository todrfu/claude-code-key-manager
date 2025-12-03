import { AppConfig } from './config/AppConfig';
import { DIContainer } from './config/DIContainer';
import { CLIApp } from './presentation/cli/CLIApp';
import { ErrorHandler } from './presentation/cli/ErrorHandler';

/**
 * 应用程序主入口
 * @param args 命令行参数
 */
export async function main(args: string[]): Promise<void> {
  // 1. 加载配置
  const config = AppConfig.load();

  // 2. 初始化依赖注入容器
  DIContainer.initialize(config);

  const container = DIContainer.getInstance();
  const logger = container.getLogger();
  const errorHandler = new ErrorHandler(logger);

  try {
    // 3. 创建并运行 CLI 应用
    const app = new CLIApp(container);
    await app.run(args);
  } catch (error) {
    errorHandler.handle(error as Error);
  }
}

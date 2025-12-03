import { AppError } from '../../shared/errors/AppError';
import { ILogger } from '../../application/ports/ILogger';
import { colors } from '../../shared/constants/colors';

/**
 * 错误处理器
 * 统一处理应用程序中的各种错误，提供友好的错误提示
 */
export class ErrorHandler {
  constructor(private readonly logger: ILogger) {}

  /**
   * 处理错误并退出程序
   * @param error 错误对象
   */
  handle(error: Error): never {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else {
      this.handleUnknownError(error);
    }

    process.exit(error instanceof AppError ? error.statusCode : 1);
  }

  /**
   * 处理应用程序错误
   * 区分操作错误和系统错误，采用不同的处理策略
   */
  private handleAppError(error: AppError): void {
    if (error.isOperational()) {
      // 操作错误：显示用户友好的错误信息
      console.error(`\n${colors.red}❌ ${error.message}${colors.reset}\n`);
      this.logger.debug('错误详情', { code: error.code, stack: error.stack });
    } else {
      // 系统错误：需要完整日志记录
      this.logger.error('系统错误', error, { code: error.code });
    }
  }

  /**
   * 处理未知错误
   * 记录详细日志并提示用户报告问题
   */
  private handleUnknownError(error: Error): void {
    this.logger.error('意外错误', error);
    console.error(`\n${colors.red}❌ 发生意外错误，请报告此问题。${colors.reset}\n`);
  }
}

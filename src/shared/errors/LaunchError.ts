import { AppError } from './AppError';

/**
 * 启动错误
 * 当启动 Claude CLI 失败时抛出（系统错误）
 */
export class LaunchError extends AppError {
  constructor(message: string, cause?: Error) {
    super(`启动 Claude CLI 失败: ${message}`, 'LAUNCH_ERROR', 4);
    if (cause) {
      this.stack = `${this.stack}\n原因: ${cause.stack}`;
    }
  }

  isOperational(): boolean {
    return false;
  }
}

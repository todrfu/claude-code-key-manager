/**
 * 应用程序错误基类
 * 所有应用程序错误都继承此类，提供统一的错误处理接口
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 1
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 判断是否为操作错误（用户可理解的错误）
   * 操作错误会显示友好的错误信息，系统错误会记录详细日志
   */
  abstract isOperational(): boolean;
}

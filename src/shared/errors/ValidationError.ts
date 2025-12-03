import { AppError } from './AppError';

/**
 * 验证错误
 * 当输入数据不符合要求时抛出
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 3);
  }

  isOperational(): boolean {
    return true;
  }
}

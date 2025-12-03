import { AppError } from './AppError';

/**
 * 密钥未找到错误
 * 当指定的密钥不存在时抛出
 */
export class KeyNotFoundError extends AppError {
  constructor(keyName: string) {
    super(`未找到 API 密钥: ${keyName}`, 'KEY_NOT_FOUND', 2);
  }

  isOperational(): boolean {
    return true;
  }
}

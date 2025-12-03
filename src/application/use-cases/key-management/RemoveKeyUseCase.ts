import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { KeyName } from '../../../core/value-objects/KeyName';
import { KeyNotFoundError } from '../../../shared/errors/KeyNotFoundError';

/**
 * 删除密钥用例
 * 负责验证密钥存在性并删除密钥
 */
export class RemoveKeyUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行删除密钥操作
   * @param keyName 密钥名称
   */
  async execute(keyName: string): Promise<void> {
    const name = KeyName.create(keyName);
    const key = await this.keyRepository.find(name);

    if (!key) {
      throw new KeyNotFoundError(keyName);
    }

    await this.keyRepository.remove(name);
  }
}

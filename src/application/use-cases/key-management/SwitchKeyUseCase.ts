import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { KeyName } from '../../../core/value-objects/KeyName';
import { KeyNotFoundError } from '../../../shared/errors/KeyNotFoundError';

/**
 * 切换密钥用例
 * 负责将指定的密钥设置为默认密钥
 */
export class SwitchKeyUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行切换默认密钥操作
   * @param keyName 密钥名称
   */
  async execute(keyName: string): Promise<void> {
    const name = KeyName.create(keyName);
    const key = await this.keyRepository.find(name);

    if (!key) {
      throw new KeyNotFoundError(keyName);
    }

    await this.keyRepository.setDefault(name);
  }
}

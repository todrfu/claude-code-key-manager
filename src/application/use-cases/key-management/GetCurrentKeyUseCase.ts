import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { KeyInfoDto } from '../../dto/KeyInfoDto';

/**
 * 获取当前密钥用例
 * 获取当前设置的默认密钥信息
 */
export class GetCurrentKeyUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行获取当前密钥操作
   * @returns 当前密钥信息，如果未设置则返回 null
   */
  async execute(): Promise<KeyInfoDto | null> {
    const key = await this.keyRepository.getDefault();

    if (!key) {
      return null;
    }

    return {
      name: key.name.value,
      maskedKey: key.getMaskedKey(),
      baseUrl: key.baseUrl?.value,
      note: key.note,
      createdAt: key.createdAt.toISOString(),
      isDefault: true,
    };
  }
}

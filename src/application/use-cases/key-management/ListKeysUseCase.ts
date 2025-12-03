import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { KeyInfoDto } from '../../dto/KeyInfoDto';

export interface ListKeysOptions {
  showFull?: boolean;
}

/**
 * 列出密钥用例
 * 获取所有密钥并标记默认密钥
 */
export class ListKeysUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行列出密钥操作
   * @param options 选项配置
   * @param options.showFull 是否显示完整密钥
   * @returns 密钥信息列表
   */
  async execute(options: ListKeysOptions = {}): Promise<KeyInfoDto[]> {
    const { showFull = false } = options;
    const collection = await this.keyRepository.getAll();
    const defaultKey = collection.getDefault();

    return collection.getAll().map((key) => ({
      name: key.name.value,
      maskedKey: key.getMaskedKey(),
      fullKey: showFull ? key.key : undefined,
      baseUrl: key.baseUrl?.value,
      note: key.note,
      createdAt: key.createdAt.toISOString(),
      isDefault: key.name.equals(defaultKey?.name),
    }));
  }
}

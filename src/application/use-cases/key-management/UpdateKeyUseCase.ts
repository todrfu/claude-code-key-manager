import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { ApiKey } from '../../../core/entities/ApiKey';
import { KeyName } from '../../../core/value-objects/KeyName';
import { BaseUrl } from '../../../core/value-objects/BaseUrl';
import { UpdateKeyDto } from '../../dto/UpdateKeyDto';
import { ValidationError } from '../../../shared/errors/ValidationError';

/**
 * 更新密钥用例
 * 负责更新现有密钥的信息（API key、base URL、备注等）
 */
export class UpdateKeyUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行更新密钥操作
   * @param dto 更新数据（至少要提供一个可更新的字段）
   */
  async execute(dto: UpdateKeyDto): Promise<void> {
    if (!dto.name) {
      throw new ValidationError('密钥名称为必填项');
    }

    // 检查是否至少提供了一个要更新的字段
    if (!dto.key && !dto.baseUrl && dto.note === undefined) {
      throw new ValidationError('至少需要提供一个要更新的字段（key、baseUrl 或 note）');
    }

    const keyName = KeyName.create(dto.name);

    // 查找现有密钥
    const existing = await this.keyRepository.find(keyName);
    if (!existing) {
      throw new ValidationError(`密钥 '${dto.name}' 不存在`);
    }

    // 构建更新后的密钥对象，未提供的字段保持原值
    const updatedKey = ApiKey.reconstitute({
      name: existing.name,
      key: dto.key || existing.key,
      baseUrl: dto.baseUrl !== undefined
        ? dto.baseUrl
          ? BaseUrl.create(dto.baseUrl)
          : undefined
        : existing.baseUrl,
      note: dto.note !== undefined ? dto.note : existing.note,
      createdAt: existing.createdAt, // 保留原创建时间
    });

    await this.keyRepository.update(updatedKey);
  }
}

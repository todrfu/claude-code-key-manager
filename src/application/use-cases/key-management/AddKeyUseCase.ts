import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { ApiKey } from '../../../core/entities/ApiKey';
import { KeyName } from '../../../core/value-objects/KeyName';
import { BaseUrl } from '../../../core/value-objects/BaseUrl';
import { AddKeyDto } from '../../dto/AddKeyDto';
import { ValidationError } from '../../../shared/errors/ValidationError';

/**
 * 添加密钥用例
 * 负责验证输入、检查重复并保存密钥
 */
export class AddKeyUseCase {
  constructor(private readonly keyRepository: IKeyRepository) {}

  /**
   * 执行添加密钥操作
   * @param dto 密钥数据
   */
  async execute(dto: AddKeyDto): Promise<void> {
    if (!dto.name || !dto.key) {
      throw new ValidationError('名称和密钥为必填项');
    }

    const keyName = KeyName.create(dto.name);
    const baseUrl = dto.baseUrl ? BaseUrl.create(dto.baseUrl) : undefined;

    // 检查是否已存在
    const collection = await this.keyRepository.getAll();
    const existing = collection.find(keyName);

    if (existing && !dto.overwrite) {
      throw new ValidationError(
        `密钥 '${dto.name}' 已存在。使用覆盖选项来替换。`
      );
    }

    const apiKey = ApiKey.create({
      name: keyName,
      key: dto.key,
      baseUrl,
      note: dto.note,
    });

    if (existing) {
      await this.keyRepository.update(apiKey);
    } else {
      await this.keyRepository.add(apiKey);
    }
  }
}

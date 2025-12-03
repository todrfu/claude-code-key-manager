import { IKeyRepository } from '../../../core/repositories/IKeyRepository';
import { ICacheRepository } from '../../../core/repositories/ICacheRepository';
import { IKeySelector } from '../../ports/IKeySelector';
import { IProcessLauncher } from '../../ports/IProcessLauncher';
import { LaunchOptionsDto } from '../../dto/LaunchOptionsDto';
import { KeyName } from '../../../core/value-objects/KeyName';
import { KeyNotFoundError } from '../../../shared/errors/KeyNotFoundError';

/**
 * 启动 Claude CLI 用例
 * 负责确定使用的密钥、设置环境变量并启动 Claude CLI 进程
 */
export class LaunchClaudeUseCase {
  constructor(
    private readonly keyRepository: IKeyRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly keySelector: IKeySelector,
    private readonly processLauncher: IProcessLauncher
  ) {}

  /**
   * 执行启动流程
   * @param options 启动选项
   */
  async execute(options: LaunchOptionsDto): Promise<void> {
    // 1. 确定要使用的密钥
    const keyName = await this.determineKey(options);

    // 2. 获取密钥信息
    const collection = await this.keyRepository.getAll();
    const apiKey = collection.find(keyName);

    if (!apiKey) {
      throw new KeyNotFoundError(keyName.value);
    }

    // 3. 缓存此次选择
    await this.cacheRepository.setLastUsed(keyName);

    // 4. 准备环境变量
    const env: Record<string, string> = {
      ANTHROPIC_AUTH_TOKEN: apiKey.key,
    };

    if (apiKey.baseUrl && !apiKey.baseUrl.isEmpty()) {
      env.ANTHROPIC_BASE_URL = apiKey.baseUrl.value;
    }

    // 5. 启动 Claude CLI
    await this.processLauncher.launch('claude', options.claudeArgs, env);
  }

  /**
   * 确定要使用的密钥
   * 优先级：指定密钥 > 默认密钥 > 交互式选择
   */
  private async determineKey(options: LaunchOptionsDto): Promise<KeyName> {
    // 指定了密钥名称
    if (options.keyName) {
      return KeyName.create(options.keyName);
    }

    // 使用默认密钥
    if (options.useDefault) {
      const collection = await this.keyRepository.getAll();
      const defaultKey = collection.getDefault();
      if (!defaultKey) {
        throw new Error('未设置默认密钥。请先运行 "cck add" 添加密钥。');
      }
      return defaultKey.name;
    }

    // 交互式选择
    const lastUsed = await this.cacheRepository.getLastUsed();
    const collection = await this.keyRepository.getAll();

    if (collection.isEmpty()) {
      throw new Error('没有可用的 API 密钥。请先运行 "cck add" 添加密钥。');
    }

    const selectedName = await this.keySelector.select(collection, lastUsed);
    return KeyName.create(selectedName);
  }
}

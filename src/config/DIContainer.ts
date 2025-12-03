import { IKeyRepository } from '../core/repositories/IKeyRepository';
import { ICacheRepository } from '../core/repositories/ICacheRepository';
import { IKeySelector } from '../application/ports/IKeySelector';
import { IProcessLauncher } from '../application/ports/IProcessLauncher';
import { ILogger } from '../application/ports/ILogger';

import { JsonKeyRepository } from '../infrastructure/repositories/JsonKeyRepository';
import { FileSystemCacheRepository } from '../infrastructure/repositories/FileSystemCacheRepository';
import { FzfKeySelector } from '../infrastructure/adapters/FzfKeySelector';
import { FallbackKeySelector } from '../infrastructure/adapters/FallbackKeySelector';
import { NodeProcessLauncher } from '../infrastructure/adapters/NodeProcessLauncher';
import { ConsoleLogger } from '../infrastructure/logger/ConsoleLogger';
import { FileSystem } from '../infrastructure/file-system/FileSystem';

import { AddKeyUseCase } from '../application/use-cases/key-management/AddKeyUseCase';
import { RemoveKeyUseCase } from '../application/use-cases/key-management/RemoveKeyUseCase';
import { ListKeysUseCase } from '../application/use-cases/key-management/ListKeysUseCase';
import { GetCurrentKeyUseCase } from '../application/use-cases/key-management/GetCurrentKeyUseCase';
import { SwitchKeyUseCase } from '../application/use-cases/key-management/SwitchKeyUseCase';
import { UpdateKeyUseCase } from '../application/use-cases/key-management/UpdateKeyUseCase';
import { LaunchClaudeUseCase } from '../application/use-cases/cli-launcher/LaunchClaudeUseCase';

import { AppConfigData } from './AppConfig';

/**
 * 依赖注入容器
 * 采用单例模式，负责管理所有依赖对象的创建和生命周期
 */
export class DIContainer {
  private static instance: DIContainer;
  private config: AppConfigData;

  // 单例对象（延迟初始化）
  private _keyRepository?: IKeyRepository;
  private _cacheRepository?: ICacheRepository;
  private _keySelector?: IKeySelector;
  private _processLauncher?: IProcessLauncher;
  private _logger?: ILogger;
  private _fileSystem?: FileSystem;

  private constructor(config: AppConfigData) {
    this.config = config;
  }

  /**
   * 初始化容器（必须在首次使用前调用）
   */
  static initialize(config: AppConfigData): void {
    DIContainer.instance = new DIContainer(config);
  }

  /**
   * 获取容器实例
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      throw new Error('依赖注入容器未初始化');
    }
    return DIContainer.instance;
  }

  // ========== 基础设施层 ==========

  /**
   * 获取文件系统服务（单例）
   */
  getFileSystem(): FileSystem {
    if (!this._fileSystem) {
      this._fileSystem = new FileSystem();
    }
    return this._fileSystem;
  }

  /**
   * 获取日志服务（单例）
   */
  getLogger(): ILogger {
    if (!this._logger) {
      this._logger = new ConsoleLogger(this.config.logLevel);
    }
    return this._logger;
  }

  // ========== 仓储层 ==========

  /**
   * 获取密钥仓储（单例）
   */
  getKeyRepository(): IKeyRepository {
    if (!this._keyRepository) {
      this._keyRepository = new JsonKeyRepository(
        this.getFileSystem(),
        this.config.keysFilePath
      );
    }
    return this._keyRepository;
  }

  /**
   * 获取缓存仓储（单例）
   */
  getCacheRepository(): ICacheRepository {
    if (!this._cacheRepository) {
      this._cacheRepository = new FileSystemCacheRepository(
        this.getFileSystem(),
        this.config.cacheFilePath
      );
    }
    return this._cacheRepository;
  }

  // ========== 适配器层 ==========

  /**
   * 获取密钥选择器（单例）
   * 使用装饰器模式：FzfKeySelector 包装 FallbackKeySelector
   */
  getKeySelector(): IKeySelector {
    if (!this._keySelector) {
      this._keySelector = new FzfKeySelector(new FallbackKeySelector(), this.getLogger());
    }
    return this._keySelector;
  }

  /**
   * 获取进程启动器（单例）
   */
  getProcessLauncher(): IProcessLauncher {
    if (!this._processLauncher) {
      this._processLauncher = new NodeProcessLauncher(this.getLogger());
    }
    return this._processLauncher;
  }

  // ========== 用例层 ==========

  /**
   * 获取添加密钥用例（每次调用创建新实例）
   */
  getAddKeyUseCase(): AddKeyUseCase {
    return new AddKeyUseCase(this.getKeyRepository());
  }

  /**
   * 获取删除密钥用例（每次调用创建新实例）
   */
  getRemoveKeyUseCase(): RemoveKeyUseCase {
    return new RemoveKeyUseCase(this.getKeyRepository());
  }

  /**
   * 获取列出密钥用例（每次调用创建新实例）
   */
  getListKeysUseCase(): ListKeysUseCase {
    return new ListKeysUseCase(this.getKeyRepository());
  }

  /**
   * 获取当前密钥用例（每次调用创建新实例）
   */
  getCurrentKeyUseCase(): GetCurrentKeyUseCase {
    return new GetCurrentKeyUseCase(this.getKeyRepository());
  }

  /**
   * 获取切换密钥用例（每次调用创建新实例）
   */
  getSwitchKeyUseCase(): SwitchKeyUseCase {
    return new SwitchKeyUseCase(this.getKeyRepository());
  }

  /**
   * 获取更新密钥用例（每次调用创建新实例）
   */
  getUpdateKeyUseCase(): UpdateKeyUseCase {
    return new UpdateKeyUseCase(this.getKeyRepository());
  }

  /**
   * 获取启动 Claude CLI 用例（每次调用创建新实例）
   */
  getLaunchClaudeUseCase(): LaunchClaudeUseCase {
    return new LaunchClaudeUseCase(
      this.getKeyRepository(),
      this.getCacheRepository(),
      this.getKeySelector(),
      this.getProcessLauncher()
    );
  }
}

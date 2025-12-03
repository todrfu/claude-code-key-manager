import { ICacheRepository } from '../../core/repositories/ICacheRepository';
import { KeyName } from '../../core/value-objects/KeyName';
import { FileSystem } from '../file-system/FileSystem';

export class FileSystemCacheRepository implements ICacheRepository {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly filePath: string
  ) {}

  async getLastUsed(): Promise<KeyName | undefined> {
    try {
      if (!(await this.fileSystem.exists(this.filePath))) {
        return undefined;
      }
      const content = await this.fileSystem.readFile(this.filePath);
      const trimmed = content.trim();
      return trimmed ? KeyName.create(trimmed) : undefined;
    } catch {
      return undefined;
    }
  }

  async setLastUsed(keyName: KeyName): Promise<void> {
    await this.fileSystem.writeFile(this.filePath, keyName.value);
  }

  async clear(): Promise<void> {
    if (await this.fileSystem.exists(this.filePath)) {
      await this.fileSystem.delete(this.filePath);
    }
  }
}

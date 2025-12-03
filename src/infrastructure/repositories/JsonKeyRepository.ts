import { IKeyRepository } from '../../core/repositories/IKeyRepository';
import { KeyCollection } from '../../core/entities/KeyCollection';
import { ApiKey } from '../../core/entities/ApiKey';
import { KeyName } from '../../core/value-objects/KeyName';
import { BaseUrl } from '../../core/value-objects/BaseUrl';
import { FileSystem } from '../file-system/FileSystem';

interface StorageSchema {
  version: number;
  keys: Array<{
    name: string;
    key: string;
    baseUrl?: string;
    note?: string;
    createdAt: string;
  }>;
  default: string;
}

export class JsonKeyRepository implements IKeyRepository {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly filePath: string
  ) {}

  async getAll(): Promise<KeyCollection> {
    const data = await this.load();

    const keys = data.keys.map((k) =>
      ApiKey.reconstitute({
        name: KeyName.create(k.name),
        key: k.key,
        baseUrl: k.baseUrl ? BaseUrl.create(k.baseUrl) : undefined,
        note: k.note,
        createdAt: new Date(k.createdAt),
      })
    );

    const defaultKey = data.default ? KeyName.create(data.default) : undefined;

    return new KeyCollection(keys, defaultKey);
  }

  async find(name: KeyName): Promise<ApiKey | undefined> {
    const collection = await this.getAll();
    return collection.find(name);
  }

  async add(key: ApiKey): Promise<void> {
    const collection = await this.getAll();
    collection.add(key);
    await this.save(collection);
  }

  async update(key: ApiKey): Promise<void> {
    const collection = await this.getAll();
    collection.remove(key.name);
    collection.add(key);
    await this.save(collection);
  }

  async remove(name: KeyName): Promise<void> {
    const collection = await this.getAll();
    collection.remove(name);
    await this.save(collection);
  }

  async setDefault(name: KeyName): Promise<void> {
    const collection = await this.getAll();
    collection.setDefault(name);
    await this.save(collection);
  }

  async getDefault(): Promise<ApiKey | undefined> {
    const collection = await this.getAll();
    return collection.getDefault();
  }

  private async load(): Promise<StorageSchema> {
    if (!(await this.fileSystem.exists(this.filePath))) {
      return { version: 1, keys: [], default: '' };
    }

    const content = await this.fileSystem.readFile(this.filePath);
    return JSON.parse(content);
  }

  private async save(collection: KeyCollection): Promise<void> {
    const data: StorageSchema = {
      version: 1,
      keys: collection.getAll().map((k) => ({
        name: k.name.value,
        key: k.key,
        baseUrl: k.baseUrl?.value,
        note: k.note,
        createdAt: k.createdAt.toISOString(),
      })),
      default: collection.getDefault()?.name.value ?? '',
    };

    await this.fileSystem.writeFile(this.filePath, JSON.stringify(data, null, 2));
    await this.fileSystem.chmod(this.filePath, 0o600);
  }
}

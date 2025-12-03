import { KeyCollection } from '../entities/KeyCollection';
import { ApiKey } from '../entities/ApiKey';
import { KeyName } from '../value-objects/KeyName';

export interface IKeyRepository {
  getAll(): Promise<KeyCollection>;
  find(name: KeyName): Promise<ApiKey | undefined>;
  add(key: ApiKey): Promise<void>;
  update(key: ApiKey): Promise<void>;
  remove(name: KeyName): Promise<void>;
  setDefault(name: KeyName): Promise<void>;
  getDefault(): Promise<ApiKey | undefined>;
}

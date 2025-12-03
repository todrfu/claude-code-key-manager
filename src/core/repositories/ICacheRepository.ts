import { KeyName } from '../value-objects/KeyName';

export interface ICacheRepository {
  getLastUsed(): Promise<KeyName | undefined>;
  setLastUsed(keyName: KeyName): Promise<void>;
  clear(): Promise<void>;
}

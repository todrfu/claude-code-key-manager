import { ApiKey } from './ApiKey';
import { KeyName } from '../value-objects/KeyName';

export class KeyCollection {
  private keys: Map<string, ApiKey>;
  private defaultKeyName: KeyName | null;

  constructor(keys: ApiKey[] = [], defaultKeyName?: KeyName) {
    this.keys = new Map(keys.map((k) => [k.name.value, k]));
    this.defaultKeyName = defaultKeyName ?? null;
  }

  add(key: ApiKey): void {
    this.keys.set(key.name.value, key);

    // If first key, set as default
    if (this.keys.size === 1) {
      this.defaultKeyName = key.name;
    }
  }

  remove(name: KeyName): boolean {
    const deleted = this.keys.delete(name.value);

    // Clear default if removed
    if (deleted && this.defaultKeyName?.equals(name)) {
      this.defaultKeyName = null;
    }

    return deleted;
  }

  find(name: KeyName): ApiKey | undefined {
    return this.keys.get(name.value);
  }

  getDefault(): ApiKey | undefined {
    return this.defaultKeyName ? this.keys.get(this.defaultKeyName.value) : undefined;
  }

  setDefault(name: KeyName): void {
    if (!this.keys.has(name.value)) {
      throw new Error(`Cannot set non-existent key as default: ${name.value}`);
    }
    this.defaultKeyName = name;
  }

  getAll(): ApiKey[] {
    return Array.from(this.keys.values());
  }

  get size(): number {
    return this.keys.size;
  }

  isEmpty(): boolean {
    return this.keys.size === 0;
  }
}

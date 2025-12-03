import { ValidationError } from '../../shared/errors/ValidationError';

export class KeyName {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): KeyName {
    if (!value || value.trim().length === 0) {
      throw new ValidationError('Key name cannot be empty');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new ValidationError(
        'Key name can only contain alphanumeric characters, dash, and underscore'
      );
    }
    return new KeyName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: KeyName | undefined): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

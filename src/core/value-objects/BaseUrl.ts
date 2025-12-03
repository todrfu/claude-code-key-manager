import { ValidationError } from '../../shared/errors/ValidationError';

export class BaseUrl {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): BaseUrl {
    const trimmed = value.trim();
    if (trimmed && !this.isValidUrl(trimmed)) {
      throw new ValidationError('Invalid base URL format');
    }
    return new BaseUrl(trimmed);
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  get value(): string {
    return this._value;
  }

  isEmpty(): boolean {
    return this._value.length === 0;
  }

  toString(): string {
    return this._value;
  }
}

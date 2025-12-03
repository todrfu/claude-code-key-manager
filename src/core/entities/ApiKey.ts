import { KeyName } from '../value-objects/KeyName';
import { BaseUrl } from '../value-objects/BaseUrl';

export interface ApiKeyProps {
  name: KeyName;
  key: string;
  baseUrl?: BaseUrl;
  note?: string;
  createdAt: Date;
}

export class ApiKey {
  private constructor(private readonly props: ApiKeyProps) {}

  static create(props: Omit<ApiKeyProps, 'createdAt'>): ApiKey {
    return new ApiKey({
      ...props,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ApiKeyProps): ApiKey {
    return new ApiKey(props);
  }

  get name(): KeyName {
    return this.props.name;
  }

  get key(): string {
    return this.props.key;
  }

  get baseUrl(): BaseUrl | undefined {
    return this.props.baseUrl;
  }

  get note(): string | undefined {
    return this.props.note;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  getMaskedKey(): string {
    return this.key.length <= 12
      ? this.key
      : `${this.key.substring(0, 8)}…${this.key.substring(this.key.length - 4)}`;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name.value,
      key: this.key,
      baseUrl: this.baseUrl?.value,
      note: this.note,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

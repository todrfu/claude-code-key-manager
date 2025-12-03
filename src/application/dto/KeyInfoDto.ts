export interface KeyInfoDto {
  name: string;
  maskedKey: string;
  fullKey?: string;
  baseUrl?: string;
  note?: string;
  createdAt: string;
  isDefault: boolean;
}

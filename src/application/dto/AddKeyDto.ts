export interface AddKeyDto {
  name: string;
  key: string;
  baseUrl?: string;
  note?: string;
  overwrite?: boolean;
}

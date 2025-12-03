import { KeyCollection } from '../../core/entities/KeyCollection';
import { KeyName } from '../../core/value-objects/KeyName';

export interface IKeySelector {
  select(collection: KeyCollection, defaultKey?: KeyName): Promise<string>;
}

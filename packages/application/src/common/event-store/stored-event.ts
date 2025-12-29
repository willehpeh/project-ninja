import { NewEvent } from './new-event';

export type StoredEvent<T = unknown> = NewEvent<T> & {
  readonly position: number;
  readonly timestamp: string;
}

import { StoredEvent } from './stored-event';

export type NewEvent<T = unknown> = Omit<StoredEvent<T>, 'position' | 'timestamp'>;

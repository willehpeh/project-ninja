import { Observable } from 'rxjs';
import { NewEvent } from './new-event';
import { AppendCondition } from './append-condition';
import { AppendResult } from './append-result';
import { StoredEvent } from './stored-event';

export abstract class EventStore {
  abstract append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult>;

  abstract queryByTags(tags: string[], fromPosition?: number): Promise<StoredEvent[]>;

  abstract readAll(fromPosition?: number, limit?: number): Promise<StoredEvent[]>;

  abstract eventsOfTypes(types: string[], fromPosition?: number): Promise<StoredEvent[]>;

  abstract currentEventStream(): Observable<StoredEvent>;
}

import { Observable, Subject } from 'rxjs';
import {
  AppendCondition,
  AppendResult,
  AuthContext,
  CorruptionError,
  EventStore,
  NewEvent,
  StoredEvent
} from '@ninja-4-vs/application';
import { EventStoreFile } from './event-store-file';
import { SystemTimestampProvider, TimestampProvider } from './timestamp.provider';

export type JsonlEventStoreOptions = {
  basePath: string;
  timestampProvider?: TimestampProvider;
};

export class JsonlEventStore implements EventStore {

  private _globalPosition = 0;
  private readonly _eventStream = new Subject<StoredEvent>();

  private constructor(
    private readonly _eventStoreFile: EventStoreFile,
    private readonly _timestampProvider: TimestampProvider,
    private readonly _authContext: AuthContext
  ) {
  }

  static async create(opts: JsonlEventStoreOptions, authContext: AuthContext): Promise<JsonlEventStore> {
    const eventStoreFile = await EventStoreFile.create(opts.basePath);
    const timestampProvider = opts.timestampProvider ?? new SystemTimestampProvider();
    const store = new JsonlEventStore(eventStoreFile, timestampProvider, authContext);
    await store.setGlobalPositionFromEvents();
    return store;
  }

  async append(events: NewEvent[], condition: AppendCondition = AppendCondition.none()): Promise<AppendResult> {
    await this._eventStoreFile.lock();

    try {
      await this.validateCondition(condition);
      const serializedEvents = this.serializeEvents(events, this._globalPosition);
      const stringifiedEvents = this.stringifyEvents(serializedEvents);
      await this._eventStoreFile.write(stringifiedEvents);
      serializedEvents.forEach(event => this._eventStream.next(event));
      this._globalPosition += events.length;

      return {
        lastPosition: this._globalPosition,
        eventsWritten: events.length
      };
    } finally {
      await this._eventStoreFile.unlock();
    }
  }

  private stringifyEvents(serializedEvents: StoredEvent[]) {
    return serializedEvents.map(event => JSON.stringify(event)).join('\n') + '\n';
  }

  async queryByTags(tags: string[], fromPosition?: number): Promise<StoredEvent[]> {
    const allEvents = await this.readAll(fromPosition);
    const tagSet = new Set(tags);

    return allEvents.filter(event =>
      event.tags.some(tag => tagSet.has(tag))
    );
  }

  async readAll(fromPosition?: number, limit?: number): Promise<StoredEvent[]> {
    const lines = await this._eventStoreFile.readLines(fromPosition, limit);

    return lines.map((line, i) => {
      try {
        return JSON.parse(line) as StoredEvent;
      } catch {
        const corruptedPosition = (fromPosition ?? 1) + i;
        throw new CorruptionError(corruptedPosition, 'Corrupt JSON');
      }
    });
  }

  async eventsOfTypes(types: string[], fromPosition?: number): Promise<StoredEvent[]> {
    const allEvents = await this.readAll(fromPosition);
    return allEvents.filter(event => types.includes(event.type));
  }

  currentEventStream(): Observable<StoredEvent> {
    return this._eventStream.asObservable();
  }

  private async validateCondition(condition: AppendCondition) {
    const actualLastPosition = await this.lastPositionForTags(condition.tags);
    condition.checkIfMetForPosition(actualLastPosition);
  }

  private async lastPositionForTags(tags: string[]): Promise<number> {
    const events = await this.queryByTags(tags);
    if (events.length === 0) {
      return 0;
    }
    return events[events.length - 1].position;
  }

  private serializeEvents(events: NewEvent[], startPosition: number): StoredEvent[] {
    return events
      .map((event, i) => ({
        position: startPosition + i + 1,
        timestamp: this._timestampProvider.now(),
        ...event,
        meta: {
          ...event.meta,
          userId: this._authContext.userId()
        }
      }));
  }

  private async setGlobalPositionFromEvents(): Promise<void> {
    const lines = await this._eventStoreFile.readLines();
    if (lines.length === 0) {
      return;
    }

    const lastEvent: StoredEvent = JSON.parse(lines[lines.length - 1]);
    this._globalPosition = lastEvent.position;
  }
}

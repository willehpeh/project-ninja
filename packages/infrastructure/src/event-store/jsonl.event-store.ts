import {
  AppendCondition,
  AppendResult,
  CorruptionError,
  EventStore,
  NewEvent,
  StoredEvent
} from '@ninja-4-vs/application';
import { EventStoreFile } from './event-store-file';
import { SystemTimestampProvider, TimestampProvider } from './timestamp.provider';

type JsonlEventStoreOptions = {
  basePath: string;
  timestampProvider?: TimestampProvider;
};

export class JsonlEventStore implements EventStore {

  private _globalPosition = 0;

  private constructor(
    private readonly _eventStoreFile: EventStoreFile,
    private readonly _timestampProvider: TimestampProvider
  ) {}

  static async create(opts: JsonlEventStoreOptions): Promise<JsonlEventStore> {
    const eventStoreFile = await EventStoreFile.create(opts.basePath);
    const timestampProvider = opts.timestampProvider ?? new SystemTimestampProvider();
    const store = new JsonlEventStore(eventStoreFile, timestampProvider);
    await store.setGlobalPositionFromEvents();
    return store;
  }

  async append(events: NewEvent[], condition: AppendCondition = AppendCondition.none()): Promise<AppendResult> {
    await this._eventStoreFile.lock();

    try {
      condition.checkIfMetForPosition(await this.lastPositionForTags(condition.tags));
      await this._eventStoreFile.write(this.serialize(events, this._globalPosition));
      this._globalPosition += events.length;

      return {
        lastPosition: this._globalPosition,
        eventsWritten: events.length
      };
    } finally {
      await this._eventStoreFile.unlock();
    }
  }

  async lastPositionForTags(tags: string[]): Promise<number> {
    const events = await this.queryByTags(tags);
    if (events.length === 0) {
      return 0;
    }
    return events[events.length - 1].position;
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

  private serialize(events: NewEvent[], startPosition: number): string {
    return events
      .map((event, i) => JSON.stringify({
        position: startPosition + i + 1,
        timestamp: this._timestampProvider.now(),
        ...(event)
      }))
      .join('\n') + '\n';
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

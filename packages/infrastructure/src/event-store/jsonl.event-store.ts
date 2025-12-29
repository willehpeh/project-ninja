import {
  AppendCondition,
  AppendResult,
  CorruptionError,
  EventStore,
  NewEvent,
  StoredEvent
} from '@ninja-4-vs/application';
import { EventStoreFile } from './event-store-file';

type JsonlEventStoreOptions = {
  basePath: string;
};

export class JsonlEventStore implements EventStore {

  private _globalPosition = 0;
  private readonly _eventStoreFile: EventStoreFile;

  constructor(opts: JsonlEventStoreOptions) {
    this._eventStoreFile = new EventStoreFile(opts.basePath);
  }

  async init(): Promise<void> {
    await this._eventStoreFile.init();
    await this.setGlobalPositionFromEvents();
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

  globalPosition(): Promise<number> {
    return Promise.resolve(this._globalPosition);
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
        throw new CorruptionError((fromPosition ?? 0) + i + 1, 'Corrupt JSON');
      }
    });
  }

  private serialize(events: NewEvent[], startPosition: number): string {
    return events
      .map((event, i) => JSON.stringify({
        position: startPosition + i + 1,
        timestamp: new Date().toISOString(),
        ...(event)
      }))
      .join('\n') + '\n';
  }

  private async setGlobalPositionFromEvents(): Promise<void> {
    const events = await this.readAll();
    if (events.length > 0) {
      this._globalPosition = events[events.length - 1].position;
    }
  }
}

import { AppendCondition, AppendResult, CorruptionError, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';
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
      await this._eventStoreFile.write(this.toStoredEvents(events, this._globalPosition));
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
    const events: StoredEvent[] = [];
    let i = 0;

    for await (const line of this._eventStoreFile.readLines(fromPosition, limit)) {
      try {
        const event: StoredEvent = JSON.parse(line);
        events.push(event);
      } catch {
        throw new CorruptionError((fromPosition ?? 0) + i + 1, 'Corrupt JSON');
      }
      i++;
    }

    return events;
  }

  private toStoredEvents(events: NewEvent[], startPosition: number): string {
    const lines: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const position = startPosition + i + 1;
      lines.push(this.toStoredEventString(events[i], position));
    }

    return lines.join('\n') + '\n';
  }

  private toStoredEventString(event: NewEvent<unknown>, position: number): string {
    return JSON.stringify({
      position,
      timestamp: new Date().toISOString(),
      ...event
    });
  }

  private async setGlobalPositionFromEvents(): Promise<void> {
    const events = await this.readAll();
    if (events.length > 0) {
      this._globalPosition = events[events.length - 1].position;
    }
  }
}

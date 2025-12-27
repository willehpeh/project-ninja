import { AppendCondition, AppendResult, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';
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
    return;
  }

  async append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult> {
    const storedEventsString = this.convertToStoredEventsString(events);
    await this._eventStoreFile.write(storedEventsString);

    return {
      lastPosition: this._globalPosition,
      eventsWritten: events.length
    };
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

    for (const line of await this._eventStoreFile.readLines()) {
      const event: StoredEvent = JSON.parse(line);

      if (this.eventBeforePosition(event, fromPosition)) {
        continue;
      }

      events.push(event);

      if (this.hasSufficientEvents(limit, events)) {
        break;
      }
    }

    return events;
  }

  private hasSufficientEvents(limit: number | undefined, events: StoredEvent[]): boolean {
    return !!limit && events.length >= limit;
  }

  private eventBeforePosition(event: StoredEvent, fromPosition?: number): boolean {
    return !!fromPosition && event.position < fromPosition;
  }

  private convertToStoredEventsString(events: NewEvent[]): string {
    const lines: string[] = [];

    for (const event of events) {
      this._globalPosition++;
      lines.push(this.toStoredEventString(event));
    }

    return lines.join('\n') + '\n';
  }

  private toStoredEventString(event: NewEvent<unknown>): string {
    return JSON.stringify({
      position: this._globalPosition,
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

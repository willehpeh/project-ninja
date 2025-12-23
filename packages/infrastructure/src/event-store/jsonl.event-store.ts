import { AppendCondition, AppendResult, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { EventStoreFile } from './event-store-file';

type JsonlEventStoreOptions = {
  basePath: string;
};

export class JsonlEventStore implements EventStore {

  private globalPosition = 0;
  private readonly eventStoreFile: EventStoreFile;

  constructor(opts: JsonlEventStoreOptions) {
    this.eventStoreFile = new EventStoreFile(opts.basePath);
  }

  async init(): Promise<void> {
    await this.eventStoreFile.init();
    await this.setGlobalPositionFromEvents();
    return;
  }

  async append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult> {
    const storedEventsString = this.convertToStoredEventsString(events);
    await this.eventStoreFile.write(storedEventsString);

    return {
      lastPosition: this.globalPosition,
      eventsWritten: events.length
    };
  }

  getGlobalPosition(): Promise<number> {
    return Promise.resolve(this.globalPosition);
  }

  getLastPositionForTags(tags: string[]): Promise<number> {
    return Promise.resolve(0);
  }

  queryByTags(tags: string[], fromPosition?: number): Promise<StoredEvent[]> {
    return Promise.resolve([]);
  }

  async readAll(fromPosition?: number, limit?: number): Promise<StoredEvent[]> {
    const lines = await this.eventStoreFile.readLines();
    const events: StoredEvent[] = [];

    for (const line of lines) {
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
      this.globalPosition++;
      lines.push(this.toStoredEventString(event));
    }

    return lines.join('\n') + '\n';
  }

  private toStoredEventString(event: NewEvent<unknown>): string {
    return JSON.stringify({
      position: this.globalPosition,
      timestamp: new Date().toISOString(),
      ...event
    });
  }

  private async setGlobalPositionFromEvents(): Promise<void> {
    const events = await this.readAll();
    if (events.length > 0) {
      this.globalPosition = events[events.length - 1].position;
    }
  }
}

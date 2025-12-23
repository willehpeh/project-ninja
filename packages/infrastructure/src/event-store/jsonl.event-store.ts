import { AppendCondition, AppendResult, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { appendFile, readFile } from 'fs/promises';

type JsonlEventStoreOptions = {
  basePath: string;
};

export class JsonlEventStore implements EventStore {

  private eventsFilePath = '';
  private globalPosition = 0;

  constructor(private readonly opts: JsonlEventStoreOptions) {
  }

  async init(): Promise<void> {
    if (this.dataFolderDoesntExist()) {
      this.makeDataFolder(this.opts.basePath);
    }
    this.setEventFilePath();
    if (this.eventFileAlreadyExists()) {
      await this.setGlobalPositionFromEvents();
    }
    return;
  }

  async append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult> {
    const storedEvents = this.convertToStoredEventStrings(events);
    await this.writeEventsToStore(storedEvents);

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
    const content = await this.readEventFile();
    const events: StoredEvent[] = [];

    for (const line of this.fileLines(content)) {
      if (this.isEmpty(line)) {
        continue;
      }

      const event: StoredEvent = JSON.parse(line);

      if (this.eventBeforePosition(event, fromPosition)) {
        continue;
      }

      events.push(event);

      if (this.hasSufficientEvents(limit, events)) {
        break;
      }
    }

    return Promise.resolve(events);
  }

  private fileLines(content: string): string[] {
    return content.split('\n');
  }

  private isEmpty(line: string): boolean {
    return !line.trim();
  }

  private hasSufficientEvents(limit: number | undefined, events: StoredEvent[]): boolean {
    return !!limit && events.length >= limit;
  }

  private eventBeforePosition(event: StoredEvent, fromPosition?: number): boolean {
    return !!fromPosition && event.position < fromPosition;
  }

  private async readEventFile(): Promise<string> {
    return readFile(this.eventsFilePath, 'utf-8');
  }

  private async writeEventsToStore(storedEvents: string[]): Promise<void> {
    return appendFile(this.eventsFilePath, this.eventsArrayAsString(storedEvents));
  }

  private eventsArrayAsString(storedEvents: string[]): string {
    return storedEvents.join('\n') + '\n';
  }

  private convertToStoredEventStrings(events: NewEvent[]): string[] {
    const lines: string[] = [];

    for (const event of events) {
      this.globalPosition++;
      const stored: StoredEvent = this.toStoredEvent(event);
      lines.push(this.eventAsString(stored));
    }

    return lines;
  }

  private eventAsString(stored: StoredEvent): string {
    return JSON.stringify(stored);
  }

  private toStoredEvent(event: NewEvent<unknown>): StoredEvent {
    return {
      position: this.globalPosition,
      timestamp: new Date().toISOString(),
      ...event
    };
  }

  private setEventFilePath(): void {
    this.eventsFilePath = join(this.opts.basePath, 'events.jsonl');
  }

  private async setGlobalPositionFromEvents(): Promise<void> {
    const events = await this.readAll();
    if (events.length > 0) {
      this.globalPosition = events[events.length - 1].position;
    }
  }

  private eventFileAlreadyExists(): boolean {
    return existsSync(this.eventsFilePath);
  }

  private makeDataFolder(basePath: string): void {
    mkdirSync(basePath, { recursive: true });
  }

  private dataFolderDoesntExist(): boolean {
    return !existsSync(this.opts.basePath);
  }
}

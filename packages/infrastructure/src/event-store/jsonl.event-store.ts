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
    this.eventsFilePath = join(this.opts.basePath, 'events.jsonl');
    this.createDataFolderIfDoesntExist(this.opts.basePath);
    if (existsSync(this.eventsFilePath)) {
      const events = await this.readAll();
      if (events.length > 0) {
        this.globalPosition = events[events.length - 1].position;
      }
    }
    return Promise.resolve();
  }

  async append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult> {
    const lines: string[] = [];

    for (const event of events) {
      this.globalPosition++;

      const stored: StoredEvent = {
        position: this.globalPosition,
        timestamp: new Date().toISOString(),
        type: event.type,
        tags: event.tags,
        payload: event.payload,
        meta: event.meta
      };

      lines.push(JSON.stringify(stored));
    }

    await appendFile(this.eventsFilePath, lines.join('\n') + '\n');

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
    const content = await readFile(this.eventsFilePath, 'utf-8');
    const events: StoredEvent[] = [];

    for (const line of content.split('\n')) {
      if (!line.trim()) {
        continue;
      }

      const event: StoredEvent = JSON.parse(line);

      if (fromPosition && event.position < fromPosition) {
        continue;
      }

      events.push(event);

      if (limit && events.length >= limit) {
        break;
      }
    }

    return Promise.resolve(events);
  }

  private createDataFolderIfDoesntExist(basePath: string) {
    if (!existsSync(this.opts.basePath)) {
      mkdirSync(basePath, { recursive: true });
      return;
    }
  }

}

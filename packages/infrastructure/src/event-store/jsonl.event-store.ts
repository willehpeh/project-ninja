import { AppendCondition, AppendResult, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';

type JsonlEventStoreOptions = {
  basePath: string;
};

export class JsonlEventStore implements EventStore {

  private readonly eventsFilePath: string;
  private globalPosition = 0;

  constructor(private readonly opts: JsonlEventStoreOptions) {
    this.eventsFilePath = join(opts.basePath, 'events.jsonl');
    this.createDataFolderIfDoesntExist(this.opts.basePath);

  }

  private createDataFolderIfDoesntExist(basePath: string) {
    if (!existsSync(this.opts.basePath)) {
      mkdirSync(basePath, { recursive: true });
      return;
    }
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
    return Promise.resolve(0);
  }

  getLastPositionForTags(tags: string[]): Promise<number> {
    return Promise.resolve(0);
  }

  queryByTags(tags: string[], fromPosition?: number): Promise<StoredEvent[]> {
    return Promise.resolve([]);
  }

  readAll(fromPosition?: number, limit?: number): Promise<StoredEvent[]> {
    return Promise.resolve([]);
  }

}

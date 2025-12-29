import { createReadStream, existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import { join } from 'path';
import { lock, unlock } from 'proper-lockfile';
import { createInterface } from 'readline';

export class EventStoreFile {

  private constructor(private readonly filePath: string) {}

  static async create(basePath: string): Promise<EventStoreFile> {
    const filePath = join(basePath, 'events.jsonl');

    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }

    if (!existsSync(filePath)) {
      await appendFile(filePath, '');
    }

    return new EventStoreFile(filePath);
  }

  async write(content: string): Promise<void> {
    return appendFile(this.filePath, content);
  }

  async readLines(fromPosition?: number, limit?: number): Promise<string[]> {
    const lines: string[] = [];
    for await (const line of this.readLinesStream(fromPosition, limit)) {
      lines.push(line);
    }
    return lines;
  }

  private async *readLinesStream(fromPosition?: number, limit?: number): AsyncIterable<string> {
    const rl = createInterface({
      input: createReadStream(this.filePath),
      crlfDelay: Infinity
    });

    let position = 0;
    let yielded = 0;

    for await (const line of rl) {
      position++;

      if (fromPosition && position < fromPosition) continue;
      if (!line.trim()) continue;

      yield line;
      yielded++;

      if (limit && yielded >= limit) break;
    }
  }

  async lock(retries = 5): Promise<void> {
    await lock(this.filePath, { retries });
  }

  async unlock(): Promise<void> {
    await unlock(this.filePath);
  }
}

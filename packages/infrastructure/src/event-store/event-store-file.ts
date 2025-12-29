import { createReadStream, existsSync, mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import { join } from 'path';
import { lock, unlock } from 'proper-lockfile';
import { createInterface } from 'readline';

export class EventStoreFile {

  private filePath = '';

  constructor(private readonly basePath: string) {
  }

  async init(): Promise<void> {
    if (this.dataFolderDoesntExist()) {
      this.makeDataFolder(this.basePath);
    }
    this.filePath = join(this.basePath, 'events.jsonl');
    if (!existsSync(this.filePath)) {
      await this.write('');
    }
    return;
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

  private makeDataFolder(basePath: string): void {
    mkdirSync(basePath, { recursive: true });
  }

  private dataFolderDoesntExist(): boolean {
    return !existsSync(this.basePath);
  }
}

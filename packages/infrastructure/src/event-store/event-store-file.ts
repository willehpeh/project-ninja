import { existsSync, mkdirSync } from 'fs';
import { appendFile, readFile } from 'fs/promises';
import { join } from 'path';
import { lock, unlock } from 'proper-lockfile';

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

  async readLines(): Promise<string[]> {
    const content = await readFile(this.filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim());
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

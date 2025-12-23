import { existsSync, mkdirSync } from 'fs';
import { appendFile, readFile } from 'fs/promises';
import { join } from 'path';

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

  async read(): Promise<string> {
    return readFile(this.filePath, 'utf-8');
  }

  private makeDataFolder(basePath: string): void {
    mkdirSync(basePath, { recursive: true });
  }

  private dataFolderDoesntExist(): boolean {
    return !existsSync(this.basePath);
  }
}

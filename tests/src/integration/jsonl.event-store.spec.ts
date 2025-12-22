import { JsonlEventStore } from '@ninja-4-vs/infrastructure';
import { existsSync, rmSync } from 'fs';
import { NewEvent } from '@ninja-4-vs/application';
import { readFile } from 'fs/promises';

describe('JSONL event store', () => {
  let eventStore: JsonlEventStore;
  const testEventFolderPath = 'tmp/data';
  const testEventFilePath = `${ testEventFolderPath }/events.jsonl`;

  beforeEach(() => {
    eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
  });

  it('should create the folder', () => {
    expect(existsSync(testEventFolderPath)).toBe(true);
  });

  it('should append an event', async () => {
    const newEvent: NewEvent = {
      type: 'test-event',
      tags: ['test'],
      payload: { message: 'test' },
      meta: {
        user: 'test'
      }
    };
    await eventStore.append([newEvent]);
    const events = await eventsInJsonlFile();
    expect(events).toEqual([{ ...newEvent, position: 1, timestamp: expect.any(String) }]);
  });

  it('should append multiple events', async () => {
    const newEvents: NewEvent[] = [
      { type: 'test-event-1', tags: ['test'], payload: { message: 'test-1' } },
      { type: 'test-event-2', tags: ['test'], payload: { message: 'test-2' } }
    ];
    await eventStore.append(newEvents);
    const events = await eventsInJsonlFile();
    expect(events).toEqual(newEvents.map((event, index) => ({ ...event, position: index + 1, timestamp: expect.any(String) })));
  })

  afterEach(() => {
    if (existsSync(testEventFilePath)) {
      rmSync(testEventFilePath, { recursive: true });
    }
  });

  async function eventsInJsonlFile() {
    const fileContents = await readFile(testEventFilePath, 'utf8');
    return fileContents
      .split('\n')
      .slice(0, -1)
      .map(event => JSON.parse(event));
  }
});

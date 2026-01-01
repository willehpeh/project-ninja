import { JsonlEventStore } from '@ninja-4-vs/infrastructure';
import { existsSync, rmSync } from 'fs';
import { AppendCondition, NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { readFile, writeFile } from 'fs/promises';
import { take, tap } from 'rxjs';

describe('JSONL event store', () => {
  let eventStore: JsonlEventStore;
  const testEventFolderPath = 'tmp/data';
  const testEventFilePath = `${ testEventFolderPath }/events.jsonl`;

  describe('Appending events', () => {

    beforeEach(async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
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
      expect(events).toEqual(newEvents.map((event, index) => ({
        ...event,
        position: index + 1,
        timestamp: expect.any(String)
      })));
    });

  });

  async function writeEventFileWith(existingEvents: StoredEvent[]) {
    const fileContents = existingEvents.map(event => JSON.stringify(event)).join('\n') + '\n';
    await writeFile(testEventFilePath, fileContents);
  }

  describe('Startup logic', () => {

    it('should create the folder', async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
      expect(existsSync(testEventFolderPath)).toBe(true);
    });

    it('should create the file if it does not exist', async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
      const filePath = `${ testEventFolderPath }/events.jsonl`;
      expect(existsSync(filePath)).toBe(true);
    });

  });

  describe('Querying events', () => {
    it('should retrieve all events', async () => {
      const existingEvents: StoredEvent[] = [
        {
          position: 1,
          timestamp: '2021-01-01T00:00:00.000Z',
          type: 'test-event',
          tags: ['test'],
          payload: { message: 'test' },
          meta: { user: 'test' }
        },
        {
          position: 2,
          timestamp: '2021-01-02T00:00:00.000Z',
          type: 'test-event-2',
          tags: ['test'],
          payload: { message: 'test-2' },
        }
      ];
      await writeEventFileWith(existingEvents);
      const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
      const events = await eventStore.readAll();
      expect(events).toEqual(existingEvents);
    });

    it('should retrieve events from a given position', async () => {
      const existingEvents: StoredEvent[] = [
        {
          position: 1,
          timestamp: '2021-01-01T00:00:00.000Z',
          type: 'test-event',
          tags: ['test'],
          payload: { message: 'test' },
          meta: { user: 'test' }
        },
        {
          position: 2,
          timestamp: '2021-01-02T00:00:00.000Z',
          type: 'test-event-2',
          tags: ['test'],
          payload: { message: 'test-2' },
        }
      ];
      await writeEventFileWith(existingEvents);
      const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
      const events = await eventStore.readAll(2);
      expect(events).toEqual(existingEvents.slice(1));
    });
  });

  it('should retrieve events by tags', async () => {
    const existingEvents: StoredEvent[] = [
      {
        position: 1,
        timestamp: '2021-01-01T00:00:00.000Z',
        type: 'test-event',
        tags: ['test1'],
        payload: { message: 'test' },
        meta: { user: 'test' }
      },
      {
        position: 2,
        timestamp: '2021-01-02T00:00:00.000Z',
        type: 'test-event-2',
        tags: ['test2'],
        payload: { message: 'test-2' },
      },
      {
        position: 3,
        timestamp: '2021-01-03T00:00:00.000Z',
        type: 'test-event-3',
        tags: ['test2'],
        payload: { message: 'test-3' },
      },
      {
        position: 4,
        timestamp: '2021-01-04T00:00:00.000Z',
        type: 'test-event-4',
        tags: ['test3'],
        payload: { message: 'test-4' },
      },
      {
        position: 5,
        timestamp: '2021-01-05T00:00:00.000Z',
        type: 'test-event-5',
        tags: ['test1', 'test2'],
        payload: { message: 'test-5' },
      }
    ];
    await writeEventFileWith(existingEvents);
    const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });

    const events = await eventStore.queryByTags(['test1']);
    expect(events).toEqual([
      existingEvents[0],
      existingEvents[4]
    ]);
  });

  it('should not retrieve events if tags do not match', async () => {
    const existingEvents: StoredEvent[] = [
      {
        position: 1,
        timestamp: '2021-01-01T00:00:00.000Z',
        type: 'test-event',
        tags: ['test'],
        payload: { message: 'test' },
        meta: { user: 'test' }
      },
      {
        position: 2,
        timestamp: '2021-01-02T00:00:00.000Z',
        type: 'test-event-2',
        tags: ['test'],
        payload: { message: 'test-2' },
      }
    ];
    await writeEventFileWith(existingEvents);
    const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });

    const events = await eventStore.queryByTags(['not-a-tag']);
    expect(events).toEqual([]);
  });

  it('should fail to append an event when the expected position is before the real position', async () => {
    const existingEvents: StoredEvent[] = [
      {
        position: 1,
        timestamp: '2021-01-01T00:00:00.000Z',
        type: 'test-event',
        tags: ['test'],
        payload: { message: 'test' },
        meta: { user: 'test' }
      },
      {
        position: 2,
        timestamp: '2021-01-02T00:00:00.000Z',
        type: 'test-event-2',
        tags: ['test'],
        payload: { message: 'test-2' },
      }
    ];
    await writeEventFileWith(existingEvents);
    const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });

    const newEvent: NewEvent = {
      type: 'test-event',
      tags: ['test'],
      payload: { message: 'test' },
      meta: {
        user: 'test'
      }
    };
    const condition = new AppendCondition(['test'], 1);
    await expect((eventStore.append([newEvent], condition))).rejects.toThrow();
  });

  it('should only emit newly appended events', async () => {
    const existingEvents: StoredEvent[] = [
      {
        position: 1,
        timestamp: '2021-01-01T00:00:00.000Z',
        type: 'test-event',
        tags: ['test'],
        payload: { message: 'test' },
        meta: { user: 'test' }
      },
      {
        position: 2,
        timestamp: '2021-01-02T00:00:00.000Z',
        type: 'test-event-2',
        tags: ['test'],
        payload: { message: 'test-2' },
      }
    ];
    await writeEventFileWith(existingEvents);
    const eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath });
    const newEvent: NewEvent = {
      type: 'test-event',
      tags: ['test'],
      payload: { message: 'test' },
      meta: {
        user: 'test'
      }
    };
    eventStore.currentEventStream().pipe(
      take(1),
      tap(event => {
        expect(event).toMatchObject(newEvent);
        expect(event.position).toBe(3);
      })
    ).subscribe();

    await eventStore.append([newEvent]);
  });

  afterEach(() => {
    removeAllTestFiles();
  });

  function removeAllTestFiles() {
    if (existsSync(testEventFilePath)) {
      rmSync(testEventFilePath, { recursive: true });
    }
  }

  async function eventsInJsonlFile() {
    const fileContents = await readFile(testEventFilePath, 'utf8');
    return fileContents
      .split('\n')
      .slice(0, -1)
      .map(event => JSON.parse(event));
  }
});

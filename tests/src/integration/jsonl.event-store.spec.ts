import { JsonlEventStore } from '@ninja-4-vs/infrastructure';
import { existsSync, rmSync } from 'fs';
import { NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { readFile, writeFile } from 'fs/promises';

describe('JSONL event store', () => {
  let eventStore: JsonlEventStore;
  const testEventFolderPath = 'tmp/data';
  const testEventFilePath = `${ testEventFolderPath }/events.jsonl`;

  describe('Appending events', () => {

    beforeEach(async () => {
      eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
      await eventStore.init();
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
      eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
      await eventStore.init();
      expect(existsSync(testEventFolderPath)).toBe(true);
    });

    it('should retrieve the global position from an existing file', async () => {
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
      const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
      await eventStore.init();
      const globalPosition = await eventStore.globalPosition();
      expect(globalPosition).toBe(2);
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
      const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
      await eventStore.init();
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
      const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
      await eventStore.init();
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
    const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
    await eventStore.init();

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
    const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
    await eventStore.init();

    const events = await eventStore.queryByTags(['not-a-tag']);
    expect(events).toEqual([]);
  });

  it('should return the last position for a set of tags', async () => {
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
    const eventStore = new JsonlEventStore({ basePath: testEventFolderPath });
    await eventStore.init();

    const lastPosition = await eventStore.lastPositionForTags(['test2']);
    expect(lastPosition).toEqual(5);
  })

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

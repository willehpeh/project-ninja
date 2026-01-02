import { JsonlEventStore } from '@ninja-4-vs/infrastructure';
import { existsSync, rmSync } from 'fs';
import { AppendCondition, AuthContext, NewEvent, StoredEvent } from '@ninja-4-vs/application';
import { readFile, writeFile } from 'fs/promises';
import { take, tap } from 'rxjs';
import { FakeAuthContext } from '../common/fixtures/fake-auth-context';

const TEST_STORED_EVENTS = [
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
const TEST_NEW_EVENT = {
  type: 'test-event',
  tags: ['test'],
  payload: { message: 'test' },
  meta: {
    user: 'test'
  }
};
describe('JSONL event store', () => {
  let eventStore: JsonlEventStore;
  let authContext: AuthContext;
  const testEventFolderPath = 'tmp/data';
  const testEventFilePath = `${ testEventFolderPath }/events.jsonl`;

  beforeEach(() => {
    authContext = new FakeAuthContext();
  });

  describe('Appending events', () => {

    beforeEach(async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath }, authContext);
    });

    it('should append an event', async () => {
      await eventStore.append([TEST_NEW_EVENT]);
      const events = await eventsInJsonlFile();
      expect(events).toEqual([{
        ...TEST_NEW_EVENT,
        position: 1,
        timestamp: expect.any(String),
        meta: { ...TEST_NEW_EVENT.meta, userId: 'test-user' }
      }]);
    });

    it('should append multiple events', async () => {
      const newEvents: NewEvent[] = [
        TEST_NEW_EVENT,
        { ...TEST_NEW_EVENT, payload: { message: 'test-2' } }
      ];
      await eventStore.append(newEvents);
      const events = await eventsInJsonlFile();
      expect(events).toEqual(newEvents.map((event, index) => ({
        ...event,
        position: index + 1,
        timestamp: expect.any(String),
        meta: { ...event.meta, userId: 'test-user' }
      })));
    });

  });

  async function writeEventFileWith(existingEvents: StoredEvent[]) {
    const fileContents = existingEvents.map(event => JSON.stringify(event)).join('\n') + '\n';
    await writeFile(testEventFilePath, fileContents);
  }

  describe('Startup logic', () => {

    it('should create the folder', async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath }, authContext);
      expect(existsSync(testEventFolderPath)).toBe(true);
    });

    it('should create the file if it does not exist', async () => {
      eventStore = await JsonlEventStore.create({ basePath: testEventFolderPath }, authContext);
      const filePath = `${ testEventFolderPath }/events.jsonl`;
      expect(existsSync(filePath)).toBe(true);
    });

  });

  describe('Querying events', () => {
    it('should retrieve all events', async () => {
      eventStore = await eventStoreWithEvents(TEST_STORED_EVENTS);
      const events = await eventStore.readAll();
      expect(events).toEqual(TEST_STORED_EVENTS);
    });

    it('should retrieve events from a given position', async () => {
      eventStore = await eventStoreWithEvents(TEST_STORED_EVENTS);
      const events = await eventStore.readAll(2);
      expect(events).toEqual(TEST_STORED_EVENTS.slice(1));
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
    eventStore = await eventStoreWithEvents(existingEvents);

    const events = await eventStore.queryByTags(['test1']);
    expect(events).toEqual([
      existingEvents[0],
      existingEvents[4]
    ]);
  });

  it('should not retrieve events if tags do not match', async () => {
    eventStore = await eventStoreWithEvents(TEST_STORED_EVENTS);
    const events = await eventStore.queryByTags(['not-a-tag']);
    expect(events).toEqual([]);
  });

  it('should fail to append an event when the expected position is before the real position', async () => {
    eventStore = await eventStoreWithEvents(TEST_STORED_EVENTS);
    const condition = new AppendCondition(['test'], 1);
    await expect((eventStore.append([TEST_NEW_EVENT], condition))).rejects.toThrow();
  });

  it('should only emit newly appended events', async () => {
    eventStore = await eventStoreWithEvents(TEST_STORED_EVENTS);
    eventStore.currentEventStream().pipe(
      take(1),
      tap(event => {
        expect(event).toMatchObject(TEST_NEW_EVENT);
        expect(event.position).toBe(3);
      })
    ).subscribe();

    await eventStore.append([TEST_NEW_EVENT]);
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

  async function eventStoreWithEvents(events: StoredEvent[]) {
    await writeEventFileWith(events);
    return JsonlEventStore.create({ basePath: testEventFolderPath }, authContext);
  }
});

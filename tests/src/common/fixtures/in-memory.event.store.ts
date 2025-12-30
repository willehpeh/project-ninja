import { AppendCondition, AppendResult, EventStore, NewEvent, StoredEvent } from '@ninja-4-vs/application';

export class InMemoryEventStore implements EventStore {
  events: StoredEvent[] = [];

  async append(events: NewEvent[], condition?: AppendCondition): Promise<AppendResult> {
    if (condition) {
      const lastPositionForTags = await this.lastPositionForTags(condition.tags);
      if (lastPositionForTags !== condition.expectedLastPosition) {
        throw new Error('Concurrency conflict');
      }
    }
    const timestamp = new Date().toISOString();
    const currentLastPosition = this.events.length;
    this.events = [...this.events, ...events.map((e, i) => ({ position: currentLastPosition + i + 1, timestamp, ...e }))];
    return Promise.resolve({ lastPosition: currentLastPosition + events.length, eventsWritten: events.length });
  }

  async lastPositionForTags(tags: string[]): Promise<number> {
    const events = await this.queryByTags(tags);
    return events[events.length - 1]?.position ?? 0;
  }

  queryByTags(tags: string[], fromPosition = 1): Promise<StoredEvent[]> {
    return Promise.resolve(this.events
      .filter(event => event.position >= fromPosition && event.tags.some(t => tags.includes(t))));
  }

  readAll(fromPosition = 1, limit?: number): Promise<StoredEvent[]> {
    return Promise.resolve(this.events.slice(fromPosition - 1, limit));
  }


}

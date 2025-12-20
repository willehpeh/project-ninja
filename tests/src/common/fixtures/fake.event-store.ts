import { EventStore } from '@ninja-4-vs/application';

export class FakeEventStore implements EventStore {
  append(event: unknown): Promise<void> {
    this.events.push(event);
    return Promise.resolve();
  }

  events: unknown[] = [];
}

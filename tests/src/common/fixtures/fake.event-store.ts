import { EventStore } from '@ninja-4-vs/application';

export class FakeEventStore implements EventStore {
  events: { payload: unknown, metadata: { userId: string } }[] = [];

  append(event: unknown, userId: string): Promise<void> {
    this.events.push({ payload: event, metadata: { userId } });
    return Promise.resolve();
  }
}

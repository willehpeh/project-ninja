export abstract class EventStore {
  abstract append(event: unknown, userId: string): Promise<void>;
}

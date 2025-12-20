export abstract class EventStore {
  abstract append(event: unknown): Promise<void>;
}

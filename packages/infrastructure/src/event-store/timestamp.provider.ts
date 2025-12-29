export abstract class TimestampProvider {
  abstract now(): string;
}

export class SystemTimestampProvider extends TimestampProvider {
  now(): string {
    return new Date().toISOString();
  }
}

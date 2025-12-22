export class ConcurrencyError extends Error {
  constructor(
    public readonly tags: string[],
    public readonly expectedPosition: number,
    public readonly actualPosition: number
  ) {
    super(
      `Concurrency conflict: expected position ${expectedPosition} for tags [${tags.join(', ')}], found ${actualPosition}`
    );
    this.name = 'ConcurrencyError';
  }
}

export class CorruptionError extends Error {
  constructor(
    public readonly position: number,
    message?: string
  ) {
    super(message ?? `Event corruption detected at position ${position}`);
    this.name = 'CorruptionError';
  }
}

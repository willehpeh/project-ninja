export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly [key: string]: unknown;
}

export type StoredEvent<T = unknown> = {
  readonly position: number;
  readonly timestamp: string;
  readonly type: string;
  readonly tags: string[];
  readonly payload: T;
  readonly meta?: EventMetadata;
}


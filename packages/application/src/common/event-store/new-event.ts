export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly [key: string]: unknown;
}

export type NewEvent<T = unknown> = {
  readonly type: string;
  readonly tags: string[];
  readonly payload: T;
  readonly meta?: EventMetadata;
};

export class AppendCondition {
  readonly tags: string[];
  readonly expectedLastPosition: number;

  constructor(tags: string[], expectedLastPosition: number) {
    this.tags = tags;
    this.expectedLastPosition = expectedLastPosition;
  }

  static none(): AppendCondition {
    return new AppendCondition([], 0);
  }
}

import type { BettererResult } from './types.js';

export class BettererResultΩ implements BettererResult {
  constructor(
    public value: unknown,
    public printed: string
  ) {}
}

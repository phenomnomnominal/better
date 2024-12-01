import type { BettererLogger } from '@betterer/logger';

import type { BettererFilePaths } from '../fs/index.js';
import type { BettererResult } from '../results/index.js';
import type { BettererDiff } from '../test/index.js';
import type { BettererDelta, BettererRunSummary } from './types.js';

export class BettererRunSummaryΩ implements BettererRunSummary {
  public readonly baseline: BettererResult | null;
  public readonly expected: BettererResult | null;
  public readonly delta: BettererDelta | null;
  public readonly diff: BettererDiff | null;
  public readonly error: Error | null;
  public readonly filePaths: BettererFilePaths | null;
  public readonly isBetter: boolean;
  public readonly isComplete: boolean;
  public readonly isExpired: boolean;
  public readonly isFailed: boolean;
  public readonly isNew: boolean;
  public readonly isObsolete: boolean;
  public readonly isRemoved: boolean;
  public readonly isSame: boolean;
  public readonly isSkipped: boolean;
  public readonly isUpdated: boolean;
  public readonly isWorse: boolean;
  public readonly logger: BettererLogger;
  public readonly name: string;
  public readonly result: BettererResult | null;
  public readonly timestamp: number;

  constructor(summary: BettererRunSummary) {
    this.baseline = summary.baseline;
    this.delta = summary.delta;
    this.diff = summary.diff;
    this.error = summary.error;
    this.expected = summary.expected;
    this.filePaths = summary.filePaths;
    this.isBetter = summary.isBetter;
    this.isComplete = summary.isComplete;
    this.isExpired = summary.isExpired;
    this.isFailed = summary.isFailed;
    this.isNew = summary.isNew;
    this.isObsolete = summary.isObsolete;
    this.isRemoved = summary.isRemoved;
    this.isSame = summary.isSame;
    this.isSkipped = summary.isSkipped;
    this.isUpdated = summary.isUpdated;
    this.isWorse = summary.isWorse;
    this.logger = summary.logger;
    this.name = summary.name;
    this.result = summary.result;
    this.timestamp = summary.timestamp;
  }
}

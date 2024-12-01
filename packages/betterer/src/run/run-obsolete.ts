import type { BettererLogger } from '@betterer/logger';

import type { BettererReporter, BettererReporterΩ } from '../reporters/index.js';
import type { BettererResult } from '../results/index.js';
import type { BettererRun, BettererRunSummary } from './types.js';

import { BettererRunLoggerΩ } from './run-logger.js';
import { BettererRunSummaryΩ } from './run-summary.js';

export class BettererRunObsoleteΩ implements BettererRun {
  public readonly expected: BettererResult;
  public readonly filePaths = null;
  public readonly isNew = false;
  public readonly isObsolete = true;
  public readonly isOnly = false;
  public readonly isRemoved: boolean;
  public readonly isSkipped = false;
  public readonly lifecycle = Promise.withResolvers<BettererRunSummary>();
  public readonly logger: BettererLogger;

  constructor(
    reporter: BettererReporter,
    public readonly name: string,
    public readonly baseline: BettererResult,
    update = false
  ) {
    const { runLogger } = reporter as BettererReporterΩ;
    this.logger = new BettererRunLoggerΩ(runLogger, this);
    this.isRemoved = update;
    this.expected = baseline;
  }

  public async run(): Promise<BettererRunSummary> {
    return await Promise.resolve(
      new BettererRunSummaryΩ({
        baseline: this.baseline,
        delta: null,
        diff: null,
        error: null,
        expected: this.expected,
        filePaths: this.filePaths,
        isBetter: false,
        isComplete: false,
        isExpired: false,
        isFailed: false,
        isNew: false,
        isObsolete: this.isObsolete,
        isRemoved: this.isRemoved,
        isSame: false,
        isSkipped: false,
        isUpdated: false,
        isWorse: false,
        name: this.name,
        logger: this.logger,
        result: null,
        timestamp: -Infinity
      })
    );
  }
}

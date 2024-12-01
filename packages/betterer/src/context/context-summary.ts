import type { BettererConfig } from '../config/index.js';
import type { BettererSuiteSummaries, BettererSuiteSummary } from '../suite/index.js';
import type { BettererContextSummary } from './types.js';

import { BettererError } from '@betterer/errors';

import { getGlobals } from '../globals.js';

export class BettererContextSummaryΩ implements BettererContextSummary {
  public readonly config: BettererConfig;

  constructor(public readonly suites: BettererSuiteSummaries) {
    const { config } = getGlobals();
    this.config = config;
  }

  public get lastSuite(): BettererSuiteSummary {
    const suite = this.suites[this.suites.length - 1];
    if (!suite) {
      throw new BettererError(`Context has not completed a suite run yet! ❌`);
    }
    return suite;
  }
}

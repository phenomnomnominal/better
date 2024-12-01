import type { BettererFilePaths } from '../fs/index.js';
import type { BettererResultsSerialised, BettererResultΩ } from '../results/index.js';
import type { BettererRuns, BettererRunSummaries } from '../run/index.js';
import type { BettererTestNames } from '../test/index.js';
import type { BettererSuiteSummary } from './types.js';

import { BettererError, invariantΔ } from '@betterer/errors';

import { getGlobals } from '../globals.js';

export class BettererSuiteSummaryΩ implements BettererSuiteSummary {
  public readonly error: BettererError | null = null;
  public readonly result: BettererResultsSerialised;

  constructor(
    public readonly filePaths: BettererFilePaths,
    public readonly runs: BettererRuns,
    public readonly runSummaries: BettererRunSummaries
  ) {
    this.result = this._mergeResult();

    try {
      this._handleContextErrors();
    } catch (error) {
      this.error = error as BettererError;
    }
  }

  public get better(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isBetter);
  }

  public get changed(): BettererTestNames {
    return this._getChanged();
  }

  public get completed(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isComplete);
  }

  public get expired(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isExpired);
  }

  public get failed(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isFailed);
  }

  public get new(): BettererRunSummaries {
    return this.runSummaries.filter(
      (runSummary) => runSummary.isNew && !(runSummary.isSkipped || runSummary.isFailed || runSummary.isComplete)
    );
  }

  public get obsolete(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isObsolete && !runSummary.isRemoved);
  }

  public get ran(): BettererRunSummaries {
    return this.runSummaries.filter(
      (runSummary) => !(runSummary.isSkipped || runSummary.isFailed || runSummary.isObsolete || runSummary.isRemoved)
    );
  }

  public get removed(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isRemoved);
  }

  public get same(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isSame && !runSummary.isComplete);
  }

  public get skipped(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isSkipped);
  }

  public get updated(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isUpdated);
  }

  public get worse(): BettererRunSummaries {
    return this.runSummaries.filter((runSummary) => runSummary.isWorse && !runSummary.isUpdated);
  }

  private _getChanged(): BettererTestNames {
    const obsoleteRunNames = this.obsolete.map((runSummary) => runSummary.name);
    const notFailedOrSkippedOrObsolete = this.runSummaries.filter(
      (runSummary) => !runSummary.isFailed && !runSummary.isSkipped && !runSummary.isObsolete
    );
    const changedRuns = notFailedOrSkippedOrObsolete
      .filter((runSummary) => !runSummary.isNew)
      .filter((runSummary) => {
        const { result, expected } = runSummary;
        invariantΔ(result, 'Test is not _new_, _failed_, or _skipped_ so it must have a result!');
        invariantΔ(expected, 'Test is not _new_ so it must have an expected result!');
        const resultΩ = result as BettererResultΩ;
        const expectedΩ = expected as BettererResultΩ;
        return resultΩ.printed !== expectedΩ.printed;
      });
    const newRuns = notFailedOrSkippedOrObsolete.filter((runSummary) => runSummary.isNew && !runSummary.isComplete);
    const newOrChangedRunNames = [...changedRuns, ...newRuns].map((runSummary) => runSummary.name);
    return [...obsoleteRunNames, ...newOrChangedRunNames];
  }

  private _mergeResult(): BettererResultsSerialised {
    return this.runSummaries.reduce<BettererResultsSerialised>((results, runSummary) => {
      const { isFailed, isSkipped, isNew, isObsolete, isRemoved, isWorse, isUpdated } = runSummary;
      const isSkippedOrFailed = isSkipped || isFailed;
      if (isRemoved || (isSkippedOrFailed && isNew)) {
        return results;
      }
      const { expected, name, result } = runSummary;
      if ((isSkippedOrFailed && !isNew) || (isWorse && !isUpdated) || isObsolete) {
        invariantΔ(expected, 'Test has successfully run in the past so it must have an expected result!');
        const expectedΩ = expected as BettererResultΩ;
        results[name] = { value: expectedΩ.printed };
        return results;
      }
      invariantΔ(result, 'Test has successfully run so it must have a new result!');
      const resultΩ = result as BettererResultΩ;
      results[name] = { value: resultΩ.printed };
      return results;
    }, {});
  }

  private _handleContextErrors(): void {
    const { changed, expired, failed, worse } = this;
    const hasChanged = changed.length > 0;
    const hasExpired = expired.length > 0;
    const hasFailed = failed.length > 0;
    const hasWorse = worse.length > 0;

    if (!(hasChanged || hasExpired || hasFailed || hasWorse)) {
      return;
    }

    const errors = failed.flatMap((failed) => {
      invariantΔ(failed.error, 'A failed run will always have an `error`!');
      return [failed.name, failed.error];
    });

    const worseNames = worse.map((run) => run.name);

    const { config } = getGlobals();
    const { ci, precommit, strictDeadlines } = config;
    if (strictDeadlines && hasExpired) {
      const expiredNames = expired.map((run) => run.name);
      throw new BettererError('Tests have passed their deadline without achieving their goal. ❌', ...expiredNames);
    }
    if (ci && hasFailed) {
      throw new BettererError('Tests failed while running in CI mode. ❌', ...errors);
    }
    if (ci && hasChanged) {
      throw new BettererError('Unexpected changes detected while running in CI mode. ❌', ...changed);
    }
    if (precommit && hasFailed) {
      throw new BettererError('Tests failed while running in precommit mode. ❌', ...errors);
    }
    if (precommit && hasWorse) {
      throw new BettererError('Tests got worse while running in precommit mode. ❌', ...worseNames);
    }
    if (hasFailed) {
      throw new BettererError('Tests failed while running Betterer. ❌', ...errors);
    }
    if (hasWorse) {
      throw new BettererError('Tests got worse while running Betterer. ❌', ...worseNames);
    }
  }
}

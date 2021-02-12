import { BettererRuns, BettererSummary } from './types';
import { BettererRunΩ } from './run';

export class BettererSummaryΩ implements BettererSummary {
  constructor(private _runs: BettererRuns, private _result: string, private _expected: string | null) {}

  public get runs(): BettererRuns {
    return this._runs;
  }

  public get result(): string {
    return this._result;
  }

  public get expected(): string | null {
    return this._expected;
  }

  public get hasDiff(): boolean {
    return !!this._expected;
  }

  public get completed(): BettererRuns {
    return this._runs.filter((run) => run.isComplete);
  }

  public get expired(): BettererRuns {
    return this._runs.filter((run) => run.isExpired);
  }

  public get better(): BettererRuns {
    return this._runs.filter((run) => run.isBetter);
  }

  public get failed(): BettererRuns {
    return this._runs.filter((run) => run.isFailed);
  }

  public get new(): BettererRuns {
    return this._runs.filter((run) => {
      const runΩ = run as BettererRunΩ;
      return runΩ.isNew && runΩ.isRan;
    });
  }

  public get obsolete(): BettererRuns {
    return this._runs.filter((run) => run.isObsolete);
  }

  public get ran(): BettererRuns {
    return this._runs.filter((run) => {
      const runΩ = run as BettererRunΩ;
      return runΩ.isRan;
    });
  }

  public get same(): BettererRuns {
    return this._runs.filter((run) => run.isSame);
  }

  public get skipped(): BettererRuns {
    return this._runs.filter((run) => run.isSkipped);
  }

  public get updated(): BettererRuns {
    return this._runs.filter((run) => run.isUpdated);
  }

  public get worse(): BettererRuns {
    return this._runs.filter((run) => run.isWorse);
  }
}

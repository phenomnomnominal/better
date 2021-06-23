import { BettererConstraintResult } from '@betterer/constraints';
import { BettererError } from '@betterer/errors';
import assert from 'assert';

import { BettererConfig } from '../config';
import { BettererFilePaths } from '../fs';
import { BettererResult } from '../results';
import { BettererDiff, BettererTestBase, BettererTestConfig } from '../test';
import { Defer, defer } from '../utils';
import { BettererRunSummaryΩ } from './run-summary';
import { BettererRun, BettererRunning, BettererRunSummary } from './types';

export enum BettererRunStatus {
  better,
  failed,
  pending,
  new,
  same,
  skipped,
  update,
  worse
}

export class BettererRunΩ implements BettererRun {
  public readonly isNew = this.expected.isNew;

  private _lifecycle: Defer<BettererRunSummary>;
  private _result: BettererResult | null = null;
  private _status: BettererRunStatus;
  private _timestamp: number | null = null;

  constructor(
    public readonly config: BettererConfig,
    public readonly name: string,
    private _test: BettererTestBase,
    public expected: BettererResult,
    private _baseline: BettererResult,
    public filePaths: BettererFilePaths | null
  ) {
    this._status = this._test.isSkipped ? BettererRunStatus.skipped : BettererRunStatus.pending;
    this._lifecycle = defer();
  }

  public get timestamp(): number {
    assert(this._timestamp != null);
    return this._timestamp;
  }

  public get isSkipped(): boolean {
    return this._status === BettererRunStatus.skipped;
  }

  public get lifecycle(): Promise<BettererRunSummary> {
    return this._lifecycle.promise;
  }

  public get test(): BettererTestConfig {
    return this._test.config;
  }

  public start(): BettererRunning {
    this._timestamp = Date.now();

    const end = async (diff: BettererDiff | null = null): Promise<BettererRunSummary> => {
      const baselineValue = this._baseline.isNew ? null : this._baseline.value;
      const resultValue = !this._result ? null : this._result.value;

      const delta = await this.test.progress(baselineValue, resultValue);
      const isComplete = resultValue != null && (await this.test.goal(resultValue));
      const runSummary = new BettererRunSummaryΩ(this, this._result, diff, delta, this._status, isComplete);
      this._lifecycle.resolve(runSummary);
      return runSummary;
    };

    return {
      done: async (result: BettererResult): Promise<BettererRunSummary> => {
        if (this.isNew) {
          this._updateResult(BettererRunStatus.new, result);
          return end(null);
        }

        const comparison = await this.test.constraint(result.value, this.expected.value);

        if (comparison === BettererConstraintResult.same) {
          this._updateResult(BettererRunStatus.same, result);
          return end();
        }

        if (comparison === BettererConstraintResult.better) {
          this._updateResult(BettererRunStatus.better, result);
          return end();
        }

        if (this.config.update) {
          this._updateResult(BettererRunStatus.update, result);
          return end(this.test.differ(this.expected.value, result.value));
        }

        this._updateResult(BettererRunStatus.worse, result);
        return end(this.test.differ(this.expected.value, result.value));
      },
      failed: async (error: BettererError): Promise<BettererRunSummary> => {
        assert.strictEqual(this._status, BettererRunStatus.pending);
        this._status = BettererRunStatus.failed;
        this._lifecycle.reject(error);
        return end();
      },
      skipped: async (): Promise<BettererRunSummary> => {
        return end();
      }
    };
  }

  private _updateResult(status: BettererRunStatus, result: BettererResult) {
    assert.strictEqual(this._status, BettererRunStatus.pending);
    this._status = status;
    this._result = result;
  }
}

export type BettererRunsΩ = ReadonlyArray<BettererRunΩ>;

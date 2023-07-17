import type { BettererError } from '@betterer/errors';

import type { BettererConfig } from '../config/index.js';
import type { BettererFilePaths } from '../fs/index.js';
import type { BettererReporterΩ } from '../reporters/index.js';
import type { BettererResultsFileΩ } from '../results/index.js';
import type {
  BettererReporterRun,
  BettererRuns,
  BettererRunSummaries,
  BettererRunSummary,
  BettererRunsΩ
} from '../run/index.js';
import type { Defer } from '../utils.js';
import type { BettererSuite } from './types.js';

import assert from 'node:assert';

import { defer } from '../utils.js';
import { BettererSuiteSummaryΩ } from './suite-summary.js';

const NEGATIVE_FILTER_TOKEN = '!';

export class BettererSuiteΩ implements BettererSuite {
  private _reporter: BettererReporterΩ;

  constructor(
    private _config: BettererConfig,
    private _resultsFile: BettererResultsFileΩ,
    public filePaths: BettererFilePaths,
    public runs: BettererRuns
  ) {
    this._reporter = this._config.reporter as BettererReporterΩ;
  }

  public async run(isRunOnce = false): Promise<BettererSuiteSummaryΩ> {
    // Attach lifecycle promises for Reporters:
    const runLifecycles = this.runs.map((run) => {
      const lifecycle = defer<BettererRunSummary>();
      (run as BettererReporterRun).lifecycle = lifecycle.promise;
      return lifecycle;
    });

    const runsLifecycle = defer<BettererSuiteSummaryΩ>();
    // Don't await here! A custom reporter could be awaiting
    // the lifecycle promise which is unresolved right now!
    const reportSuiteStart = this._reporter.suiteStart(this, runsLifecycle.promise);
    try {
      const runSummaries = await this._runTests(runLifecycles);
      const changed = this._resultsFile.getChanged(runSummaries);
      const suiteSummaryΩ = new BettererSuiteSummaryΩ(this.filePaths, this.runs, runSummaries, changed);
      runsLifecycle.resolve(suiteSummaryΩ);
      await reportSuiteStart;
      await this._reporter.suiteEnd(suiteSummaryΩ);

      if (!isRunOnce && suiteSummaryΩ && !this._config.ci) {
        await this._resultsFile.writeNew(suiteSummaryΩ);
      }

      return suiteSummaryΩ;
    } catch (error) {
      runsLifecycle.reject(error as BettererError);
      await reportSuiteStart;
      await this._reporter.suiteError(this, error as BettererError);
      throw error;
    }
  }

  private async _runTests(runLifecycles: Array<Defer<BettererRunSummary>>): Promise<BettererRunSummaries> {
    const runsΩ = this.runs as BettererRunsΩ;

    const hasOnly = !!runsΩ.find((run) => run.testMeta.isOnly);
    const { filters } = this._config;

    return await Promise.all(
      runsΩ.map(async (runΩ, index) => {
        const lifecycle = runLifecycles[index];

        // This is all a bit backwards because "filters" is named badly.
        const hasFilters = !!filters.length;

        // And this is some madness which applies filters and negative filters in
        // the order they are read:
        //
        // ["foo"] => [/foo/] => ["foo"]
        // ["foo"] => [/bar/] => []
        // ["foo"] => [/!foo/] => []
        // ["foo"] => [/!bar/] => ["foo"]
        // ["foo"] => [/foo/, /!foo/] => []
        // ["foo"] => [/!foo/, /foo/] => ["foo"]
        const isSelected = filters.reduce((selected, filter) => {
          const isNegated = filter.source.startsWith(NEGATIVE_FILTER_TOKEN);
          if (selected) {
            if (isNegated) {
              const negativeFilter = new RegExp(filter.source.substr(1), filter.flags);
              return !negativeFilter.test(runΩ.name);
            }
            return selected;
          } else {
            if (isNegated) {
              const negativeFilter = new RegExp(filter.source.substr(1), filter.flags);
              return !negativeFilter.test(runΩ.name);
            }
            return filter.test(runΩ.name);
          }
        }, false);

        const isOtherTestOnly = hasOnly && !runΩ.testMeta.isOnly;
        const isSkipped = (hasFilters && !isSelected) || isOtherTestOnly || runΩ.testMeta.isSkipped;

        // Don't await here! A custom reporter could be awaiting
        // the lifecycle promise which is unresolved right now!
        const reportRunStart = this._reporter.runStart(runΩ, lifecycle.promise);
        const runSummary = await runΩ.run(isSkipped);

        // `filePaths` will be updated in the worker if the test filters the files
        // so it needs to be updated
        runΩ.filePaths = runSummary.filePaths;

        if (runSummary.isFailed) {
          const { error } = runSummary;
          assert(error);
          lifecycle.reject(error);
          await reportRunStart;
          await this._reporter.runError(runΩ, error as BettererError);
        } else {
          lifecycle.resolve(runSummary);
          await reportRunStart;
          await this._reporter.runEnd(runSummary);
        }
        return runSummary;
      })
    );
  }
}

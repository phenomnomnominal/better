import type { BettererError } from '@betterer/errors';

import type { BettererFilePaths } from '../fs/index.js';
import type { BettererReporterΩ } from '../reporters/index.js';
import type { BettererRuns } from '../run/index.js';
import type { BettererSuite, BettererSuiteSummary } from './types.js';

import { invariantΔ } from '@betterer/errors';

import { getGlobals } from '../globals.js';
import { BettererResultΩ } from '../results/index.js';
import { BettererRunObsoleteΩ, BettererRunΩ } from '../run/index.js';
import { BettererSuiteSummaryΩ } from './suite-summary.js';

const NEGATIVE_FILTER_TOKEN = '!';

export class BettererSuiteΩ implements BettererSuite {
  public readonly lifecycle = Promise.withResolvers<BettererSuiteSummary>();

  private constructor(
    public filePaths: BettererFilePaths,
    public runs: BettererRuns
  ) {}

  public static async create(filePaths: BettererFilePaths): Promise<BettererSuiteΩ> {
    const { config, reporter, results, testMetaLoader } = getGlobals();
    const { configPaths, update } = config;

    const expectedTestNames = await results.api.getExpectedTestNames();

    const testsMeta = await testMetaLoader.api.loadTestsMeta(configPaths);
    const runsΩ = await Promise.all(
      testsMeta.map(async (testMeta) => {
        return await BettererRunΩ.create(testMeta, filePaths);
      })
    );

    const testNames = testsMeta.map((testMeta) => testMeta.name);
    const obsoleteTestNames = expectedTestNames.filter((expectedTestName) => !testNames.includes(expectedTestName));

    const obsoleteRuns = await Promise.all(
      obsoleteTestNames.map(async (testName) => {
        const baselineJSON = await results.api.getBaseline(testName);
        const baseline = new BettererResultΩ(JSON.parse(baselineJSON), baselineJSON);
        return new BettererRunObsoleteΩ(reporter, testName, baseline, update);
      })
    );

    return new BettererSuiteΩ(filePaths, [...obsoleteRuns, ...runsΩ]);
  }

  public async run(): Promise<BettererSuiteSummary> {
    const hasOnly = !!this.runs.find((run) => {
      const runΩ = run as BettererRunΩ;
      return runΩ.isOnly;
    });

    const { reporter } = getGlobals();
    const reporterΩ = reporter as BettererReporterΩ;

    // Call the `runStart` reporter hook sequentially for all the tests:
    const reportRunStarts = this.runs.map(async (run) => {
      const runΩ = run as BettererRunΩ;
      const reportRunStart = reporterΩ.runStart(runΩ, runΩ.lifecycle.promise);
      // Don't await here! A custom reporter could be awaiting the lifecycle promise which is unresolved right now!
      // eslint-disable-next-line @typescript-eslint/return-await -- see above
      return reportRunStart;
    });

    const runSummaries = await Promise.all(
      this.runs.map(async (run) => {
        const { config, fs } = getGlobals();

        if (run.isObsolete) {
          const runObsoleteΩ = run as BettererRunObsoleteΩ;

          const runSummary = await runObsoleteΩ.run();

          if (runObsoleteΩ.isRemoved && config.cache) {
            await fs.api.clearCache(runObsoleteΩ.name);
          }

          return runSummary;
        }

        const { filters } = config;

        // This is all a bit backwards because "filters" is named badly.
        const hasFilters = !!filters.length;

        const runΩ = run as BettererRunΩ;

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
              const negativeFilter = new RegExp(filter.source.substring(1), filter.flags);
              return !negativeFilter.test(runΩ.name);
            }
            return selected;
          } else {
            if (isNegated) {
              const negativeFilter = new RegExp(filter.source.substring(1), filter.flags);
              return !negativeFilter.test(runΩ.name);
            }
            return filter.test(runΩ.name);
          }
        }, false);

        const isOtherTestOnly = hasOnly && !runΩ.isOnly;
        const isFiltered = (hasFilters && !isSelected) || isOtherTestOnly;

        const runSummary = await runΩ.run(isFiltered);

        if (config.cache && runΩ.runMeta.isCacheable) {
          const { isBetter, isComplete, isNew, isSame, isUpdated } = runSummary;
          // The cache should update on `isSame` because the files still might have changed:
          if (isBetter || isComplete || isNew || isUpdated || isSame) {
            invariantΔ(runSummary.filePaths, `if a run is cacheable, then the summary will always have file paths!`);
            await fs.api.updateCache(runΩ.testMeta, runSummary.filePaths);
          }
        }

        // `filePaths` will be updated in the worker if the test filters the files
        // so it needs to be updated
        runΩ.filePaths = runSummary.filePaths;

        return runSummary;
      })
    );

    // Call the `runEnd` and `runError` reporter hooks in the same order that they ran:
    await Promise.all(
      runSummaries.map(async (runSummary, index) => {
        const run = this.runs[index];
        const reportRunStart = reportRunStarts[index];

        const runΩ = run as BettererRunΩ;
        if (runSummary.error) {
          const error = runSummary.error;
          runΩ.lifecycle.reject(error);

          // Lifecycle promise is resolved, so it's safe to await
          // the result of `reporter.runStart`:
          await reportRunStart;
          await reporterΩ.runError(runSummary, error as BettererError);
        } else {
          runΩ.lifecycle.resolve(runSummary);

          // Lifecycle promise is resolved, so it's safe to await
          // the result of `reporter.runStart`:
          await reportRunStart;
          await reporterΩ.runEnd(runSummary);
        }
      })
    );

    return new BettererSuiteSummaryΩ(this.filePaths, this.runs, runSummaries);
  }
}

import type { BettererError } from '@betterer/errors';

import type { BettererFileTestResultΩ } from '../test/index.js';
import type { BettererFileResolverΩ } from '../fs/index.js';
import type { BettererFileTestResultSummaryDetails, BettererResultsSummary, BettererResultSummaries } from './types.js';

import { destroyGlobals, getGlobals } from '../globals.js';
import { loadTest } from '../run/index.js';
import { isBettererFileTest } from '../test/index.js';

export class BettererResultsSummaryΩ implements BettererResultsSummary {
  public readonly resultSummaries: BettererResultSummaries;

  private constructor(resultSummaries: BettererResultSummaries, onlyFileTests: boolean) {
    this.resultSummaries = onlyFileTests
      ? resultSummaries.filter((resultSummary) => resultSummary.isFileTest)
      : resultSummaries;
  }

  public static async create(): Promise<BettererResultsSummary> {
    const { config, reporter, resolvers, results, testMetaLoader } = getGlobals();
    const { configPaths, filters, includes, excludes, resultsPath } = config;

    try {
      let testsMeta = await testMetaLoader.api.loadTestsMeta(configPaths);
      if (filters.length) {
        testsMeta = testsMeta.filter((testMeta) => filters.some((filter) => filter.test(testMeta.name)));
      }

      const resolverΩ = resolvers.base as BettererFileResolverΩ;
      resolverΩ.include(...includes);
      resolverΩ.exclude(...excludes);

      const filePaths = await resolverΩ.files();

      const onlyFileTests = includes.length > 0 || excludes.length > 0;

      const testStatuses = await Promise.all(
        testsMeta.map(async (testMeta) => {
          const { name } = testMeta;

          const test = await loadTest(testMeta);

          const isFileTest = isBettererFileTest(test);

          const expectedJSON = await results.api.getExpected(name);
          const serialised = JSON.parse(expectedJSON) as unknown;
          const deserialised = test.config.serialiser.deserialise(serialised, resultsPath);

          if (isFileTest) {
            const resultΩ = deserialised as BettererFileTestResultΩ;
            const details = resultΩ.files
              .filter((file) => !onlyFileTests || filePaths.includes(file.absolutePath))
              .reduce<BettererFileTestResultSummaryDetails>((summary, file) => {
                summary[file.absolutePath] = file.issues;
                return summary;
              }, {});
            return { name, isFileTest, details };
          } else {
            const details = await test.config.printer(deserialised);
            return { name, isFileTest, details };
          }
        })
      );

      return new BettererResultsSummaryΩ(testStatuses, onlyFileTests);
    } catch (error) {
      await reporter.configError?.(config, error as BettererError);
      throw error;
    } finally {
      await destroyGlobals();
    }
  }
}

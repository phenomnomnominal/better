import type { BettererFileGlobs, BettererFilePatterns, BettererFileResolver } from '../../fs/index.js';
import type { BettererRun, BettererWorkerRunΩ } from '../../run/index.js';
import type { BettererFileTestResultΩ } from '../file-test/index.js';
import type { BettererTestOptions } from '../types.js';

import { invariantΔ } from '@betterer/errors';

import { BettererCacheStrategy, BettererFileResolverΩ } from '../../fs/index.js';
import { getGlobals } from '../../globals.js';
import { BettererTest } from '../test.js';
import { checkBaseName } from '../utils.js';

/**
 * @public A very common need for a **Betterer** test is to resolve file paths, and include and exclude files
 * from being tested.
 *
 * `BettererResolverTest` provides a wrapper around {@link @betterer/betterer#BettererTest | `BettererTest` }
 * that makes it easier to implement such a test.
 */
export class BettererResolverTest<
  DeserialisedType = unknown,
  SerialisedType = DeserialisedType,
  DiffType = null
> extends BettererTest<DeserialisedType, SerialisedType, DiffType> {
  /**
   * The file resolver relative to this test's config file.
   */
  public readonly resolver: BettererFileResolver;

  constructor(options: BettererTestOptions<DeserialisedType, SerialisedType, DiffType>) {
    super({
      ...options,
      test: async (run: BettererRun): Promise<DeserialisedType> => {
        const runΩ = run as BettererWorkerRunΩ;

        const { filePaths } = runΩ;
        invariantΔ(filePaths, `\`filePaths\` should always exist for a \`BettererResolverTest\` run!`);

        const resolverΩ = this.resolver as BettererFileResolverΩ;
        // Get the maximal set of files `included()` for the test:
        const testFilePaths = await resolverΩ.files();

        // If there are specified file paths, validate them with the resolver, or just use the full set of included files:
        let runFilePaths = filePaths.length > 0 ? await resolverΩ.validate(filePaths) : testFilePaths;

        let isFullRun = runFilePaths === testFilePaths;

        let hasCached = false;
        if (!run.isNew) {
          const { config } = getGlobals();
          const cacheMisses = config.cache ? await resolverΩ.filterCached(runΩ.testMeta, runFilePaths) : runFilePaths;
          hasCached = cacheMisses.length !== runFilePaths.length;
          isFullRun = isFullRun && !hasCached;
          runFilePaths = cacheMisses;
        }

        // Set the final files back on the `BettererRun`:
        runΩ.setFilePaths(runFilePaths);

        const { config } = getGlobals();
        if (!hasCached && runFilePaths.length === 0 && !config.precommit) {
          await run.logger.info(
            'No relevant files found. Are the `include()`/`exclude()` options for this test correct?'
          );
        }

        const result = (await options.test.call(run, run)) as DeserialisedType;
        if (isFullRun) {
          return result;
        }

        // Get any filePaths that have expected issues but weren't included in this run:
        const expectedΩ = runΩ.expected.value as BettererFileTestResultΩ;
        const excludedFilesWithIssues = expectedΩ.files
          .map((file) => file.absolutePath)
          .filter((filePath) => !filePaths.includes(filePath));

        // Filter them based on the resolver:
        const relevantExcludedFilePaths = await resolverΩ.validate(excludedFilesWithIssues);

        // Add the existing issues to the new result:
        relevantExcludedFilePaths.forEach((filePath) => {
          const resultΩ = result as BettererFileTestResultΩ;
          resultΩ.addExpected(expectedΩ.getFile(filePath));
        });

        return result;
      }
    });
    const { config } = getGlobals();
    this.resolver = new BettererFileResolverΩ(config.basePath);
  }

  /**
   * Add a list of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression } filters for files to exclude when running the test.
   *
   * @param excludePatterns - RegExp filters to match file paths that should be excluded.
   * @returns This {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest`}, so it is chainable.
   */
  public exclude(...excludePatterns: BettererFilePatterns): this {
    const resolverΩ = this.resolver as BettererFileResolverΩ;
    resolverΩ.exclude(...excludePatterns);
    return this;
  }

  /**
   * Add a list of {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob }
   * patterns for files to include when running the test.
   *
   * @param includePatterns - Glob patterns to match file paths that should be included. All
   * `includes` should be relative to the {@link https://phenomnomnominal.github.io/betterer/docs/test-definition-file | test definition file}.
   * @returns This {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest`}, so it is chainable.
   */
  public include(...includePatterns: BettererFileGlobs): this {
    const resolverΩ = this.resolver as BettererFileResolverΩ;
    resolverΩ.include(...includePatterns);
    return this;
  }

  /**
   * Tell **Betterer** how this test should be cached. Currently this handles two different scenarios:
   *
   * * `FilePath` - for when each individual file is independent from all others, e.g. linters
   * * `FilePaths` - for when a group of files must be treated as one unit, e.g. compilers
   *
   * @param strategy - The {@link @betterer/betterer#BettererCacheStrategy} to use.
   * @returns This {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest`}, so it is chainable.
   */
  public cache(strategy: BettererCacheStrategy = BettererCacheStrategy.FilePath): this {
    const resolverΩ = this.resolver as BettererFileResolverΩ;
    resolverΩ.cache(strategy);
    return this;
  }
}

export function isBettererResolverTest(test: unknown): test is BettererResolverTest {
  return !!test && checkBaseName(test.constructor, BettererResolverTest.name);
}

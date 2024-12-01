import type { BettererRun } from '../../run/index.js';
import type {
  BettererFileTestFunction,
  BettererFileTestResult,
  BettererFileTestResultSerialised,
  BettererFilesDiff
} from './types.js';

import { invariantΔ } from '@betterer/errors';

import { BettererResolverTest } from '../resolver-test/index.js';
import { constraint } from './constraint.js';
import { differ } from './differ.js';
import { BettererFileTestResultΩ } from './file-test-result.js';
import { goal } from './goal.js';
import { printer } from './printer.js';
import { progress } from './progress.js';
import { deserialise, serialise } from './serialiser.js';
import { getGlobals } from '../../globals.js';
import { checkBaseName } from '../utils.js';

/**
 * @public A very common usecase for **Betterer** is to track issues across all the files in a
 * project. `BettererFileTest` provides a wrapper around {@link @betterer/betterer#BettererResolverTest | `BettererResolverTest` }
 * that makes it easier to implement such a test.
 *
 * @remarks `BettererFileTest` provides a useful example for the more complex possibilities of the {@link @betterer/betterer#BettererTestOptions | `BettererTestOptions` }
 * interface.
 *
 * @example
 * ```typescript
 * const fileTest = new BettererFileTest(async (filePaths, fileTestResult) => {
 *    await Promise.all(
 *      filePaths.map(async (filePath) => {
 *        const fileContents = await fs.readFile(filePath, 'utf8');
 *        const file = fileTestResult.addFile(filePath, fileContents);
 *        file.addIssue(0, 1, `There's something wrong with this file!`);
 *      })
 *    );
 *  });
 * ```
 *
 * @param fileTest - The test function that will detect issues in specific files.
 */
export class BettererFileTest extends BettererResolverTest<
  BettererFileTestResult,
  BettererFileTestResultSerialised,
  BettererFilesDiff
> {
  constructor(fileTest: BettererFileTestFunction) {
    super({
      test: async (run: BettererRun): Promise<BettererFileTestResultΩ> => {
        const { filePaths } = run;
        invariantΔ(filePaths, `\`filePaths\` should always exist for a \`BettererFileTest\` run!`);

        const { config } = getGlobals();
        const result = new BettererFileTestResultΩ(this.resolver, config.resultsPath);
        await fileTest(filePaths, result, this.resolver);
        return result;
      },
      constraint,
      goal,
      serialiser: { deserialise, serialise },
      differ,
      printer,
      progress
    });
  }
}

export function isBettererFileTest(test: unknown): test is BettererResolverTest {
  return !!test && checkBaseName(test.constructor, BettererFileTest.name);
}

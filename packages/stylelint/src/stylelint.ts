import type { Configuration } from 'stylelint';

import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import { promises as fs } from 'node:fs';
import { lint } from 'stylelint';

/**
 * @public Use this test to incrementally introduce new {@link https://stylelint.io/ | **Stylelint**} rules
 * to your codebase. You can pass as many **Stylelint** {@link https://stylelint.io/user-guide/rules/list/ | rule configurations}
 * as you like:
 *
 * @remarks {@link @betterer/stylelint#stylelint | `stylelint`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { stylelint } from '@betterer/stylelint';
 *
 * export default {
 *   'new stylelint rules': () =>
 *     stylelint({
 *       rules: {
 *         'unit-no-unknown': true,
 *         'property-no-unknown': true
 *       }
 *     })
 *     .include('./src/*.css', './src/*.scss')
 * ```
 *
 * @param configOverrides - Additional {@link https://stylelint.io/ | **Stylelint**} {@link https://stylelint.io/user-guide/configure/#rules | rules}
 * to enable.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `configOverrides`.
 */
export function stylelint(configOverrides: Partial<Configuration>): BettererFileTest {
  // The `stylelint` function could be called from JS code, without type-checking.
  // We *could* change the parameter to be `configOverrides?: Partial<Configuration>`,
  // but that would imply that it was optional, and it isn't.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (!configOverrides) {
    throw new BettererError(
      'for `@betterer/stylelint` to work, you need to provide configuration options, e.g. `{ rules: { "unit-no-unknown": true } }`. ❌'
    );
  }

  return new BettererFileTest(async (filePaths, fileTestResult) => {
    if (!filePaths.length) {
      return;
    }

    const result = await lint({
      files: [...filePaths],
      configOverrides
    });

    await Promise.all(
      result.results.map(async (result) => {
        const contents = await fs.readFile(result.source, 'utf8');
        const resultFile = fileTestResult.addFile(result.source, contents);
        result.warnings.forEach((warning) => {
          const { line, column, text, rule } = warning;
          resultFile.addIssue(line - 1, column - 1, line - 1, column - 1, stylelintIssueMessage(rule, text));
        });
      })
    );
  }).cache();
}

function stylelintIssueMessage(rule: string, message: string) {
  let issueMessage = 'stylelint';
  issueMessage += rule ? `(${rule}): ` : ': ';
  issueMessage += message.replace(new RegExp(`\\W\\(${rule}\\)$`, 'g'), '');
  return issueMessage;
}

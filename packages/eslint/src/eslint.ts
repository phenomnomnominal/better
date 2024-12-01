import type { BettererESLintConfig } from './types.js';

import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import assert from 'node:assert';
import { ESLint } from 'eslint';

/**
 * @public Use this test to incrementally introduce new {@link https://eslint.org/ | **ESLint**} configuration to
 * your codebase.
 *
 * From {@link https://www.npmjs.com/package/@betterer/eslint | `@betterer/eslint@6.0.0``}, this test only works with ESLint's new flat config, so if you are
 * using the old configuration format, you'll need to use an older version of `@betterer/eslint`.
 *
 * @remarks {@link @betterer/eslint#eslint | `eslint`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`},
 * {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`}, {@link @betterer/betterer#BettererTest.only | `only()`},
 * and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { eslint } from '@betterer/eslint';
 *
 * export default {
 *   'new eslint rules': () =>
 *     eslint({
 *       rules: {
 *         'no-debugger': 'error',
 *         'no-unsafe-finally': 'error',
 *       }
 *     })
 *     .include('./src/*.ts')
 * };
 * ```
 *
 * @param config - Additional {@link https://eslint.org/ | **ESLint**} {@link https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects | configuration objects}
 * to enable.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `config`.
 */
export function eslint(...overrideConfig: BettererESLintConfig): BettererFileTest {
  // The `eslint` function could be called from JS code, without type-checking.
  // We *could* change the parameter to be `rules?: BettererESLintRulesConfig`,
  // but that would imply that it was optional, and it isn't.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (!overrideConfig?.length) {
    throw new BettererError(
      "for `@betterer/eslint` to work, you need to provide configuration options, e.g. `{ rules: { 'no-debugger': 'error' } }`. ❌"
    );
  }

  overrideConfig.forEach((config) => {
    if (config.files || config.ignores) {
      throw new BettererError(
        `Please use \`eslint({ ... }).include()\` or \`eslint({ ... }).exclude()\` to control linting extra files, using paths relative to your test definition file.
This makes it easier to configure exactly which files should be checked! ❌`
      );
    }
  });

  return new BettererFileTest(async (filePaths, fileTestResult, resolver) => {
    if (!filePaths.length) {
      return;
    }

    const { baseDirectory } = resolver;
    const runner = new ESLint({ cwd: baseDirectory, overrideConfig });

    const lintResults = await runner.lintFiles([...filePaths]);
    lintResults
      .filter((lintResult) => lintResult.source)
      .forEach((lintResult) => {
        const { messages, source, filePath } = lintResult;
        assert(source);
        const file = fileTestResult.addFile(filePath, source);
        messages.forEach((message) => {
          const { line, column, ruleId } = message;
          const startLine = line - 1;
          const startColumn = column - 1;
          const endLine = message.endLine ? message.endLine - 1 : 0;
          const endColumn = message.endColumn ? message.endColumn - 1 : 0;
          file.addIssue(startLine, startColumn, endLine, endColumn, eslintIssueMessage(ruleId, message.message));
        });
      });
  }).cache();
}

function eslintIssueMessage(ruleId: string | null, message: string) {
  let issueMessage = 'eslint';
  issueMessage += ruleId ? `(${ruleId}): ` : ': ';
  issueMessage += message;
  return issueMessage;
}

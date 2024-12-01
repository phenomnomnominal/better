import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import { tsquery as tsq } from '@phenomnomnominal/tsquery';
import { promises as fs } from 'node:fs';

/**
 * @public Use this test to incrementally remove **TSQuery** matches from your codebase. See the {@link https://github.com/phenomnomnominal/tsquery | **TSQuery** documentation }
 * for more details about the query syntax.
 *
 * @remarks {@link @betterer/tsquery#tsquery | `tsquery`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { tsquery } from '@betterer/tsquery';
 *
 * export default {
 *   'no raw console.log': () =>
 *     tsquery(
 *       'CallExpression > PropertyAccessExpression[expression.name="console"][name.name="log"]'
 *      )
 *      .include('./src/*.ts')
 * };
 * ```
 *
 * @param query - A {@link https://github.com/phenomnomnominal/tsquery | **TSQuery**} query to match.
 *
 * @param issueMessage - A message that describes the issue. Defaults to 'TSQuery match'.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `query`.
 */
export function tsquery(query: string, issueMessage = 'TSQuery match'): BettererFileTest {
  // The `tsquery` function could be called from JS code, without type-checking.
  // We *could* change the parameter to be `query?: string`,
  // but that would imply that it was optional, and it isn't.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (query == null || !query) {
    throw new BettererError(
      "for `@betterer/tsquery` to work, you need to provide a query, e.g. `'CallExpression > PropertyAccessExpression'`. ❌"
    );
  }

  return new BettererFileTest(async (filePaths, fileTestResult) => {
    if (filePaths.length === 0) {
      return;
    }

    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileText = await fs.readFile(filePath, 'utf8');
        const matches = tsq.query(fileText, query);
        if (matches.length === 0) {
          return;
        }
        const file = fileTestResult.addFile(filePath, fileText);
        matches.forEach((match) => {
          file.addIssue(match.getStart(), match.getEnd(), issueMessage);
        });
      })
    );
  }).cache();
}

import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import { promises as fs } from 'node:fs';

/**
 * @public  Use this test to incrementally remove {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp | `RegExp` }
 * matches from your codebase.
 *
 * @remarks {@link regexp | `regexp`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { regexp } from '@betterer/regexp';
 *
 * export default {
 *   'no hack comments': () =>
 *     regexp(/(\/\/\s*HACK)/i)
 *     .include('./src/*.ts')
 * };
 * ```
 *
 * @param pattern - A {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp | `RegExp` }
 * pattern to match.
 *
 * @param issueMessage - A message that describes the issue. Defaults to 'RegExp match'.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `pattern`.
 */
export function regexp(pattern: RegExp, issueMessage = 'RegExp match'): BettererFileTest {
  // The `regexp` function could be called from JS code, without type-checking.
  // We *could* change the parameter to be `pattern?: RegExp`,
  // but that would imply that it was optional, but it isn't.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (!pattern) {
    throw new BettererError('for `@betterer/regexp` to work, you need to provide a RegExp, e.g. `/^foo$/`. ❌');
  }

  return new BettererFileTest(async (filePaths, fileTestResult) => {
    if (!filePaths.length) {
      return;
    }

    pattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    await Promise.all(
      filePaths.map(async (filePath) => {
        const fileText = await fs.readFile(filePath, 'utf8');
        const matches = getFileMatches(pattern, fileText);
        if (matches.length === 0) {
          return;
        }
        const file = fileTestResult.addFile(filePath, fileText);
        matches.forEach((match) => {
          const [matchText] = match;
          const start = match.index;
          file.addIssue(start, start + matchText.length, issueMessage);
        });
      })
    );
  }).cache();
}

function getFileMatches(pattern: RegExp, fileText: string): Array<RegExpExecArray> {
  const matches: Array<RegExpExecArray> = [];

  let currentMatch;
  do {
    currentMatch = pattern.exec(fileText);
    if (currentMatch) {
      matches.push(currentMatch);
    }
  } while (currentMatch);

  return matches;
}

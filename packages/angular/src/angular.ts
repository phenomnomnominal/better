import type { CompilerOptions } from '@angular/compiler-cli';

import { performCompilation, readConfiguration } from '@angular/compiler-cli';
import { BettererFileTest, BettererCacheStrategy } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import ts from 'typescript';

const NEW_LINE = '\n';

/**
 * @public Use this test to incrementally introduce {@link https://angular.io/guide/angular-compiler-options | **Angular** compiler configuration }
 * to your codebase.
 *
 * @remarks {@link angular | `angular`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { angular } from '@betterer/angular';
 *
 * export default {
 *   'stricter template compilation': () =>
 *     angular('./tsconfig.json', {
 *       strictTemplates: true
 *     })
 *     .include('./src/*.ts', './src/*.html')
 * };
 * ```
 *
 * @param configFilePath - The relative path to a tsconfig.json file.
 * @param extraCompilerOptions - Additional {@link https://angular.io/guide/angular-compiler-options | **Angular** compiler configuration }
 * to enable.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `configFilePath` or `extraCompilerOptions`.
 */
export function angular(configFilePath: string, extraCompilerOptions: CompilerOptions): BettererFileTest {
  if (!configFilePath) {
    throw new BettererError(
      "For `@betterer/angular` to work, you need to provide the path to a tsconfig.json file, e.g. `'./tsconfig.json'`. ❌"
    );
  }

  // The `angular` function could be called from JS code, without type-checking.
  // We *could* change the parameter to be `extraCompilerOptions?: CompilerOptions`,
  // but that would imply that it was optional, but it isn't.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above!
  if (!extraCompilerOptions) {
    throw new BettererError(
      'For `@betterer/angular` to work, you need to provide compiler options, e.g. `{ strictTemplates: true }`. ❌'
    );
  }

  // Always has to do the full compile since a .component.html file needs to know about the module it lives in:
  return new BettererFileTest((filePaths, fileTestResult, resolver) => {
    if (filePaths.length === 0) {
      return;
    }

    const absoluteConfigFilePath = resolver.resolve(configFilePath);

    const { rootNames, options } = readConfiguration(absoluteConfigFilePath, extraCompilerOptions);

    const { diagnostics } = performCompilation({
      rootNames,
      options
    });

    diagnostics
      .filter((diagnostic): diagnostic is ts.DiagnosticWithLocation => {
        const { file, start, length } = diagnostic;
        return file != null && start != null && length != null;
      })
      .filter(({ file }) => filePaths.includes(file.fileName))
      .forEach(({ file, start, length, source, messageText }) => {
        const { fileName } = file;
        const resultFile = fileTestResult.addFile(fileName, file.getFullText());
        const message = ts.flattenDiagnosticMessageText(messageText, NEW_LINE);
        resultFile.addIssue(start, start + length, angularIssueMessage(source, message));
      });
  }).cache(BettererCacheStrategy.FilePaths);
}

function angularIssueMessage(source = 'ng', message: string) {
  let issueMessage = source ? `${source}: ` : '';
  issueMessage = `${issueMessage}${message}`;
  return issueMessage;
}

import { CompilerOptions, performCompilation, readConfiguration } from '@angular/compiler-cli';
import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import { DiagnosticWithLocation, flattenDiagnosticMessageText } from 'typescript';

/**
 * {@link https://www.npmjs.com/package/@betterer/angular | `@betterer/angular`}
 *
 * Use this test to incrementally introduce {@link https://angular.io/guide/angular-compiler-options | **Angular** compiler configuration} to your codebase.
 *
 * {@link angular | `angular`} is a {@link BettererFileTest | `BettererFileTest`}, so you can use {@link BettererFileTest.include | `exclude`}, {@link BettererFileTest.exclude | `exclude`}, {@link BettererFileTest.only | `only`}, and {@link BettererFileTest.skip | `skip`}.
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
 * @public
 */
export function angular(configFilePath: string, extraCompilerOptions: CompilerOptions): BettererFileTest {
  if (!configFilePath) {
    throw new BettererError(
      "For `@betterer/angular` to work, you need to provide the path to a tsconfig.json file, e.g. `'./tsconfig.json'`. ❌"
    );
  }
  if (!extraCompilerOptions) {
    throw new BettererError(
      'For `@betterer/angular` to work, you need to provide compiler options, e.g. `{ strictTemplates: true }`. ❌'
    );
  }

  // Always has to do the full compile since a .component.html file needs to know about the module it lives in:
  return new BettererFileTest((_, fileTestResult, resolver) => {
    const absoluteConfigFilePath = resolver.resolve(configFilePath);

    const { rootNames, options } = readConfiguration(absoluteConfigFilePath, extraCompilerOptions);

    const { diagnostics } = performCompilation({
      rootNames,
      options
    });

    diagnostics.forEach((diagnostic) => {
      const { file, start, length } = diagnostic as DiagnosticWithLocation;
      const { fileName } = file;
      const result = fileTestResult.addFile(fileName, file.getFullText());
      const message = flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      result.addIssue(start, start + length, message);
    });
  });
}

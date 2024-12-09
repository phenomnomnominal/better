import type { CompilerOptions, Program } from '@angular/compiler-cli';
import type { DiagnosticWithLocation } from 'typescript';

import { performCompilation, readConfiguration } from '@angular/compiler-cli';
import { BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import { flattenDiagnosticMessageText } from 'typescript';

/**
 * @public Use this test to incrementally introduce {@link https://angular.io/guide/angular-compiler-options | **Angular** compiler configuration }
 * to your codebase.
 *
 * @remarks {@link angular | `angular`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererFileTest.include | `include()`}, {@link @betterer/betterer#BettererFileTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererFileTest.only | `only()`}, and {@link @betterer/betterer#BettererFileTest.skip | `skip()`}.
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
      options,
      gatherDiagnostics: (program: Program) => [
        ...program.getNgOptionDiagnostics(),
        ...program.getNgSemanticDiagnostics(),
        ...program.getNgStructuralDiagnostics(),
        ...program.getTsOptionDiagnostics(),
        ...program.getTsSemanticDiagnostics(),
        ...program.getTsSyntacticDiagnostics(),
      ]
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

import type { Linter } from 'eslint';

/**
 * @public The {@link @betterer/eslint#eslint | `eslint`} test factory takes any number of new ESLint
 * configuration objects.
 *
 * The possible configuration options are extensive, but you can find more information
 * in the {@link https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects | **ESLint** docs.}
 */
export type BettererESLintConfig = Array<Linter.Config>;

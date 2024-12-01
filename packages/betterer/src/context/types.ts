import type { BettererConfig, BettererOptionsOverride } from '../config/index.js';
import type { BettererSuiteSummaries, BettererSuiteSummary } from '../suite/index.js';

/**
 * @public A string or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression }
 * to match file paths that should be excluded from an operation, or an array of them.
 */
export type BettererOptionsExcludes = Array<string | RegExp> | string | RegExp;

/**
 * @public A string or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression }
 * to match the names of relevant tests, or an array of them.
 */
export type BettererOptionsFilters = Array<string | RegExp> | string | RegExp;

/**
 * @public A {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob} pattern
 * to match file paths that should be included in an operation, or an array of them.
 */
export type BettererOptionsIncludes = Array<string> | string;

/**
 * @public **Betterer** options for when running in default mode.
 */
export interface BettererOptionsModeDefault {
  ci?: false;
  precommit?: false;
  strict?: false;
  update?: false;
}

/**
 * @public **Betterer** options for when running in CI mode.
 *
 * @remarks When `ci` is `true`, `strict` must also be `true`, and `precommit` and `update` must be false.
 */
export interface BettererOptionsModeCI {
  ci?: true;
  precommit?: false;
  strict?: true;
  update?: false;
}

/**
 * @public **Betterer** options for when running in precommit mode.
 *
 * @remarks When `precommit` is `true`, `strict` must also be `true`, and `ci` and `update` must be false.
 */
export interface BettererOptionsModePrecommit {
  ci?: false;
  precommit?: true;
  strict?: true;
  update?: false;
}

/**
 * @public **Betterer** options for when running in strict mode.
 *
 * @remarks When `strict` is `true`, `ci`, `precommit` and `update` must be false.
 */
export interface BettererOptionsModeStrict {
  ci?: false;
  precommit?: false;
  strict?: true;
  update?: false;
}

/**
 * @public **Betterer** options for when running in update mode.
 *
 * @remarks When `update` is `true`, `ci`, `precommit` and `strict` must be false.
 */
export interface BettererOptionsModeUpdate {
  ci?: false;
  precommit?: false;
  strict?: false;
  update?: true;
}

/**
 * @public **Betterer** options for when running in watch mode.
 *
 * @remarks In watch mode, `ci`, `precommit`, `strict` and `update` must be false.
 */
export interface BettererOptionsModeWatch {
  ci?: false;
  precommit?: false;
  strict?: false;
  update?: false;
}

/**
 * @public **Betterer** mode options for when running via `betterer()` or `betterer.runner()`.
 */
export type BettererOptionsMode =
  | BettererOptionsModeCI
  | BettererOptionsModeDefault
  | BettererOptionsModePrecommit
  | BettererOptionsModeStrict
  | BettererOptionsModeUpdate;

/**
 * @public **Betterer** options for creating a `BettererContext`.
 *
 * @remarks The options object will be validated by **Betterer** and will be available on the
 * {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export type BettererOptionsContext = BettererOptionsMode & {
  /**
   * A string or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression }
   * to match file paths that should be excluded from the {@link @betterer/betterer#BettererResultsSummary | `BettererResultsSummary`},
   * or an array of them. Will be converted into {@link @betterer/betterer#BettererConfigExcludes | `BettererConfigExcludes`}.
   * @defaultValue `[]`
   */
  excludes?: BettererOptionsExcludes;
  /**
   * A string or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression }
   * to match the names of relevant tests, or an array of them. Will be converted into {@link @betterer/betterer#BettererConfigFilters | `BettererConfigFilters`}.
   * @defaultValue `[]`
   */
  filters?: BettererOptionsFilters;
  /**
   * A {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob} pattern to match
   * file paths that should be included in the {@link @betterer/betterer#BettererResultsSummary | `BettererResultsSummary`},
   * or an array of them.
   * @defaultValue `[]`
   */
  includes?: BettererOptionsIncludes;
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/tests#test-deadline | strict deadlines }
   * are enabled. With strict deadlines, **Betterer** will throw an error if there are any expired tests.
   */
  strictDeadlines?: boolean;
  /**
   * The number of {@link https://nodejs.org/api/worker_threads.html | worker threads } to use when
   * running tests. When `workers` is `true`, **Betterer** will pick a sensible default.
   * When `workers` is `false` **Betterer** will run in a single thread.
   * @defaultValue `true`
   */
  workers?: number | boolean;
};

/**
 * @public Options for when you override the `BettererContext` config via the {@link @betterer/betterer#BettererContext.options | `BettererContext.options()` API}.
 */
export interface BettererOptionsContextOverride {
  /**
   * A string or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expression }
   * to match the names of tests that should be run, or an array of them. Will be converted into {@link @betterer/betterer#BettererConfigFilters | `BettererConfigFilters`}.
   * @defaultValue `[]`
   */
  filters?: BettererOptionsFilters;
}

/**
 * @public An array of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expressions }
 * that match file paths that will be excluded from an operation.
 */
export type BettererConfigExcludes = ReadonlyArray<RegExp>;

/**
 * @public An array of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expressions }
 * that match names of relevant tests.
 */
export type BettererConfigFilters = ReadonlyArray<RegExp>;

/**
 * @public An array of absolute {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob }
 * patterns that match file paths that will be included in an operation.
 */
export type BettererConfigIncludes = ReadonlyArray<string>;

/**
 * @public Full validated config object for a `BettererContext`.
 *
 * @remarks Ths config can be accessed via the {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export interface BettererConfigContext {
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/running-betterer#ci-mode-run-your-tests-and-throw-on-changes | CI mode }
   * is enabled. In CI mode, **Betterer** will throw an error if there is any difference between
   * the test results and the expected results.
   *
   * When `ci` is `true`, `strict` will be `true` and `precommit`, `update` and `watch` will be
   * `false`.
   */
  ci: boolean;
  /**
   * An array of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expressions }
   * that match file paths that will be excluded from {@link @betterer/betterer#BettererFileTest | `BettererFileTest` }
   * runs.
   */
  excludes: BettererConfigExcludes;
  /**
   * An array of {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions | Regular Expressions }
   * that match names of relevant tests.
   */
  filters: BettererConfigFilters;
  /**
   * An array of absolute {@link https://www.npmjs.com/package/glob#user-content-glob-primer | glob }
   * patterns that match file paths that will be included in {@link @betterer/betterer#BettererFileTest | `BettererFileTest` }
   * runs.
   */
  includes: BettererConfigIncludes;
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/running-betterer#precommit-mode | precommit mode }
   * is enabled. In precommit mode, **Betterer** will automatically add the results file to the
   * current commit if it contains any changes.
   *
   * If `ci` is `true`, `precommit` will be `false`. When `precommit` is `true`, `update` and
   * `watch` will be `false`.
   */
  precommit: boolean;
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/running-betterer#strict-mode | strict mode }
   * is enabled. In strict mode, **Betterer** will force `update` to be `false` and will not show the message
   * reminding the user about update mode.
   *
   * If `ci` or `precommit` is `true`, `strict` will be `false`. When `strict` is `true`, `update`
   * and `watch` will be `false`.
   */
  strict: boolean;
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/tests#test-deadline | strict deadlines }
   * are enabled. With strict deadlines, **Betterer** will throw an error if there are any expired tests.
   */
  strictDeadlines: boolean;
  /**
   * When `true`, {@link https://phenomnomnominal.github.io/betterer/docs/running-betterer#update-mode | update mode }
   * is enabled. In update mode, **Betterer** will {@link https://phenomnomnominal.github.io/betterer/docs/updating-results | update the results file},
   * even if the latest test results are worse than the current results.
   *
   * If `ci`, `precommit` or `strict` is `true`, `update` will be `false`. When `update` is `true`,
   * `watch` will be `false`.
   */
  update: boolean;
  /**
   * The number of {@link https://nodejs.org/api/worker_threads.html | worker threads} to use when
   * running **Betterer**.
   */
  workers: number;
}

/**
 * @public The context of a set of test suite runs.
 *
 * @remarks The internal implementation of `BettererContext` is responsible for a lot more than
 * this interface suggests, but we want to minimise the public API surface as much as possible.
 * You can get the `BettererContext` via the {@link @betterer/betterer#BettererReporter | `BettererReporter` }
 * interface.
 *
 * @example
 * ```typescript
 * const myReporter: BettererReporter = {
 *   // Access the context before any tests are run:
 *   contextStart (context: BettererContext) {
 *     // ...
 *   },
 *   // Access the context when something goes wrong:
 *   contextError (context: BettererContext) {
 *     // ...
 *   }
 * }
 * ```
 */
export interface BettererContext {
  /**
   * The {@link @betterer/betterer#BettererConfig | `config`} of the context. You probably don't
   * want to mess with this directly 🔥. If you need to update the config, you should use
   * {@link @betterer/betterer#BettererContext.options | `BettererContext.options()`} instead.
   */
  readonly config: BettererConfig;
  /**
   * Make changes to the context config. The updated config will be used for the next run.
   *
   * @param optionsOverride - The {@link @betterer/betterer#BettererOptionsFilters | `filters`}, {@link @betterer/betterer#BettererOptionsIgnores | `ignores`},
   * and {@link @betterer/betterer#BettererOptionsReporters | `reporters`} to use for the next run.
   */
  options(optionsOverride: BettererOptionsOverride): Promise<void>;
  /**
   * Stop the runner, but first wait for it to finish running the current suite.
   *
   * @returns the {@link @betterer/betterer#BettererContextSummary | `BettererContextSummary`} containing
   * details of all successful runs.
   * @throws the error if something went wrong while stopping everything.
   */
  stop(): Promise<BettererContextSummary>;
}

/**
 * @public The summary of a set of test suite runs.
 *
 * @remarks You can get the `BettererContextSummary` via the {@link @betterer/betterer#BettererReporter | `BettererReporter` }
 * interface.
 *
 * @example
 * ```typescript
 * const myReporter: BettererReporter = {
 *   // Access the summary after the context has ended:
 *   contextEnd (contextSummary: BettererContextSummary) {
 *     // ...
 *   }
 * }
 * ```
 *
 * or by using {@link @betterer/betterer#BettererReporter | `BettererReporter`'s} Promise-based
 * `lifecycle` interface:
 *
 * @example
 * ```typescript
 * const myReporter: BettererReporter = {
 *   // Access the summary after the context has ended:
 *   contextStart (context: BettererContext, lifecycle: Promise<BettererContextSummary>) {
 *     const summary: BettererContextSummary = await lifecycle;
 *     // ...
 *   }
 * }
 * ```
 */
export interface BettererContextSummary {
  /**
   * The {@link @betterer/betterer#BettererConfig | config} of the context.
   */
  readonly config: BettererConfig;
  /**
   * The {@link @betterer/betterer#BettererSuiteSummaries | `BettererSuiteSummaries`} for all test
   * suite runs completed by a context.
   */
  suites: BettererSuiteSummaries;
  /**
   * The {@link @betterer/betterer#BettererSuiteSummary | `BettererSuiteSummary`} for the last test
   * suite run by a context.
   */
  lastSuite: BettererSuiteSummary;
}

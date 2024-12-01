import type { BettererOptionsContext, BettererOptionsMode, BettererOptionsModeWatch } from '../context/index.js';
import type { BettererOptionsFS, BettererOptionsWatcher } from '../fs/index.js';
import type { BettererOptionsReporter } from '../reporters/index.js';
import type { betterer } from './betterer.js';

/**
 * @public Public API for **Betterer**. The types are a bit funky, but it's nice to
 * have the base `betterer()` function with the more specific functions attached.
 */
export type BettererAPI = typeof betterer;

/**
 * @public Options for when you run **Betterer** via the {@link @betterer/betterer#betterer | `betterer()` API}.
 *
 * @remarks The options object will be validated by **Betterer** and turned into a {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export type BettererOptions = BettererOptionsContext &
  BettererOptionsFS &
  BettererOptionsMode &
  BettererOptionsReporter;

/**
 * @public Options for when you create a {@link @betterer/betterer#BettererRunner | `BettererRunner` }
 * via the {@link @betterer/betterer#runner | `betterer.runner()` JS API}.
 *
 * @remarks The options object will be validated by **Betterer** and turned into a {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export type BettererOptionsRunner = BettererOptions;

/**
 * @public Options for when you create a {@link @betterer/betterer#BettererResultsSummary | `BettererResultsSummary` }
 * via the {@link @betterer/betterer#results | `betterer.results()` API}.
 *
 * @remarks The options object will be validated by **Betterer** and turned into a {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export type BettererOptionsResults = Pick<BettererOptionsFS, 'cwd' | 'configPaths' | 'resultsPath'> &
  Pick<BettererOptionsContext, 'excludes' | 'filters' | 'includes'>;

/**
 * @public Options for when you create a {@link @betterer/betterer#BettererRunner | `BettererRunner` }
 * via the {@link @betterer/betterer#watch | `betterer.watch()` JS API}.
 *
 * @remarks The options object will be validated by **Betterer** and turned into a {@link @betterer/betterer#BettererConfig | `BettererConfig`}.
 */
export type BettererOptionsWatch = BettererOptionsContext &
  BettererOptionsFS &
  BettererOptionsModeWatch &
  BettererOptionsReporter &
  BettererOptionsWatcher;

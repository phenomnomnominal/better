import type { BettererSuiteSummary } from '../suite/index.js';
import type { BettererOptions } from './types.js';

import { BettererRunnerΩ } from '../runner/index.js';
import { merge } from './merge.js';
import { results } from './results.js';
import { runner } from './runner.js';
import { watch } from './watch.js';

/**
 * @public Run **Betterer** with the given options.
 *
 * @example
 * ```typescript
 * import { betterer } from '@betterer/betterer';
 *
 * const suiteSummary = await betterer(options);
 * ```
 *
 * @param options - Options for running **Betterer**.
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if something goes wrong while running **Betterer**.
 */
export const betterer = async function betterer(options: BettererOptions = {}): Promise<BettererSuiteSummary> {
  const runner = await BettererRunnerΩ.create(options);
  const contextSummary = await runner.run();
  return contextSummary.lastSuite;
};

betterer.merge = merge;
betterer.results = results;
betterer.runner = runner;
betterer.watch = watch;

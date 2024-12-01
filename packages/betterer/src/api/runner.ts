import type { BettererRunner } from '../runner/index.js';
import type { BettererOptionsRunner } from './types.js';

import { BettererRunnerΩ } from '../runner/index.js';

/**
 * @public Create a **BettererRunner** with the given options.
 *
 * @example
 * ```typescript
 * import { betterer } from '@betterer/betterer';
 *
 * const runner = await betterer.runner(options);
 * ```
 *
 * @param options - Options for creating the runner.
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if something goes wrong while creating the runner.
 */
export function runner(options: BettererOptionsRunner = {}): Promise<BettererRunner> {
  return BettererRunnerΩ.create(options);
}

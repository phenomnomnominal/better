import type { BettererRunner } from '../runner/index.js';
import type { BettererOptionsWatch } from './types.js';

import { BettererRunnerΩ } from '../runner/index.js';

/**
 * @public Create a **BettererRunner** with the given options. Also starts up a file watcher
 * for tracked files in the current working directory.
 *
 * @example
 * ```typescript
 * import { betterer } from '@betterer/betterer';
 *
 * const runner = await betterer.watch(options);
 * ```
 *
 * @param options - Options for creating the runner.
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if something goes wrong while creating the runner or watcher.
 */
export function watch(options: BettererOptionsWatch = {}): Promise<BettererRunner> {
  const { ignores } = options;
  delete options.ignores;
  return BettererRunnerΩ.create({ ...options }, { ignores, watch: true });
}

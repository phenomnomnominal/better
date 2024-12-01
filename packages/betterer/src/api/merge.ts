import type { BettererOptionsMerge } from '../results/index.js';

import { BettererResultsMergerΩ } from '../results/index.js';

/**
 * @public Resolve any merge conflicts in the specified results file.
 *
 * @example
 * ```typescript
 * import { betterer } from '@betterer/betterer';
 *
 * await betterer.merge(options);
 * ```
 *
 * @param options - Options for merging conflicts in the results file.
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if something goes wrong while merging conflicts in the results file.
 */
export async function merge(options: BettererOptionsMerge = {}): Promise<void> {
  try {
    const merger = await BettererResultsMergerΩ.create(options);
    await merger.merge();
  } catch (error) {
    process.exitCode = 1;
    throw error;
  }
}

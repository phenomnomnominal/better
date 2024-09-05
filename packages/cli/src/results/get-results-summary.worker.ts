import type { BettererOptionsResults, BettererResultsSummary } from '@betterer/betterer';

import { betterer } from '@betterer/betterer';
import { exposeToMainΔ } from '@betterer/worker';

export function run(options: BettererOptionsResults): Promise<BettererResultsSummary> {
  return betterer.results(options);
}

exposeToMainΔ({ run });

import { BettererRunSummary, isBettererFileTestΔ } from '@betterer/betterer';

import { fileTestDelta } from './file-test-delta';

export function getDelta(run: BettererRunSummary): string {
  if (isBettererFileTestΔ(run.test)) {
    return fileTestDelta(run.delta) || '';
  }
  return '';
}

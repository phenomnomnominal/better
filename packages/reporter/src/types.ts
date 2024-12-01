import type { BettererRun, BettererRunSummary } from '@betterer/betterer';

export type BettererReporterRun = BettererRun & {
  lifecycle: ReturnType<typeof Promise.withResolvers<BettererRunSummary>>;
};

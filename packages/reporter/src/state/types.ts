import type { BettererContext, BettererContextSummary, BettererSuite, BettererSuiteSummary } from '@betterer/betterer';
import type { BettererTasksState } from '@betterer/tasks';

export interface BettererReporterState extends BettererTasksState {
  context: BettererContext;
  contextSummary?: BettererContextSummary;
  suite?: BettererSuite;
  suiteSummary?: BettererSuiteSummary;
}

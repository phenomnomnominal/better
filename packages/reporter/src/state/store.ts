import type { BettererLog, BettererLogs } from '@betterer/logger';

import type { BettererReporterAction } from './actions.js';
import type { BettererReporterState } from './types.js';

import { invariantΔ } from '@betterer/errors';
import { createContext, useContext, useReducer } from '@betterer/render';
import { getPreciseTimeΔ } from '@betterer/time';

import { CONTEXT_END, RUN_END, RUN_ERROR, RUN_START, SUITE_END, SUITE_ERROR, SUITE_START } from './actions.js';

type BettererReporterLogs = Record<string, BettererLogs>;
type BettererReporterStatus = Record<string, BettererLog>;

export const BettererReporterContext = createContext<
  [BettererReporterState, BettererReporterLogs, BettererReporterStatus] | null
>(null);

export function useReporterState(): [BettererReporterState, BettererReporterLogs, BettererReporterStatus] {
  const context = useContext(BettererReporterContext);
  invariantΔ(context, 'Trying to use `BettererReporterContext` before it was created!');
  return context;
}

export function useStore(
  initialState: BettererReporterState
): [BettererReporterState, React.Dispatch<BettererReporterAction>] {
  return useReducer((state: BettererReporterState, action: BettererReporterAction): BettererReporterState => {
    switch (action.name) {
      case CONTEXT_END: {
        return {
          ...state,
          contextSummary: action.contextSummary
        };
      }

      case RUN_END: {
        const { runSummary } = action;

        // `isFailed` will be handled by `RUN_ERROR`:
        const error = runSummary.isWorse && !runSummary.isUpdated;
        const running = state.running - 1;
        const allDone = running === 0;

        return {
          ...state,

          running,
          done: state.done + 1,
          errors: state.errors + (error ? 1 : 0),
          endTime: allDone ? getPreciseTimeΔ() : null
        };
      }

      case RUN_ERROR: {
        const running = state.running - 1;
        const allDone = running === 0;

        return {
          ...state,
          running,
          done: state.done + 1,
          errors: state.errors + 1,
          endTime: allDone ? getPreciseTimeΔ() : null
        };
      }

      case RUN_START: {
        return {
          ...state,
          running: state.running + 1
        };
      }

      case SUITE_END: {
        return {
          ...state,
          suiteSummary: action.suiteSummary
        };
      }

      case SUITE_ERROR: {
        return {
          ...state,
          suiteSummary: action.suiteSummary
        };
      }

      case SUITE_START: {
        const runsLogs: Record<string, BettererLogs> = {};
        const runsStatus: Record<string, BettererLog> = {};
        action.suite.runs.forEach((run) => {
          runsLogs[run.name] = [];
          runsStatus[run.name] = {};
        });

        return {
          ...state,
          suite: action.suite,
          suiteSummary: void 0,

          done: 0,
          running: 0,
          errors: 0,
          startTime: getPreciseTimeΔ(),
          endTime: null
        };
      }
    }
  }, initialState);
}

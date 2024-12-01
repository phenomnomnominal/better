/**
 * Task runner and logger used within {@link https://github.com/phenomnomnominal/betterer | **Betterer**}.
 *
 * 🚨 THIS PACKAGE SHOULD ONLY BE USED WITHIN THE BETTERER MONOREPO 🚨
 *
 * @packageDocumentation
 */

export type { BettererErrorLogProps } from './error-log.js';
export type {
  BettererTask,
  BettererTaskLoggerProps,
  BettererTaskResultProps,
  BettererTaskState,
  BettererTasksLoggerProps,
  BettererTasksResultProps,
  BettererTasksState,
  BettererTasksStatusUpdate
} from './tasks/index.js';

export { BettererErrorLog } from './error-log.js';
export { BettererLogo } from './logo.js';
export {
  BettererTaskLogger,
  BettererTaskResult,
  BettererTasksLogger,
  BettererTasksResult,
  useTimer
} from './tasks/index.js';

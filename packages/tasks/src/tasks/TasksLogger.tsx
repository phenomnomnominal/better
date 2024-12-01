import type { FC, PropsWithChildren } from '@betterer/render';

import type { BettererTasksStatusUpdate } from './types.js';

import { React, memo, useApp } from '@betterer/render';

import { BettererTasksResult } from './TasksResult.js';
import { BettererTasksContext, useTasksState } from './useTasksState.js';
import { useTimer } from './useTimer.js';

/**
 * @internal This could change at any point! Please don't use!
 *
 * `props` type for {@link BettererTasksLogger | `<BettererTasksLogger/>`}.
 */
export type BettererTasksLoggerProps = PropsWithChildren<{
  /**
   * Whether the Ink renderer instance should quit after the tasks are complete.
   *
   * @remarks Should be set to `false` if the Ink instance is rendering any other components.
   *
   * @defaultValue `true`
   */
  exit?: boolean;
  /**
   * The name of group of task that is shown to the user
   */
  name: string;
  /**
   * An optional hook to customise the output of the task status summary.
   *
   * @defaultValue `() => ${nRunning} tasks running... ${nDone} tasks done! ${nErrored} tasks errored!`
   */
  update?: BettererTasksStatusUpdate;
}>;

/**
 * @internal This could change at any point! Please don't use!
 *
 * Ink component for rendering the output of a set of {@link BettererTask | `BettererTask`s}.
 * The output will update based on the current status of the tasks.
 */
export const BettererTasksLogger: FC<BettererTasksLoggerProps> = memo(function BettererTasksLogger(props) {
  const { children, exit = true, name, update } = props;

  const [state, tasksApi] = useTasksState();
  const { endTime } = state;

  const app = useApp();

  const time = useTimer();

  const hasChildren = Array.isArray(children) ? children.length : !!children;

  if (!hasChildren || endTime != null) {
    if (exit) {
      setImmediate(() => {
        app.exit();
      });
    }
  }

  return (
    <BettererTasksContext.Provider value={tasksApi}>
      <BettererTasksResult {...state} name={name} time={endTime ?? time} update={update}>
        {children}
      </BettererTasksResult>
    </BettererTasksContext.Provider>
  );
});

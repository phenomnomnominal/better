import type { FC } from '@betterer/render';

import type { BettererTask } from './types.js';

import { React, memo, useEffect } from '@betterer/render';

import { useTaskStatus } from './useTaskStatus.js';
import { useTaskLogs } from './useTaskLogs.js';
import { BettererTaskResult } from './TaskResult.js';
import { useTaskState } from './useTasksState.js';

/**
 * @internal This could change at any point! Please don't use!
 *
 * `props` type for {@link BettererTaskLogger | `<BettererTaskLogger/>`}.
 */
export interface BettererTaskLoggerProps {
  /**
   * The name of the task that is shown to the user.
   */
  name: string;
  /**
   * The task to be run.
   */
  task: BettererTask;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * Ink component for rendering the output of a single {@link BettererTask | `BettererTask`}.
 * The output will update based on the status of the task.
 *
 * Once the task is finished, it will output any logging and any errors (if the task failed).
 */
export const BettererTaskLogger: FC<BettererTaskLoggerProps> = memo(function BettererTaskLogger(props) {
  const { name, task } = props;
  const [taskState, taskApi] = useTaskState(name);

  const [status, statusLogger] = useTaskStatus();
  const [logs, logger] = useTaskLogs();

  useEffect(() => {
    void (async () => {
      taskApi.start();
      try {
        const result = await task(logger, statusLogger);

        if (typeof result === 'string') {
          await statusLogger.success(result);
        } else {
          await statusLogger.success('done!');
        }
        taskApi.stop();
      } catch (error) {
        taskApi.error(error as Error);
        await statusLogger.error((error as Error).message);
      }
    })();
  }, [task, logger, statusLogger]);

  if (!taskState) {
    return null;
  }

  const { done, error } = taskState;

  return <BettererTaskResult error={done ? error : null} name={name} status={status} logs={done ? logs : []} />;
});

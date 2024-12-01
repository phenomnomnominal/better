import type { FC, PropsWithChildren } from '@betterer/render';

import type { BettererTaskLog, BettererTasksStatusUpdate } from './types.js';
import type { BettererTasksState } from './useTasksState.js';

import { React, Box, memo } from '@betterer/render';

import { BettererTaskStatus } from './status.js';

/**
 * @internal This could change at any point! Please don't use!
 *
 * `props` type for {@link BettererTasksResult | `<BettererTasksResult/>`}.
 */
export type BettererTasksResultProps = PropsWithChildren<
  BettererTasksState & {
    /**
     * The name of group of task that is shown to the user
     */
    name: string;
    /**
     * The current elapsed time.
     */
    time: number;
    /**
     * An optional hook to customise the output of the task status summary.
     *
     * @defaultValue `() => ${nRunning} tasks running... ${nDone} tasks done! ${nErrored} tasks errored!`
     */
    update?: BettererTasksStatusUpdate;
  }
>;

/**
 * @internal This could change at any point! Please don't use!
 *
 * Ink component for rendering the output of a set of {@link BettererTask | `BettererTask`s}.
 * The output will update based on the current status of the tasks.
 */
export const BettererTasksResult: FC<BettererTasksResultProps> = memo(function BettererTasksResult(props) {
  const { children, errors, endTime, name, startTime, time, update = defaultUpdate } = props;

  const result = update(props);

  let status: BettererTaskLog = ['🌟', 'whiteBright', result];
  if (errors > 0) {
    status = ['💥', 'redBright', result];
  } else if (endTime !== null) {
    status = ['🎉', 'greenBright', result];
  }

  return (
    <Box flexDirection="column">
      {<BettererTaskStatus name={`${name} (${formatTime(startTime, endTime ?? time)}ms)`} status={status} />}
      {children}
    </Box>
  );
});

const FORMATTER = Intl.NumberFormat();

function formatTime(startTime: number, time: number) {
  return FORMATTER.format(Math.floor(time - startTime));
}

function defaultUpdate(state: BettererTasksState): string {
  const { done, errors, running } = state;
  const runningStatus = running ? `${tasks(running)} running... ` : '';
  const doneStatus = done ? `${tasks(done)} done! ` : '';
  const errorStatus = errors ? `${tasks(errors)} errored! ` : '';
  return `${runningStatus}${doneStatus}${errorStatus}`;
}

function tasks(n: number): string {
  return `${String(n)} ${n === 1 ? 'task' : 'tasks'}`;
}

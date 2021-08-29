import { Box, useApp } from 'ink';
import React, { FC, memo, useEffect } from 'react';

import { BettererTaskStatus } from './status';
import { useTasksState, BettererTasksContext, BettererTasksState } from './useTasksState';
import { BettererTaskLog, BettererTasksDone, BettererTasksStatusUpdate } from './types';
import { useTimer } from './useTimer';

export type BettererTasksLoggerProps = {
  exit?: boolean;
  name: string;
  update?: BettererTasksStatusUpdate;
  done?: BettererTasksDone;
};

export const BettererTasksLogger: FC<BettererTasksLoggerProps> = memo(function BettererTasksLogger(props) {
  const { children, done = () => void 0, exit = true, name, update = defaultUpdate } = props;

  const app = useApp();

  const [time, clear] = useTimer();

  const [state, tasks] = useTasksState();
  const { startTime, endTime, errors } = state;

  useEffect(() => {
    if (endTime != null) {
      clear();
    }
  }, [endTime, clear]);

  const result = `${update(state)}`;
  let status: BettererTaskLog = ['🌟', 'whiteBright', result];
  if (errors > 0) {
    status = ['💥', 'redBright', result];
  } else if (endTime !== null) {
    status = ['🎉', 'greenBright', result];
  }

  const hasChildren = Array.isArray(children) ? children.length : !!children;

  if (!hasChildren || endTime != null) {
    if (exit) {
      setImmediate(() => app.exit());
    }
    done();
  }

  return (
    <BettererTasksContext.Provider value={[state, tasks]}>
      <Box flexDirection="column">
        <BettererTaskStatus name={`${name} (${getTime(startTime, endTime || time)}ms)`} status={status} />
        {children}
      </Box>
    </BettererTasksContext.Provider>
  );
});

const FORMATTER = Intl.NumberFormat();

function getTime(startTime: number, time: number) {
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
  return `${n} ${n === 1 ? 'task' : 'tasks'}`;
}

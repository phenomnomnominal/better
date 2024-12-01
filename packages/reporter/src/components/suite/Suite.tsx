import type { BettererSuite } from '@betterer/betterer';
import type { FC } from '@betterer/render';

import { Box, memo, React } from '@betterer/render';
import { BettererTasksResult, useTimer } from '@betterer/tasks';

import { useReporterState } from '../../state/index.js';
import { Run } from './Run.js';
import { update } from './update.js';

/** @knipignore used by an exported function */
export interface SuiteProps {
  suite: BettererSuite;
}

export const Suite: FC<SuiteProps> = memo(function Suite({ suite }) {
  const [state] = useReporterState();
  const time = useTimer();

  return (
    <>
      <Box flexDirection="column" paddingBottom={1}>
        <BettererTasksResult {...state} name="Betterer" time={time} update={update}>
          {suite.runs.map((run) => (
            <Run key={run.name} run={run} />
          ))}
        </BettererTasksResult>
      </Box>
    </>
  );
});

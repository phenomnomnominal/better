import type { BettererRun } from '@betterer/betterer';
import type { FC } from '@betterer/render';

import { memo, React } from '@betterer/render';
import { BettererTaskResult } from '@betterer/tasks';

import { useReporterState } from '../../state/store.js';

/** @knipignore used by an exported function */
export interface RunProps {
  run: BettererRun;
}

export const Run: FC<RunProps> = memo(function Run({ run }) {
  const [, logs, status] = useReporterState();

  const runLogs = logs[run.name];
  const runStatus = status[run.name];

  return <BettererTaskResult error={null} name={run.name} status={runStatus ?? null} logs={runLogs ?? []} />;
});

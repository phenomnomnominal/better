import React, { FC } from 'react';

import {
  BettererContext,
  BettererFilePaths,
  BettererRuns,
  BettererRunSummaries,
  BettererSummaries,
  BettererSummary
} from '@betterer/betterer';
import { BettererLogo } from '@betterer/tasks';
import { Box } from 'ink';

import { DefaultReporter } from './default';
import { WatchReporter } from './watch';

export type ReporterProps = {
  context: BettererContext;
  filePaths?: BettererFilePaths;
  runs?: BettererRuns;
  runSummaries?: BettererRunSummaries;
  summary?: BettererSummary;
  summaries?: BettererSummaries;
};

export const Reporter: FC<ReporterProps> = function Reporter(props: ReporterProps) {
  const { context } = props;

  const ReporterComponent = context.config.watch ? WatchReporter : DefaultReporter;

  return (
    <Box flexDirection="column" paddingBottom={1}>
      <BettererLogo></BettererLogo>
      <ReporterComponent {...props} />
    </Box>
  );
};

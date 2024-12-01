import type { FC } from '@betterer/render';

import { React, memo } from '@betterer/render';

import { useReporterState } from '../../state/index.js';
import { Suite, SuiteSummary } from '../suite/index.js';
import { DefaultFiles } from './DefaultFiles.js';

export const DefaultReporter: FC = memo(function DefaultReporter() {
  const [{ context, contextSummary, suite, suiteSummary }] = useReporterState();

  if (!suite) {
    return null;
  }

  if (context.config.ci && !contextSummary) {
    return null;
  }

  return (
    <>
      {<DefaultFiles filePaths={suite.filePaths} running={!suiteSummary} />}
      {!suiteSummary && <Suite suite={suite} />}
      {suiteSummary && <SuiteSummary context={context} suiteSummary={suiteSummary} />}
    </>
  );
});

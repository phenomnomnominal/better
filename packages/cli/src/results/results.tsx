import type { FC } from '@betterer/render';
import type { BettererOptionsResults, BettererResultsSummary } from '@betterer/betterer';
import type { GetResultsSummaryWorker } from './types.js';

import { React, Box, Text, useApp, useEffect, useState } from '@betterer/render';
import { BettererLogo } from '@betterer/tasks';
import { importWorkerΔ } from '@betterer/worker';

/** @knipignore used by an exported function */
export interface ResultsProps {
  options: BettererOptionsResults;
  logo: boolean;
}

export const Results: FC<ResultsProps> = function Results({ options, logo }) {
  const [resultsSummary, setResultsSummary] = useState<BettererResultsSummary | null>(null);
  useEffect(() => {
    void (async () => {
      const getResultsSummary: GetResultsSummaryWorker = await importWorkerΔ('./get-results-summary.worker.js');
      try {
        setResultsSummary(await getResultsSummary.api.run(options));
      } finally {
        await getResultsSummary.destroy();
      }
    })();
  }, [options]);

  const app = useApp();
  useEffect(() => {
    if (resultsSummary) {
      setImmediate(() => {
        app.exit();
      });
    }
  }, [resultsSummary]);

  return (
    <Box flexDirection="column">
      {logo && <BettererLogo />}
      {resultsSummary && (
        <Box flexDirection="column">
          {resultsSummary.resultSummaries.map((resultSummary) => {
            if (resultSummary.isFileTest) {
              return (
                <Box key={resultSummary.name} flexDirection="column">
                  <Text color="yellowBright">{`${resultSummary.name}: `}</Text>
                  <Box flexDirection="column" paddingTop={1} paddingLeft={2}>
                    {Object.entries(resultSummary.details).map(([filePath, issues]) => {
                      return issues.map((issue, index) => (
                        <Box key={index}>
                          <Text>{issue.message}</Text>
                          <Text> - </Text>
                          <Text color="cyan">{filePath}</Text>
                          <Text>:</Text>
                          <Text color="yellow">{issue.line + 1}</Text>
                          <Text>:</Text>
                          <Text color="yellow">{issue.column}</Text>
                        </Box>
                      ));
                    })}
                  </Box>
                </Box>
              );
            }
            return (
              <Box key={resultSummary.name}>
                <Text color="yellowBright">{`${resultSummary.name}: `}</Text>
                <Text>{resultSummary.details}</Text>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

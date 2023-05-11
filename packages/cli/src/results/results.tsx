import { BettererOptionsResults, BettererResultsSummary } from '@betterer/betterer';
import { React, Box, FC, Text, useApp, useEffect, useState } from '@betterer/render';
import { workerRequire } from '@phenomnomnominal/worker-require';

import { GetResultsSummaryWorker } from './types';
import { BettererLogo } from '@betterer/tasks';

export interface ResultsProps {
  options: BettererOptionsResults;
  logo: boolean;
}

export const Results: FC<ResultsProps> = function Results({ options, logo }) {
  const [resultsSummary, setResultsSummary] = useState<BettererResultsSummary | null>(null);
  useEffect(() => {
    void (async () => {
      const getResultsSummary = workerRequire<GetResultsSummaryWorker>('./get-results-summary');
      try {
        setResultsSummary(await getResultsSummary.run(options));
      } finally {
        await getResultsSummary.destroy();
      }
    })();
  }, [options]);

  const app = useApp();
  useEffect(() => {
    if (resultsSummary) {
      setImmediate(() => app.exit());
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
                    {Object.keys(resultSummary.details).map((filePath) => {
                      const issues = resultSummary.details[filePath];
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

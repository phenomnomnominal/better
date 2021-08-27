import React, { FC } from 'react';

import { BettererError, isBettererError } from '@betterer/errors';
import { Box, Text } from 'ink';

export type BettererErrorLogProps = {
  error: Error | BettererError;
};

export const BettererErrorLog: FC<BettererErrorLogProps> = function BettererErrorLog({ error }) {
  let errors: Array<Error | BettererError> = [];
  let details: Array<string> = [];
  if (isBettererError(error)) {
    errors = error.details.filter((detail) => isError(detail)) as Array<Error | BettererError>;
    details = error.details.filter((detail) => !isError(detail)) as Array<string>;
  }

  return (
    <>
      <Box flexDirection="column" paddingTop={1}>
        <Box>
          <Text color="redBright">Error: </Text>
          <Text>{error.message}</Text>
        </Box>
        {error.stack ? (
          <Box paddingLeft={2}>
            <Text>{processStack(error.stack)}</Text>
          </Box>
        ) : null}
        {details.map((detail, index) => (
          <Box key={index} paddingTop={1}>
            <Text>{detail.trim()}</Text>
          </Box>
        ))}
      </Box>
      {errors.map((error, index) => (
        <BettererErrorLog key={index} error={error} />
      ))}
    </>
  );
};

function isError(value: unknown): value is Error | BettererError {
  return (value as Error).message != null && (value as Error).stack !== null;
}

function processStack(stack: string): string {
  const [, ...stackLines] = stack.split('\n');
  return stackLines.slice(0, 10).join('\n');
}

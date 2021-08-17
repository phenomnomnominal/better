import React, { FC, memo } from 'react';

import { BettererContext, BettererSuite } from '@betterer/betterer';
import { Box, Text } from 'ink';

import { filesChecked, filesChecking } from '../../messages';
import { Config, ConfigEditField } from '../config';

export type WatchFilesProps = {
  context: BettererContext;
  editField: ConfigEditField;
  suite: BettererSuite;
  running: boolean;
};

export const WatchFiles: FC<WatchFilesProps> = memo(function WatchFiles(props) {
  const { context, editField, suite, running } = props;
  const { filePaths } = suite;

  return (
    <>
      <Config context={context} editField={editField} />
      {filePaths?.length ? (
        <>
          <Box paddingBottom={1}>
            <Text>{running ? filesChecking(filePaths.length) : filesChecked(filePaths.length)}</Text>
          </Box>
          <Box flexDirection="column" paddingBottom={1}>
            {filePaths.map((filePath) => (
              <Text key={filePath}>・ {filePath}</Text>
            ))}
          </Box>
        </>
      ) : null}
    </>
  );
});

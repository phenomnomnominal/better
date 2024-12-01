import type { BettererFilePaths } from '@betterer/betterer';

import type { FC } from '@betterer/render';

import { Box, React, Text, memo } from '@betterer/render';

import { filesChecked, filesChecking } from '../../messages.js';

/** @knipignore used by an exported function */
export interface DefaultFilesProps {
  filePaths: BettererFilePaths;
  running: boolean;
}
export const DefaultFiles: FC<DefaultFilesProps> = memo(function DefaultFiles(props) {
  const { filePaths, running } = props;

  if (!filePaths.length) {
    return null;
  }

  return (
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
  );
});

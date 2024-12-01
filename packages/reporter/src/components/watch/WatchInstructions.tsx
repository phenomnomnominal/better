import type { FC } from '@betterer/render';

import type { ConfigEditField } from '../config/Config.js';

import { React, Box, Text, memo } from '@betterer/render';

/** @knipignore used by an exported function */
export interface WatchFilesProps {
  editField: ConfigEditField;
}

export const WatchInstructions: FC<WatchFilesProps> = memo(function WatchInstructions(props) {
  const quitCommands = `"ctrl+c"${props.editField ? '' : ' or "q"'}`;
  return (
    <Box paddingBottom={1}>
      <Text>(press {quitCommands} to quit)</Text>
    </Box>
  );
});

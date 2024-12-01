import type { BettererContext } from '@betterer/betterer';
import type { FC } from '@betterer/render';

import type { ConfigEditField } from '../config/index.js';

import { React, Box, Text, memo } from '@betterer/render';

import { watchStart } from '../../messages.js';
import { Config } from '../config/index.js';
import { WatchInstructions } from './WatchInstructions.js';

/** @knipignore used by an exported function */
export interface WatchStartingProps {
  context: BettererContext;
  editField: ConfigEditField;
}

export const WatchStarting: FC<WatchStartingProps> = memo(function WatchStarting(props) {
  const { context, editField } = props;

  return (
    <Box flexDirection="column">
      <Config context={context} editField={editField} />
      <Box paddingBottom={1}>
        <Text>{watchStart()}</Text>
      </Box>
      <WatchInstructions editField={editField} />
    </Box>
  );
});

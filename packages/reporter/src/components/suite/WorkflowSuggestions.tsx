import type { FC } from '@betterer/render';

import { Box, Link, React, Text } from '@betterer/render';
import { workflowLink, workflowSuggestions } from '../../messages.js';

export const WorkflowSuggestions: FC = () => {
  return (
    <Box marginTop={1} flexDirection="column">
      <Text>{workflowSuggestions()}</Text>
      <Box marginTop={1} marginLeft={4}>
        <Link url={workflowLink()} fallback={process.env.TEST !== 'true'}>
          <Text color="yellowBright">Workflow Documentation</Text>
        </Link>
      </Box>
    </Box>
  );
};

import type { FC } from '@betterer/render';

import { React, Text } from '@betterer/render';

const LOGO = `
   \\ | /     _         _   _                     
 '-.ooo.-'  | |__  ___| |_| |_ ___ _ __ ___ _ __ 
---ooooo--- | '_ \\/ _ \\ __| __/ _ \\ '__/ _ \\ '__|
 .-'ooo'-.  | |_)|  __/ |_| ||  __/ | |  __/ |   
   / | \\    |_.__/\\___|\\__|\\__\\___|_|  \\___|_|   
 `;

/**
 * @internal This could change at any point! Please don't use!
 *
 * Ink component for rendering an ASCII version of the {@link https://github.com/phenomnomnominal/betterer | **Betterer**}
 * logo.
 */
export const BettererLogo: FC = function BettererLogo() {
  return <Text color="yellowBright">{LOGO}</Text>;
};

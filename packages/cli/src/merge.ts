import type { BettererOptionsMerge } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIMergeConfig } from './types';

import { betterer } from '@betterer/betterer';

import { mergeCommand, setEnv } from './options';

/**
 * Run the **Betterer** `merge` command to resolve any merge conflicts in the
 * specified results file.
 */
export function merge(cwd: string): Command {
  const command = mergeCommand();
  command.description('merge the Betterer results file');
  command.action(async (config: BettererCLIMergeConfig, command: Command): Promise<void> => {
    setEnv(config);

    // Mark options as unknown...
    const options: unknown = {
      contents: command.args,
      cwd,
      resultsPath: config.results
    };

    try {
      await betterer.merge(options as BettererOptionsMerge);
    } catch {
      process.exitCode = 1;
    }
  });

  return command;
}

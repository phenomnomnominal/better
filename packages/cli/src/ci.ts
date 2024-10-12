import type { BettererOptions } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIConfig } from './types.js';

import { betterer } from '@betterer/betterer';

import { ciCommand } from './options.js';

/**
 * Run **Betterer** in `ci` mode.
 */
export function ci(cwd: string): Command {
  const command = ciCommand();
  command.description('run Betterer in CI mode');
  command.action(async (config: BettererCLIConfig, command: Command): Promise<void> => {
    // Cast the options to BettererOptions. This is possibly invalid,
    // but it's nicer to do the validation in @betterer/betterer
    const { error } = await betterer({
      cache: config.cache,
      cachePath: config.cachePath,
      ci: true,
      configPaths: config.config,
      cwd,
      excludes: config.exclude,
      filters: config.filter,
      includes: command.args,
      logo: config.logo,
      reporters: config.reporter,
      resultsPath: config.results,
      silent: config.silent,
      strictDeadlines: config.strictDeadlines,
      workers: config.workers
    } as BettererOptions);

    if (error) {
      throw error;
    }
  });

  return command;
}

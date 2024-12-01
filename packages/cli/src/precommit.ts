import type { BettererOptions } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIConfig } from './types.js';

import { betterer } from '@betterer/betterer';

import { precommitCommand } from './options.js';

/**
 * Run **Betterer** in `precommit` mode.
 */
export function precommit(cwd: string): Command {
  const command = precommitCommand();
  command.description('run Betterer in precommit mode');
  command.action(async (config: BettererCLIConfig, command: Command): Promise<void> => {
    // Cast the options to BettererOptions. This is possibly invalid,
    // but it's nicer to do the validation in @betterer/betterer
    const { error } = await betterer({
      basePath: config.basePath,
      cache: config.cache,
      cachePath: config.cachePath,
      configPaths: config.config,
      cwd,
      excludes: config.exclude,
      filters: config.filter,
      includes: command.args,
      logo: config.logo,
      precommit: true,
      reporters: config.reporter,
      repoPath: config.repoPath,
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

import type { BettererOptions } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIConfig } from './types.js';

import { betterer } from '@betterer/betterer';

import { startCommand } from './options.js';

/**
 * Run **Betterer** in the default mode.
 */
export function start(cwd: string, ci: boolean): Command {
  const command = startCommand();
  command.description('run Betterer');
  command.action(async (config: BettererCLIConfig, command: Command): Promise<void> => {
    // Cast the options to BettererOptions. This is possibly invalid,
    // but it's nicer to do the validation in @betterer/betterer
    const { error } = await betterer({
      basePath: config.basePath,
      cache: config.cache,
      cachePath: config.cachePath,
      configPaths: config.config,
      ci,
      cwd,
      excludes: config.exclude,
      filters: config.filter,
      includes: command.args,
      logo: config.logo,
      reporters: config.reporter,
      repoPath: config.repoPath,
      resultsPath: config.results,
      silent: config.silent,
      strict: config.strict,
      strictDeadlines: config.strictDeadlines,
      update: config.update,
      workers: config.workers
    } as BettererOptions);

    if (error) {
      throw error;
    }
  });
  return command;
}

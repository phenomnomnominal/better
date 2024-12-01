import type { BettererOptionsWatch } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIConfig } from './types.js';

import { betterer } from '@betterer/betterer';

import { watchCommand } from './options.js';

/**
 * Run **Betterer** in `watch` mode.
 */
export function watch(cwd: string): Command {
  const command = watchCommand();
  command.description('run Betterer in watch mode');
  command.action(async (config: BettererCLIConfig): Promise<void> => {
    // Cast the options to BettererOptions. This is possibly invalid,
    // but it's nicer to do the validation in @betterer/betterer
    await betterer.watch({
      basePath: config.basePath,
      cache: config.cache,
      cachePath: config.cachePath,
      configPaths: config.config,
      cwd,
      filters: config.filter,
      ignores: config.ignore,
      logo: config.logo,
      reporters: config.reporter,
      repoPath: config.repoPath,
      resultsPath: config.results,
      silent: config.silent,
      workers: config.workers
    } as BettererOptionsWatch);
  });
  return command;
}

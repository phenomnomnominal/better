import type { BettererOptionsResults } from '@betterer/betterer';
import type { Command } from 'commander';

import type { BettererCLIResultsConfig } from './types.js';

import { React, getRenderOptionsΔ, render } from '@betterer/render';

import { resultsCommand } from './options.js';
import { Results } from './results/results.js';

/**
 * Run the **Betterer** `results` command to see the status of the {@link @betterer/betterer#BettererTest | `BettererTest`s}
 * in a project.
 */
export function results(cwd: string): Command {
  const command = resultsCommand();
  command.description();
  command.action(async (config: BettererCLIResultsConfig, command: Command): Promise<void> => {
    // Mark options as unknown...
    const options: unknown = {
      basePath: config.basePath,
      configPaths: config.config,
      cwd,
      excludes: config.exclude,
      filters: config.filter,
      includes: command.args,
      repoPath: config.repoPath,
      resultsPath: config.results
    };

    // And then cast to BettererOptionsResults. This is possibly invalid,
    // but it's nicer to do the options validation in @betterer/betterer
    const app = render(
      <Results options={options as BettererOptionsResults} logo={config.logo} />,
      getRenderOptionsΔ(process.env.NODE_ENV)
    );
    await app.waitUntilExit();
  });
  return command;
}

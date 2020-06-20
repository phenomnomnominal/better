import { BettererStats, betterer } from '@betterer/betterer';
import * as commander from 'commander';

import { startOptions } from './options';
import { CLIArguments, CLIStartConfig } from './types';

export function start(cwd: string, argv: CLIArguments): Promise<BettererStats> {
  startOptions(commander);

  commander.parse(argv as Array<string>);

  const { config, results, filter, tsconfig, update } = (commander as unknown) as CLIStartConfig;

  return betterer({
    configPaths: config,
    cwd,
    filters: filter,
    resultsPath: results,
    tsconfigPath: tsconfig,
    update
  });
}

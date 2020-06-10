import { betterer } from '@betterer/betterer';
import * as commander from 'commander';

import { watchOptions } from './options';
import { CLIArguments, CLIWatchConfig } from './types';

export async function watch(cwd: string, argv: CLIArguments): Promise<void> {
  watchOptions(commander);

  commander.parse(argv as Array<string>);

  const { config, results, filter, ignore, tsconfig } = (commander as unknown) as CLIWatchConfig;

  const watcher = await betterer.watch({
    configPaths: config,
    cwd,
    filters: filter,
    ignores: ignore,
    resultsPath: results,
    tsconfigPath: tsconfig
  });

  return new Promise((): void => {
    process.on('SIGINT', () => {
      watcher.stop();
    });
  });
}

import { BettererSummary, betterer } from '@betterer/betterer';

import { startOptions } from './options';
import { BettererCLIArguments } from './types';

export function startΔ(cwd: string, argv: BettererCLIArguments): Promise<BettererSummary> {
  const { config, results, filter, silent, reporter, tsconfig, update } = startOptions(argv);

  return betterer({
    configPaths: config,
    cwd,
    filters: filter,
    reporters: reporter,
    resultsPath: results,
    silent,
    tsconfigPath: tsconfig,
    update
  });
}

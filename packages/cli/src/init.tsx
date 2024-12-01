import type { Command } from 'commander';

import type { BettererCLIInitConfig } from './types.js';

import { React, getRenderOptionsΔ, render } from '@betterer/render';
import path from 'node:path';

import { Init } from './init/init.js';
import { initCommand } from './options.js';

const BETTERER_TS = './.betterer.ts';
const BETTERER_RESULTS = './.betterer.results';

/**
 * Run the **Betterer** `init` command to initialise **Betterer** in a new project.
 */
export function init(cwd: string): Command {
  const command = initCommand();
  command.description('init Betterer in a project');
  command.action(async (config: BettererCLIInitConfig): Promise<void> => {
    const finalConfig = config.config || BETTERER_TS;
    const finalRepo = config.repoPath || cwd;
    const finalResults = config.results || BETTERER_RESULTS;

    const ext = path.extname(finalConfig);
    const ts = ext === path.extname(BETTERER_TS);

    const app = render(
      <Init
        automerge={config.automerge}
        configPath={finalConfig}
        cwd={cwd}
        logo={config.logo}
        repoPath={finalRepo}
        resultsPath={finalResults}
        ts={ts}
      />,
      getRenderOptionsΔ(process.env.NODE_ENV)
    );
    await app.waitUntilExit();
  });

  return command;
}

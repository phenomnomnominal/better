import React from 'react';

import { render } from 'ink';
import path from 'path';

import { Init } from './init/init';
import { initOptions } from './options';
import { BettererCLIArguments } from './types';

const BETTERER_TS = './.betterer.ts';
const BETTERER_RESULTS = './.betterer.results';
const TS_EXTENSION = '.ts';

/**
 * @internal This could change at any point! Please don't use!
 *
 * Run the **Betterer** `init` command to initialise **Betterer** in a new project.
 */
export async function init__(cwd: string, argv: BettererCLIArguments): Promise<void> {
  const RENDER_OPTIONS = {
    debug: process.env.NODE_ENV === 'test'
  };

  const { automerge, config, results } = initOptions(argv);

  const finalConfig = config || BETTERER_TS;
  const finalResults = results || BETTERER_RESULTS;
  const ext = path.extname(finalConfig);
  const ts = ext === TS_EXTENSION;

  const app = render(
    <Init automerge={automerge} configPath={finalConfig} cwd={cwd} resultsPath={finalResults} ts={ts} />,
    RENDER_OPTIONS
  );
  await app.waitUntilExit();
}

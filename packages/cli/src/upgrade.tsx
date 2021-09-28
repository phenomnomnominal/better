import React from 'react';

import { render } from 'ink';

import { Upgrade } from './upgrade/upgrade';
import { upgradeOptions } from './options';
import { BettererCLIArguments } from './types';

/** @internal Definitely not stable! Please don't use! */
export async function upgradeΔ(cwd: string, argv: BettererCLIArguments): Promise<void> {
  const RENDER_OPTIONS = {
    debug: process.env.NODE_ENV === 'test'
  };

  const { config, save } = upgradeOptions(argv);

  const configPaths = config ? config : ['./.betterer.ts'];

  const app = render(<Upgrade configPaths={configPaths} cwd={cwd} save={save} />, RENDER_OPTIONS);
  await app.waitUntilExit();
}

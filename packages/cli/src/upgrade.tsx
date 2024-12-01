import type { Command } from 'commander';
import type { BettererConfigPaths } from '@betterer/betterer';

import type { BettererCLIUpgradeConfig } from './types.js';

import { React, getRenderOptionsΔ, render } from '@betterer/render';

import { Upgrade } from './upgrade/upgrade.js';
import { upgradeCommand } from './options.js';

const DEFAULT_CONFIG_PATHS: BettererConfigPaths = ['./.betterer.ts'];

/**
 * Run the **Betterer** `upgrade` command to upgrade **Betterer** in an existing project.
 */
export function upgrade(cwd: string): Command {
  const command = upgradeCommand();
  command.description('upgrade Betterer files in a project');
  command.action(async (config: BettererCLIUpgradeConfig): Promise<void> => {
    const configPaths = config.config ? config.config : DEFAULT_CONFIG_PATHS;

    const app = render(
      <Upgrade configPaths={configPaths as BettererConfigPaths} cwd={cwd} save={config.save} logo={config.logo} />,
      getRenderOptionsΔ(process.env.NODE_ENV)
    );
    await app.waitUntilExit();
  });

  return command;
}

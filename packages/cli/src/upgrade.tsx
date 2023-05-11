import { React, render } from '@betterer/render';
import { Command } from 'commander';

import { Upgrade } from './upgrade/upgrade';
import { setEnv, upgradeCommand } from './options';
import { getRenderOptions } from './render';
import { BettererCLIUpgradeConfig } from './types';

/**
 * Run the **Betterer** `upgrade` command to upgrade **Betterer** in an existing project.
 */
export function upgrade(cwd: string): Command {
  const command = upgradeCommand();
  command.description('upgrade Betterer files in a project');
  command.action(async (config: BettererCLIUpgradeConfig): Promise<void> => {
    setEnv(config);

    const configPaths = config.config ? config.config : ['./.betterer.ts'];

    const app = render(
      <Upgrade configPaths={configPaths} cwd={cwd} save={config.save} logo={config.logo} />,
      getRenderOptions()
    );
    await app.waitUntilExit();
  });

  return command;
}

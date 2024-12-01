import type { WorkspaceFolder } from 'vscode';

import fs from 'node:fs';
import path from 'node:path';
import { window, workspace } from 'vscode';

import { EXTENSION_NAME } from '../../constants.js';
import { ALREADY_CONFIGURED, INIT_COMMAND_REQUIRES_WORKSPACE } from '../error-messages.js';
import { error, info } from '../logger.js';
import { pickFolder } from './folder-picker.js';

const CONFIG_FILES = ['.betterer.ts', '.betterer.js'];

export async function initBetterer(): Promise<void> {
  const { workspaceFolders } = workspace;
  if (!workspaceFolders) {
    void error(INIT_COMMAND_REQUIRES_WORKSPACE);
    return;
  }

  const foldersWithoutConfig = workspaceFolders.filter((folder) =>
    CONFIG_FILES.every((configFile) => {
      return !fs.existsSync(path.join(folder.uri.fsPath, configFile));
    })
  );

  if (foldersWithoutConfig.length === 0) {
    void info(ALREADY_CONFIGURED(workspaceFolders));
    return;
  }

  let folder: WorkspaceFolder | null = null;
  if (foldersWithoutConfig.length === 1) {
    [folder] = workspaceFolders;
  } else {
    folder = await pickFolder(foldersWithoutConfig, `Select a workspace folder to initialise ${EXTENSION_NAME} in:`);
  }

  if (!folder) {
    return;
  }

  const terminal = window.createTerminal({ name: `${EXTENSION_NAME} init`, cwd: folder.uri.fsPath });
  terminal.sendText(`npm_config_yes=true npx @betterer/cli init`);
  terminal.show();
}

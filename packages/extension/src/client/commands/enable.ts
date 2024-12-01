import type { WorkspaceFolder } from 'vscode';

import { workspace } from 'vscode';

import { EXTENSION_NAME } from '../../constants.js';
import { ALREADY_ENABLED, ENABLE_COMMAND_REQUIRES_WORKSPACE } from '../error-messages.js';
import { error, info } from '../logger.js';
import { enable, getEnabled } from '../settings.js';
import { pickFolder } from './folder-picker.js';

export async function enableBetterer(): Promise<void> {
  const { workspaceFolders } = workspace;
  if (!workspaceFolders) {
    void error(ENABLE_COMMAND_REQUIRES_WORKSPACE);
    return;
  }

  const disabledFolders = workspaceFolders.filter((folder) => !getEnabled(folder));
  if (disabledFolders.length === 0) {
    void info(ALREADY_ENABLED(workspaceFolders));
    return;
  }

  let folder: WorkspaceFolder | null = null;
  if (disabledFolders.length === 1) {
    [folder] = disabledFolders;
  } else {
    folder = await pickFolder(disabledFolders, `Select a workspace folder to enable ${EXTENSION_NAME} in:`);
  }

  if (!folder) {
    return;
  }
  enable(folder);
  return;
}

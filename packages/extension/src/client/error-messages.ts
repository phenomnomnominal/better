import type { WorkspaceFolder } from 'vscode';

import { EXTENSION_NAME } from '../constants.js';

const NAME = EXTENSION_NAME;
const BETTERER_TS = `.betterer.ts`;

const COMMAND_REQUIRES_WORKSPACE = `if VS Code is opened on a workspace folder.`;

export const DISABLE_COMMAND_REQUIRES_WORKSPACE = `${NAME} can only be disabled ${COMMAND_REQUIRES_WORKSPACE}`;
export const ENABLE_COMMAND_REQUIRES_WORKSPACE = `${NAME} can only be enabled ${COMMAND_REQUIRES_WORKSPACE}`;
export const INIT_COMMAND_REQUIRES_WORKSPACE = `${NAME} can only be initialised ${COMMAND_REQUIRES_WORKSPACE}`;

export const ALREADY_ENABLED = (workspaceFolders: ReadonlyArray<WorkspaceFolder>): string =>
  `${NAME} is already enabled in ${workspaceFolders.length === 1 ? 'the workspace' : 'all workspaces'}.`;

export const ALREADY_DISABLED = (workspaceFolders: ReadonlyArray<WorkspaceFolder>): string =>
  `${NAME} is already disabled in ${workspaceFolders.length === 1 ? 'the workspace' : 'all workspaces'}.`;

export const ALREADY_CONFIGURED = (workspaceFolders: ReadonlyArray<WorkspaceFolder>): string =>
  workspaceFolders.length === 1 ? `The workspace already uses ${NAME}.` : `All workspaces already use ${NAME}.`;

const DISABLE_FOR_WORKSPACE = (workspaceFolder: WorkspaceFolder): string => {
  const { name } = workspaceFolder;
  return `Alternatively you can disable ${NAME} for the workspace folder "${name}" by executing the 'Disable ${NAME}' command`;
};

const SEE_OUTPUT_CHANNEL = `See the ${NAME} output channel for details.`;

export const BETTERER_OUTPUT_CHANNEL = `Open ${NAME} output channel`;

export const BETTERER_CONFIG_FILE_INVALID = `Failed to load ${NAME} config. ${SEE_OUTPUT_CHANNEL}.`;
export const BETTERER_CONFIG_FILE_INVALID_DETAILS = (workspaceFolder: WorkspaceFolder): string => {
  return `

Invalid ${NAME} configuration file (e.g. ${BETTERER_TS}) found for workspace: ${workspaceFolder.name}
The workspace will not be validated. Consider executing the 'Initialise ${NAME}' command to add ${NAME} to the workspace.

${DISABLE_FOR_WORKSPACE(workspaceFolder)}
  `;
};

export const BETTERER_LIBRARY_NOT_INSTALLED = `Failed to load ${NAME} library. ${SEE_OUTPUT_CHANNEL}.`;
export const BETTERER_LIBRARY_NOT_INSTALLED_DETAILS = (workspaceFolder: WorkspaceFolder): string => {
  return `

To use ${NAME} please install it by running "npm install @betterer/cli -D" in the workspace folder "${
    workspaceFolder.name
  }".
You will need to reopen the workspace after installing ${NAME}.

${DISABLE_FOR_WORKSPACE(workspaceFolder)}
  `;
};

export const CLIENT_START_FAILED = `The ${NAME} extension couldn't be started. 🔥 ${SEE_OUTPUT_CHANNEL}`;
export const SERVER_START_FAILED = `The ${NAME} server couldn't be started. 🔥 ${SEE_OUTPUT_CHANNEL}`;
export const SERVER_PROCESS_ENDED = (code: number): string =>
  `Server process exited with code "${String(code)}". 💥 This usually indicates an invalid ${NAME} configuration.`;
export const SERVER_PROCESS_SHUT_DOWN = `The ${NAME} server shut down itself. 💥 ${SEE_OUTPUT_CHANNEL}`;

import type { ExtensionContext, Uri } from 'vscode';

import { workspace } from 'vscode';

const NO_LIBRARY_STATE_KEY = 'noLibraryMessageAlreadyShown';
const INVALID_CONFIG_STATE_KEY = 'invalidConfigMessageAlreadyShown';

type Workspaces = Record<string, boolean>;
interface State {
  workspaces: Workspaces;
}

export const getNoLibraryState = getState(NO_LIBRARY_STATE_KEY);
export const getInvalidConfigState = getState(INVALID_CONFIG_STATE_KEY);

function getState(key: string) {
  return function (context: ExtensionContext, uri: Uri): boolean {
    const { workspaces } = context.globalState.get<State>(key, { workspaces: {} });
    const workspaceFolder = workspace.getWorkspaceFolder(uri);
    if (!workspaceFolder) {
      return false;
    }
    const workspaceUri = workspaceFolder.uri.toString();
    const result = workspaces[workspaceUri];
    workspaces[workspaceUri] = true;
    void context.globalState.update(key, { workspaces });
    return !!result;
  };
}

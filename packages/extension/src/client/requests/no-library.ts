import type { ExtensionContext } from 'vscode';
import type { LanguageClient } from 'vscode-languageclient/node';

import type { BettererRequestParams } from './types.js';

import { Uri, workspace } from 'vscode';
import { RequestType } from 'vscode-languageclient/node';

import {
  BETTERER_LIBRARY_NOT_INSTALLED,
  BETTERER_LIBRARY_NOT_INSTALLED_DETAILS,
  BETTERER_OUTPUT_CHANNEL
} from '../error-messages.js';
import { info } from '../logger.js';
import { getNoLibraryState } from './state.js';

export const BettererNoLibraryRequest = new RequestType<BettererRequestParams, void, void>('betterer/noLibrary');

export async function noLibrary(
  client: LanguageClient,
  context: ExtensionContext,
  params: BettererRequestParams
): Promise<void> {
  const uri = Uri.parse(params.source.uri);
  const workspaceFolder = workspace.getWorkspaceFolder(uri);
  if (!workspaceFolder) {
    return;
  }
  const alreadyShown = getNoLibraryState(context, uri);
  if (!alreadyShown) {
    client.info(BETTERER_LIBRARY_NOT_INSTALLED_DETAILS(workspaceFolder));
    const item = await info(BETTERER_LIBRARY_NOT_INSTALLED, {
      title: BETTERER_OUTPUT_CHANNEL
    });
    if (item) {
      client.outputChannel.show(true);
    }
  }
}

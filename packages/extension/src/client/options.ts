import type { ExtensionContext } from 'vscode';
import type {
  ErrorHandler,
  InitializationFailedHandler,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

import path from 'node:path';
import { workspace } from 'vscode';
import { RevealOutputChannelOn, TransportKind } from 'vscode-languageclient/node';

import { EXTENSION_NAME } from '../constants.js';
import { getRuntime } from './settings.js';

export function getServerOptions(context: ExtensionContext): ServerOptions {
  const serverModule = context.asAbsolutePath(path.join('dist', 'server', 'server.js'));

  const runtime = getRuntime();
  const cwd = process.cwd();
  return {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      runtime,
      options: { cwd }
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      runtime,
      options: { execArgv: ['--nolazy', '--inspect=6060'], cwd }
    }
  };
}

export interface ClientErrorHandlers {
  closed: ErrorHandler['closed'];
  error: ErrorHandler['error'];
  initFailed: InitializationFailedHandler;
}

export function getClientOptions(errorHandlers: ClientErrorHandlers): LanguageClientOptions {
  const { initFailed, error, closed } = errorHandlers;
  return {
    documentSelector: [{ scheme: 'file' }],
    diagnosticCollectionName: EXTENSION_NAME,
    revealOutputChannelOn: RevealOutputChannelOn.Error,
    synchronize: {
      fileEvents: [
        workspace.createFileSystemWatcher('**/.bettere{r.js,r.ts}'),
        workspace.createFileSystemWatcher('**/package.json')
      ]
    },
    initializationFailedHandler: initFailed,
    errorHandler: { error, closed }
  };
}

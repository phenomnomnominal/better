import type { TextDocumentChangeEvent } from 'vscode-languageserver/node';

import {
  DidChangeConfigurationNotification,
  DidChangeWatchedFilesNotification,
  DidChangeWorkspaceFoldersNotification,
  TextDocumentSyncKind,
  TextDocuments,
  createConnection
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { debounce } from 'lodash';

import { info, initConsole } from './console.js';
import { createErrorHandler } from './error-handler.js';
import { BettererValidationQueue } from './validation-queue.js';
import { initTrace } from './trace.js';

const ENVIRONMENT_CHANGE_TIMEOUT = 100;

function init(): void {
  const connection = createConnection();

  initTrace(connection.tracer);
  initConsole(connection.console);
  createErrorHandler(connection);

  info(`Server: Betterer server running in node ${process.version}`);

  const documents = new TextDocuments(TextDocument);
  const validationQueue = new BettererValidationQueue(connection, documents);

  function clearDiagnostics(event: TextDocumentChangeEvent<TextDocument>): void {
    info(`Server: Clearing diagnostics for "${event.document.uri}".`);
    connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
    validationQueue.removeFromQueue(event);
  }

  function queueValidate(event: TextDocumentChangeEvent<TextDocument>): void {
    validationQueue.addToQueue(event);
  }

  function opened(event: TextDocumentChangeEvent<TextDocument>): void {
    info(`Server: ${event.document.uri} opened, validating:`);
    queueValidate(event);
  }

  function saved(event: TextDocumentChangeEvent<TextDocument>): void {
    info(`Server: ${event.document.uri} saved, validating:`);
    queueValidate(event);
  }

  const environmentChanged = debounce(function environmentChanged(): void {
    info('Server: Environment changed, revalidating all documents:');
    documents.all().forEach((document) => {
      queueValidate({ document });
    });
  }, ENVIRONMENT_CHANGE_TIMEOUT);

  connection.onInitialize(() => {
    documents.listen(connection);
    documents.onDidOpen(opened);
    documents.onDidSave(saved);
    documents.onDidClose(clearDiagnostics);

    return {
      capabilities: {
        textDocumentSync: {
          openClose: true,
          change: TextDocumentSyncKind.Incremental,
          willSaveWaitUntil: false,
          save: {
            includeText: false
          }
        }
      }
    };
  });

  connection.onNotification(DidChangeConfigurationNotification.type, environmentChanged);
  connection.onNotification(DidChangeWorkspaceFoldersNotification.type, environmentChanged);
  connection.onNotification(DidChangeWatchedFilesNotification.type, environmentChanged);

  connection.onInitialized(() => {
    void connection.client.register(DidChangeConfigurationNotification.type);
    void connection.client.register(DidChangeWorkspaceFoldersNotification.type);
  });

  connection.listen();
}

init();

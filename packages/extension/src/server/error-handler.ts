import type { Connection } from 'vscode-languageserver/node';

import { NotificationType } from 'vscode-languageserver/node';

import { isString } from '../utils.js';

const BettererExitCalled = new NotificationType<[number, string]>('betterer/exitCalled');

export function createErrorHandler(connection: Connection): void {
  const nodeExit = process.exit.bind(process);
  process.exit = ((code?: number): void => {
    const stack = new Error('stack');
    connection.sendNotification(BettererExitCalled, [code ?? 0, stack.stack]);
    setTimeout(() => nodeExit(code), 1000);
  }) as typeof process.exit;

  process.on('uncaughtException', (error: Error | null) => {
    try {
      let message: string | null = null;
      if (error) {
        if (isString(error.stack)) {
          message = error.stack;
        } else if (isString(error.message)) {
          message = error.message;
        } else if (isString(error)) {
          message = error;
        }

        if (message?.length === 0) {
          message = JSON.stringify(error, undefined, '    ');
        }
      }

      /* eslint-disable no-console -- fallback logging for test errors */
      console.error('Uncaught exception received.');
      if (message) {
        console.error(message);
      }
      /* eslint-enable no-console */
    } catch {
      // Error handler died, uh oh.
    }
  });
}

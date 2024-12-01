import type { MessageItem } from 'vscode';

import { window } from 'vscode';

export function error(message: string): Thenable<string | void> {
  return window.showErrorMessage(message);
}

export function info(message: string, ...items: Array<MessageItem>): Thenable<MessageItem | string | void> {
  return window.showInformationMessage(message, ...items);
}

export function warning(message: string): Thenable<string | void> {
  return window.showWarningMessage(message);
}

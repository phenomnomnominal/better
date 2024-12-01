import type { Uri, WorkspaceConfiguration } from 'vscode';

import { workspace } from 'vscode';

export function getAlwaysShowStatus(): boolean {
  return workspace.getConfiguration('betterer').get('alwaysShowStatus', true);
}

export function getRuntime(): string {
  return workspace.getConfiguration('betterer').get('runtime', '');
}

export function getEnabled(item: { uri: Uri }): boolean {
  return getConfig(item).get('enable', true);
}

export function enable(item: { uri: Uri }): void {
  updateEnabled(item, true);
}

export function disable(item: { uri: Uri }): void {
  updateEnabled(item, false);
}

function updateEnabled(item: { uri: Uri }, value: boolean): void {
  void getConfig(item).update('enable', value);
}

function getConfig(item: { uri: Uri }): WorkspaceConfiguration {
  return workspace.getConfiguration('betterer', item.uri);
}

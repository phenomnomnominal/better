import NodeEnvironment from 'jest-environment-node';

import type { VSCodeJestGlobal } from './vscode.js';

import vscode from 'vscode';

export default class VsCodeEnvironment extends NodeEnvironment {
  constructor(...args: ConstructorParameters<typeof NodeEnvironment>) {
    super(...args);
    (this.global as Partial<VSCodeJestGlobal>).vscode = vscode;
  }
}

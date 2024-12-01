import type { Global } from '@jest/types';

import type * as vscodeNamespace from 'vscode';

export type VSCodeJestGlobal = typeof Global & {
  vscode: typeof vscodeNamespace;
};

export const vscode = (global as unknown as VSCodeJestGlobal).vscode;

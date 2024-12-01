import type { BettererOptionsRunner } from '@betterer/betterer';
import type { RemoteWorkspace } from 'vscode-languageserver/node';

import path from 'node:path';

interface BettererExtensionConfig {
  cachePath: string;
  configPath: string;
  enable: boolean;
  filters: Array<string>;
  resultsPath: string;
}

export async function getEnabled(workspace: RemoteWorkspace): Promise<boolean> {
  const { enable } = await getExtensionConfig(workspace);
  return !!enable;
}

export async function getBettererOptions(cwd: string, workspace: RemoteWorkspace): Promise<BettererOptionsRunner> {
  const { cachePath, configPath, filters, resultsPath } = await getExtensionConfig(workspace);
  return {
    cache: true,
    cachePath: path.resolve(cwd, cachePath),
    configPaths: [path.resolve(cwd, configPath)],
    filters,
    resultsPath: path.resolve(cwd, resultsPath),
    silent: true
  };
}

function getExtensionConfig(workspace: RemoteWorkspace): Promise<BettererExtensionConfig> {
  return workspace.getConfiguration({ section: 'betterer' }) as Promise<BettererExtensionConfig>;
}

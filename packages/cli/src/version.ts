import type { BettererPackageJSON } from './types.js';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function getVersion(): Promise<string> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const packageJSONPath = path.resolve(__dirname, '../package.json');
  const cliPackageJSON = await fs.readFile(packageJSONPath, 'utf-8');
  const { version } = JSON.parse(cliPackageJSON) as BettererPackageJSON;
  return version;
}

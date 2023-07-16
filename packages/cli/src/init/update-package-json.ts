import type { BettererLogger } from '@betterer/logger';

import type { BettererPackageJSON } from '../types';

import { BettererError } from '@betterer/errors';
import findUp from 'find-up';
import { promises as fs } from 'fs';

import { getVersion } from '../version';

export async function run(logger: BettererLogger, cwd: string, ts: boolean): Promise<void> {
  await logger.progress('adding "betterer" to package.json file...');

  let packageJSON;
  let packageJSONPath;
  try {
    packageJSONPath = await findUp('package.json', { cwd });
    if (!packageJSONPath) {
      throw new BettererError('could not find "package.json".');
    }
    packageJSON = JSON.parse(await fs.readFile(packageJSONPath, 'utf-8')) as BettererPackageJSON;
  } catch {
    throw new BettererError('could not read "package.json".');
  }

  packageJSON.scripts = packageJSON.scripts || {};
  if (packageJSON.scripts.betterer) {
    await logger.warn('"betterer" script already exists, moving on...');
  } else {
    packageJSON.scripts.betterer = 'betterer';
    await logger.success('added "betterer" script to package.json file.');
  }

  packageJSON.devDependencies = packageJSON.devDependencies || {};
  if (packageJSON.devDependencies['@betterer/cli']) {
    await logger.warn('"@betterer/cli" dependency already exists, moving on...');
  } else {
    const version = await getVersion();
    packageJSON.devDependencies['@betterer/cli'] = `^${version}`;
    await logger.success('added "@betterer/cli" dependency to package.json file');
  }

  if (ts) {
    if (packageJSON.devDependencies['typescript']) {
      await logger.warn('"typescript" dependency already exists, moving on...');
    } else {
      packageJSON.devDependencies['typescript'] = `^4`;
      await logger.success('added "typescript" dependency to package.json file');
    }
  }

  try {
    await fs.writeFile(packageJSONPath, `${JSON.stringify(packageJSON, null, 2)}\n`, 'utf-8');
  } catch {
    throw new BettererError('could not write "package.json".');
  }
}

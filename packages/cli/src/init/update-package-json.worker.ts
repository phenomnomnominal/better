import type { BettererLogger } from '@betterer/logger';

import type { BettererPackageJSON } from '../types.js';

import { BettererError } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';
import { findUp } from 'find-up';
import { promises as fs } from 'node:fs';

import { getVersion } from '../version.js';

/** @knipignore part of worker API */
export async function run(logger: BettererLogger, status: BettererLogger, cwd: string, ts: boolean): Promise<void> {
  await status.progress('adding "betterer" to package.json file...');

  let packageJSON;
  let packageJSONPath;
  try {
    packageJSONPath = await findUp('package.json', { cwd });
    if (!packageJSONPath) {
      throw new BettererError('could not find "package.json".');
    }
    packageJSON = JSON.parse(await fs.readFile(packageJSONPath, 'utf-8')) as BettererPackageJSON;
  } catch (error) {
    throw new BettererError('could not read "package.json".', error as Error);
  }

  packageJSON.scripts = packageJSON.scripts ?? { betterer: '' };
  // eslint-disable-next-line @typescript-eslint/dot-notation -- prefer computed key
  if (packageJSON.scripts['betterer']) {
    await logger.warn('"betterer" script already exists, moving on...');
  } else {
    // eslint-disable-next-line @typescript-eslint/dot-notation -- prefer computed key
    packageJSON.scripts['betterer'] = 'betterer';
    await logger.success('added "betterer" script to package.json file');
  }

  packageJSON.devDependencies = packageJSON.devDependencies ?? {};
  if (packageJSON.devDependencies['@betterer/cli']) {
    await logger.warn('"@betterer/cli" dependency already exists, moving on...');
  } else {
    const version = await getVersion();
    packageJSON.devDependencies['@betterer/cli'] = `^${version}`;
    await logger.success('added "@betterer/cli" dependency to package.json file');
  }

  if (ts) {
    // eslint-disable-next-line @typescript-eslint/dot-notation -- prefer computed key
    if (packageJSON.devDependencies['typescript']) {
      await logger.warn('"typescript" dependency already exists, moving on...');
    } else {
      // eslint-disable-next-line @typescript-eslint/dot-notation -- prefer computed key
      packageJSON.devDependencies['typescript'] = `^5`;
      await logger.success('added "typescript" dependency to package.json file');
    }
  }

  try {
    await fs.writeFile(packageJSONPath, `${JSON.stringify(packageJSON, null, 2)}\n`, 'utf-8');
  } catch (error) {
    throw new BettererError('could not write "package.json".', error as Error);
  }
}

exposeToMainΔ({ run });

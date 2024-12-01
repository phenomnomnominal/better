import type { BettererFilePath, BettererFilePaths } from '../../fs/types.js';
import type { BettererTestMap, BettererTestsMeta } from './types.js';

import { BettererError } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';

import { importTranspiledHashed } from '../../fs/index.js';

/** @knipignore part of worker API */
export async function loadTestsMeta(configPaths: BettererFilePaths): Promise<BettererTestsMeta> {
  const testsMetaForConfigs = await Promise.all(configPaths.map(async (configPath) => await loadTestMeta(configPath)));
  const testsMeta = testsMetaForConfigs.flat();

  const allTests: Record<string, string> = {};
  testsMeta.forEach((testMeta) => {
    const { name, configPath } = testMeta;
    const existingConfigPath = allTests[name];
    if (existingConfigPath) {
      throw new BettererError(`Duplicate test name found in "${existingConfigPath}" and "${configPath}": "${name}"`);
    }
    allTests[name] = configPath;
  });
  return testsMeta;
}

async function loadTestMeta(configPath: BettererFilePath): Promise<BettererTestsMeta> {
  try {
    const [exports, configHash] = (await importTranspiledHashed(configPath)) as [BettererTestMap, string];
    return Object.keys(exports).map((name) => ({ configPath, configHash, name }));
  } catch (error) {
    throw new BettererError(`could not import config from "${configPath}". 😔`, error as BettererError);
  }
}

exposeToMainΔ({
  loadTestsMeta
});

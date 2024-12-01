import type { BettererConfigMerge, BettererOptionsMerge } from './types.js';

import path from 'node:path';
import { toArray, validateFilePath, validateString, validateStringArray } from '../config/index.js';

const BETTERER_RESULTS = './.betterer.results';

export async function createMergeConfig(options: BettererOptionsMerge): Promise<BettererConfigMerge> {
  const contents = toArray(options.contents);
  const cwd = options.cwd ?? process.cwd();
  const resultsPath = path.resolve(cwd, options.resultsPath ?? BETTERER_RESULTS);

  validateStringArray({ contents });
  validateString({ cwd });
  await validateFilePath({ resultsPath });

  return { contents, cwd, resultsPath };
}

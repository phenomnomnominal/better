import type { BettererConfigFS } from '../fs/index.js';
import type { BettererReporterΩ } from './reporter.js';
import type {
  BettererConfigReporter,
  BettererOptionsReporter,
  BettererOptionsReporterOverride,
  BettererReporter
} from './types.js';

import { toArray, validateBool } from '../config/index.js';
import { getGlobals, setGlobals } from '../globals.js';
import { loadReporters, loadSilentReporter } from './loader.js';

export async function createReporterConfig(
  configBase: BettererConfigFS,
  options: BettererOptionsReporter
): Promise<[BettererConfigReporter, BettererReporterΩ]> {
  const { cwd } = configBase;

  const logo = options.logo ?? false;

  const reporters = toArray<string | BettererReporter>(options.reporters);
  const silent = options.silent ?? false;

  validateBool({ logo });
  validateBool({ silent });

  const reporter = silent ? loadSilentReporter() : await loadReporters(reporters, cwd);

  return [{ logo }, reporter];
}

export async function overrideReporterConfig(optionsOverride: BettererOptionsReporterOverride): Promise<void> {
  if (optionsOverride.reporters) {
    const { config, results, runWorkerPool, testMetaLoader, fs } = getGlobals();
    const reporters = toArray<string | BettererReporter>(optionsOverride.reporters);
    const reporter = await loadReporters(reporters, config.cwd);
    setGlobals(config, fs, reporter, results, runWorkerPool, testMetaLoader);
  }
}

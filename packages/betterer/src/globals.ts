import type { BettererOptions } from './api/index.js';
import type { BettererConfig } from './config/types.js';
import type { BettererFileResolver, BettererVersionControlWorker } from './fs/index.js';
import type { BettererReporter } from './reporters/index.js';
import type { BettererResultsWorker } from './results/index.js';
import type { BettererRunWorkerPool } from './run/types.js';
import type { BettererOptionsWatcher } from './runner/index.js';
import type { BettererTestMetaLoaderWorker } from './test/index.js';

import { BettererError, invariantΔ } from '@betterer/errors';
import { importWorkerΔ } from '@betterer/worker';

import { createContextConfig, enableMode } from './context/index.js';
import { BettererFileResolverΩ, createFSConfig } from './fs/index.js';
import { createReporterConfig, loadDefaultReporter } from './reporters/index.js';
import { createRunWorkerPool } from './run/index.js';
import { createWatcherConfig } from './runner/index.js';

class BettererGlobalResolvers {
  public cwd: BettererFileResolver;

  public constructor(config: BettererConfig) {
    this.cwd = new BettererFileResolverΩ(config.cwd);
  }
}

class BettererGlobals {
  public readonly resolvers: BettererGlobalResolvers = new BettererGlobalResolvers(this.config);

  constructor(
    public readonly config: BettererConfig,
    public readonly _reporter: BettererReporter | null,
    public readonly results: BettererResultsWorker,
    private readonly _runWorkerPool: BettererRunWorkerPool | null,
    private readonly _testMetaLoader: BettererTestMetaLoaderWorker | null,
    public readonly versionControl: BettererVersionControlWorker
  ) {}

  public get reporter(): BettererReporter {
    invariantΔ(this._reporter, `\`reporter\` should only be accessed on the main thread!`);
    return this._reporter;
  }

  public get runWorkerPool(): BettererRunWorkerPool {
    invariantΔ(this._runWorkerPool, `\`runWorkerPool\` should only be accessed on the main thread!`);
    return this._runWorkerPool;
  }

  public get testMetaLoader(): BettererTestMetaLoaderWorker {
    invariantΔ(this._testMetaLoader, `\`testMetaLoader\` should only be accessed on the main thread!`);
    return this._testMetaLoader;
  }
}

let GLOBAL_CONTAINER: BettererGlobals | null = null;

export async function createGlobals(
  options: BettererOptions,
  optionsWatch: BettererOptionsWatcher = {}
): Promise<void> {
  let errorReporter = await loadDefaultReporter();

  try {
    const configContext = await createContextConfig(options);
    const configFS = await createFSConfig(options);

    const [configReporter, reporter] = await createReporterConfig(configFS, options);
    errorReporter = reporter;

    const configWatcher = createWatcherConfig(configFS, optionsWatch);

    const results: BettererResultsWorker = await importWorkerΔ('./results/results.worker.js');
    const versionControl: BettererVersionControlWorker = await importWorkerΔ('./fs/version-control.worker.js');
    const testMetaLoader: BettererTestMetaLoaderWorker = await importWorkerΔ('./test/test-meta/loader.worker.js');

    const config = enableMode({
      ...configContext,
      ...configFS,
      ...configReporter,
      ...configWatcher
    });

    await results.api.init(config);
    await versionControl.api.init(config);

    const runWorkerPool = await createRunWorkerPool(config.workers);

    setGlobals(config, reporter, results, runWorkerPool, testMetaLoader, versionControl);
  } catch (error) {
    const reporterΩ = errorReporter;
    await reporterΩ.configError(options, error as BettererError);
    throw error;
  }
}

export function getGlobals(): BettererGlobals {
  if (GLOBAL_CONTAINER === null) {
    throw new BettererError('`createGlobals` must be called before trying to use globals! ❌');
  }
  return GLOBAL_CONTAINER;
}

export function setGlobals(...globals: ConstructorParameters<typeof BettererGlobals>): void {
  GLOBAL_CONTAINER = new BettererGlobals(...globals);
}

export async function destroyGlobals(): Promise<void> {
  const { results, runWorkerPool, testMetaLoader, versionControl } = getGlobals();
  await Promise.all([results.destroy(), runWorkerPool.destroy(), testMetaLoader.destroy(), versionControl.destroy()]);
  GLOBAL_CONTAINER = null;
}

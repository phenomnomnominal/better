import type { BettererWorkerPool } from '@betterer/worker';

import type { BettererRunWorker } from './types.js';

import { createWorkerPoolΔ, importWorkerΔ } from '@betterer/worker';

export async function createRunWorkerPool(workers: number): Promise<BettererWorkerPool<BettererRunWorker>> {
  return await createWorkerPoolΔ(workers, async () => await importWorkerΔ('./run.worker.js'));
}

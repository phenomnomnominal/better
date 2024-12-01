/**
 * Worker helper functions for {@link https://github.com/phenomnomnominal/betterer | **Betterer**}.
 *
 * @packageDocumentation
 */

export type { BettererWorkerAPI, BettererWorkerHandle, BettererWorkerFactory, BettererWorkerPool } from './types.js';

export { exposeToMainΔ, exposeToWorkerΔ, importWorkerΔ } from './worker.js';
export { createWorkerPoolΔ } from './worker-pool.js';

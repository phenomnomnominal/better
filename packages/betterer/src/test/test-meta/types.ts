import type { BettererWorkerAPI } from '@betterer/worker';
import type { MaybeAsync } from '../../types.js';
import type { BettererTest } from '../test.js';

export type BettererTestFactory = () => MaybeAsync<BettererTest>;

export type BettererTestMap = Record<string, BettererTestFactory>;

export interface BettererTestMeta {
  readonly configPath: string;
  readonly configHash: string;
  readonly name: string;
}

export type BettererTestsMeta = Array<BettererTestMeta>;

/**
 * @public An array of test names.
 */
export type BettererTestNames = ReadonlyArray<string>;

export type BettererTestMetaLoaderWorker = BettererWorkerAPI<typeof import('./loader.worker.js')>;

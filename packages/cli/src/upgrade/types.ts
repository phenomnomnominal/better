import type { BettererWorkerAPI } from '@betterer/worker';

export type UpgradeConfigFileWorker = BettererWorkerAPI<typeof import('./upgrade-config-file.worker.js')>;

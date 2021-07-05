import { BettererConfig } from './config';
import { BettererVersionControlWorker } from './fs';
import { BettererReporterΩ } from './reporters';
import { BettererResultsΩ } from './results';

export type MaybeAsync<T> = T | Promise<T>;

export type BettererGlobals = {
  config: BettererConfig;
  reporter: BettererReporterΩ;
  results: BettererResultsΩ;
  versionControl: BettererVersionControlWorker;
};

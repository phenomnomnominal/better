/**
 * @internal This could change at any point! Please don't use!
 *
 * An array of string arguments for a CLI command.
 */
export type BettererCLIArguments = Array<string>;

export enum BettererCommand {
  ci = 'ci',
  init = 'init',
  merge = 'merge',
  precommit = 'precommit',
  results = 'results',
  start = 'start',
  upgrade = 'upgrade',
  watch = 'watch'
}

export type BettererCommandName = `${BettererCommand}`;

export interface BettererCLIEnvConfig {
  debug: boolean;
  debugLog: string;
}

export interface BettererCLIConfig extends BettererCLIEnvConfig {
  cache: boolean;
  cachePath: string;
  config: BettererCLIArguments;
  exclude: BettererCLIArguments;
  filter: BettererCLIArguments;
  ignore: BettererCLIArguments;
  include: BettererCLIArguments;
  logo: boolean;
  reporter: BettererCLIArguments;
  results: string;
  silent: boolean;
  strict: boolean;
  tsconfig: string;
  update: boolean;
  workers: number | boolean;
}

export interface BettererCLIInitConfig extends BettererCLIEnvConfig {
  automerge: boolean;
  config: string;
  logo: boolean;
  results: string;
}

export interface BettererCLIMergeConfig extends BettererCLIEnvConfig {
  contents: Array<string>;
  logo: boolean;
  results: string;
}

export interface BettererCLIResultsConfig extends BettererCLIEnvConfig {
  config: BettererCLIArguments;
  exclude: BettererCLIArguments;
  filter: BettererCLIArguments;
  include: BettererCLIArguments;
  logo: boolean;
  results: string;
}

export interface BettererCLIUpgradeConfig extends BettererCLIEnvConfig {
  config: BettererCLIArguments;
  logo: boolean;
  save: boolean;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * A basic representation of the package.json configuration file.
 */
export interface BettererPackageJSON {
  version: string;
  scripts: Record<string, string> & { betterer: string };
  devDependencies: Record<string, string>;
}

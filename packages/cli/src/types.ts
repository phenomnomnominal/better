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

export interface BettererCLIConfig {
  basePath: string;
  cache: boolean;
  cachePath: string;
  config: BettererCLIArguments;
  exclude: BettererCLIArguments;
  filter: BettererCLIArguments;
  ignore: BettererCLIArguments;
  include: BettererCLIArguments;
  logo: boolean;
  reporter: BettererCLIArguments;
  repoPath: string;
  results: string;
  silent: boolean;
  strict: boolean;
  strictDeadlines: boolean;
  tsconfig: string;
  update: boolean;
  workers: number | boolean;
}

export interface BettererCLIInitConfig {
  automerge: boolean;
  config: string;
  logo: boolean;
  repoPath: string;
  results: string;
}

export interface BettererCLIMergeConfig {
  contents: Array<string>;
  logo: boolean;
  results: string;
}

export interface BettererCLIResultsConfig {
  basePath: string;
  config: BettererCLIArguments;
  exclude: BettererCLIArguments;
  filter: BettererCLIArguments;
  include: BettererCLIArguments;
  logo: boolean;
  repoPath: string;
  results: string;
}

export interface BettererCLIUpgradeConfig {
  config?: BettererCLIArguments;
  logo: boolean;
  save: boolean;
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * A basic representation of the package.json configuration file.
 */
export interface BettererPackageJSON {
  /**
   * the current version of the package
   */
  version: string;
  /**
   * "scripts" will be updated to add new `betterer` run commands
   */
  scripts?: Record<string, string>;
  /**
   * "devDependencies" will be updated to add `betterer@latest`
   */
  devDependencies?: Record<string, string>;
}

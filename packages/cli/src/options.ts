import commander from 'commander';
import {
  BettererCLIArguments,
  BettererCLICIConfig,
  BettererCLIInitConfig,
  BettererCLIStartConfig,
  BettererCLIWatchConfig
} from './types';

export function ciOptions(argv: BettererCLIArguments): BettererCLICIConfig {
  configPathsOption();
  resultsPathOption();
  tsconfigPathOption();
  filtersOption();
  silentOption();
  reportersOption();
  return (commander.parse(argv) as unknown) as BettererCLICIConfig;
}

export function initOptions(argv: BettererCLIArguments): BettererCLIInitConfig {
  configPathOption();
  return (commander.parse(argv) as unknown) as BettererCLIInitConfig;
}

export function startOptions(argv: BettererCLIArguments): BettererCLIStartConfig {
  configPathsOption();
  resultsPathOption();
  tsconfigPathOption();
  filtersOption();
  silentOption();
  updateOption();
  reportersOption();
  return (commander.parse(argv) as unknown) as BettererCLIStartConfig;
}

export function watchOptions(argv: BettererCLIArguments): BettererCLIWatchConfig {
  configPathsOption();
  resultsPathOption();
  tsconfigPathOption();
  filtersOption();
  silentOption();
  updateOption();
  reportersOption();
  ignoresOption();
  return (commander.parse(argv) as unknown) as BettererCLIWatchConfig;
}

function configPathOption(): void {
  commander.option('-c, --config [value]', 'Path to test definition file relative to CWD', './.betterer.ts');
}

function configPathsOption(): void {
  commander.option(
    '-c, --config [value]',
    'Path to test definition file relative to CWD. Takes multiple values',
    argsToArray
  );
}

function resultsPathOption(): void {
  commander.option('-r, --results [value]', 'Path to test results file relative to CWD');
}

function tsconfigPathOption(): void {
  commander.option('-t, --tsconfig [value]', 'Path to TypeScript config file relative to CWD');
}

function filtersOption(): void {
  commander.option('-f, --filter [value]', 'RegExp filter for tests to run. Takes multiple values', argsToArray);
}

function ignoresOption(): void {
  commander.option('-i, --ignore [value]', 'Glob pattern for files to ignore. Takes multiple values', argsToArray);
}

function reportersOption(): void {
  commander.option(
    '-R, --reporter [value]',
    'npm package name for a Betterer reporter. Takes multiple values',
    argsToArray
  );
}

function silentOption(): void {
  commander.option('-s, --silent', 'Disable all logging');
}

function updateOption(): void {
  commander.option('-u, --update', 'Force update the results file, even if things get worse');
}

function argsToArray(value: string, previous: BettererCLIArguments = []): BettererCLIArguments {
  return previous.concat([value]);
}

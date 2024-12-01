import type { BettererTestNames, BettererRunSummaries } from '@betterer/betterer';

export interface Paths {
  cache: string;
  config: string;
  results: string;
  cwd: string;
}

export interface FixtureFileSystem {
  paths: Paths;

  deleteDirectory: (filePath: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  readFile: (filePath: string) => Promise<string>;
  resolve: (filePath: string) => string;
  writeFile: (filePath: string, text: string) => Promise<void>;
  cleanup: () => Promise<void>;
}

export interface FixtureStdout {
  sendKeys: (keys: string) => Promise<void>;
}

export type FixtureFileSystemFiles = Record<string, string>;

export interface FixtureLogging {
  logs: FixtureLogs;
}

export type Fixture = FixtureFileSystem &
  FixtureStdout &
  FixtureLogging & {
    testNames: (runs: BettererRunSummaries) => BettererTestNames;
  };

// Readonly externally:
export type FixtureLogs = ReadonlyArray<string>;

export type FixtureLogger = (testName: string, ...messages: Array<string>) => void;

export type FixtureLogsMap = Record<string, FixtureLogger>;

export interface FixtureOptions {
  logFilters?: Array<RegExp>;
}

export type FixtureFactory = (
  fixtureName: string,
  files?: FixtureFileSystemFiles,
  options?: FixtureOptions
) => Promise<Fixture>;

export interface FixturePersist {
  increment(): Promise<number>;
  decrement(): Promise<number>;
  reset(): Promise<number>;
}

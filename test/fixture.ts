import * as assert from 'assert';
import { ensureFile, remove } from 'fs-extra';
import * as fs from 'graceful-fs';
import * as path from 'path';
import * as ansiRegex from 'ansi-regex';
import { BettererRuns, BettererWatcher, BettererRunNames, BettererSummary } from '@betterer/betterer';

const DEFAULT_CONFIG_PATH = './.betterer';
const DEFAULT_RESULTS_PATH = `./.betterer.results`;

const ANSI_REGEX = ansiRegex();
const PROJECT_REGEXP = new RegExp(normalisePaths(process.cwd()), 'g');

const deleteFile = fs.promises.unlink;
const readFile = fs.promises.readFile;
const writeFile = fs.promises.writeFile;

type Paths = {
  config: string;
  fixture: string;
  results: string;
  cwd: string;
};

export type FS = Record<string, string>;
type Fixture = {
  logs: ReadonlyArray<string>;
  paths: Paths;
  deleteFile(filePath: string): Promise<void>;
  readFile(filePath: string): Promise<string>;
  resolve(filePath: string): string;
  writeFile(filePath: string, text: string): Promise<void>;
  waitForRun(watcher: BettererWatcher): Promise<BettererSummary>;
  cleanup(): Promise<void>;
  runNames(runs: BettererRuns): BettererRunNames;
};

const fixtureNames: Array<string> = [];

export async function createFixture(fixtureName: string, fileStructure: FS): Promise<Fixture> {
  assert(!fixtureNames.includes(fixtureName));

  const fixturePath = path.resolve(__dirname, `../fixtures/${fixtureName}`);

  function resolve(itemPath: string): string {
    return path.resolve(fixturePath, itemPath);
  }

  async function cleanup(): Promise<void> {
    await remove(fixturePath);
  }

  async function write(filePath: string, text: string): Promise<void> {
    const fullPath = resolve(filePath);
    await ensureFile(fullPath);
    return writeFile(fullPath, text.trim(), 'utf8');
  }

  try {
    await cleanup();
  } catch {
    // Move on...
  }

  await Promise.all(
    Object.keys(fileStructure).map(async (itemPath) => {
      await write(itemPath, fileStructure[itemPath]);
    })
  );

  // Wait long enough that the watch mode debounce doesn't get in the way:
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  const logs: Array<string> = [];
  const log = (...messages: Array<string>): void => {
    // Do some magic to sort out the logs for snapshots. This muchs up the snapshot of the printed logo,
    // but that hardly matters...
    logs.push(...messages.map((m) => (!isString(m) ? m : replaceProjectPath(normalisePaths(replaceAnsi(m))))));
  };

  jest.spyOn(console, 'log').mockImplementation(log);
  jest.spyOn(console, 'error').mockImplementation((message: string) => {
    const [firstLine] = message.split('\n');
    log(firstLine);
  });
  jest.spyOn(process.stdout, 'write').mockImplementation((message: string | Uint8Array): boolean => {
    if (message) {
      log(message.toString());
    }
    return true;
  });
  process.stdout.columns = 1000;

  const paths = {
    config: resolve(DEFAULT_CONFIG_PATH),
    cwd: resolve('.'),
    fixture: fixturePath,
    results: resolve(DEFAULT_RESULTS_PATH)
  };

  return {
    paths,
    runNames,
    resolve,
    logs,
    deleteFile(filePath: string): Promise<void> {
      return deleteFile(resolve(filePath));
    },
    readFile(filePath: string): Promise<string> {
      return readFile(resolve(filePath), 'utf8');
    },
    writeFile: write,
    waitForRun(watcher): Promise<BettererSummary> {
      return new Promise((resolve) => {
        watcher.onRun((summary) => {
          resolve(summary);
        });
      });
    },
    cleanup
  };
}

function runNames(runs: BettererRuns): BettererRunNames {
  return runs.map((run) => run.name);
}

function isString(message: unknown): message is string {
  return typeof message === 'string';
}

function replaceAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

function replaceProjectPath(str: string): string {
  return str.replace(PROJECT_REGEXP, '<project>');
}

function normalisePaths(str: string): string {
  return str.split(path.win32.sep).join(path.posix.sep);
}

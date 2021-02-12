import ansiRegex from 'ansi-regex';
import * as path from 'path';

import { FixtureLogs, FixtureOptions } from './types';

const ANSI_REGEX = ansiRegex();
const PROJECT_REGEXP = new RegExp(normalisePaths(process.cwd()), 'g');
const STACK_TRACK_LINE_REGEXP = /\s+at\s+/;

export function createFixtureLogs(options: FixtureOptions = {}): FixtureLogs {
  const logs: Array<string> = [];
  const log = (...messages: Array<string>): void => {
    if (options.logStack) {
      try {
        throw new Error();
      } catch (e) {
        logs.push((e as Error).stack || '');
      }
    }

    // Do some magic to sort out the logs for snapshots. This mucks up the snapshot of the printed logo,
    // but that hardly matters...
    messages.forEach((message) => {
      if (!isString(message)) {
        logs.push(message);
        return;
      }
      message = replaceAnsi(message);
      const lines = message.replace(/\r/g, '').split('\n');
      const filteredLines = lines
        .filter((line) => !isStackTraceLine(line))
        .filter((line) => !isFiltered(line, options));
      const formattedLines = filteredLines.map((line) => {
        line = replaceProjectPath(normalisePaths(line));
        line = line.trimEnd();
        return line;
      });
      message = formattedLines.join('\n');
      const trimmed = message.trim();
      if (trimmed.length === 0) {
        return;
      }
      logs.push(message);
    });
  };

  jest.spyOn(process.stdout, 'write').mockImplementation((message: string | Uint8Array): boolean => {
    if (message) {
      log(message.toString());
    }
    return true;
  });
  process.stdout.columns = 1000;
  process.stdout.rows = 20;

  return logs as FixtureLogs;
}

function isString(message: unknown): message is string {
  return typeof message === 'string';
}

function replaceAnsi(str: string): string {
  return str.replace(ANSI_REGEX, '');
}

function isStackTraceLine(str: string): boolean {
  return !!STACK_TRACK_LINE_REGEXP.exec(str);
}

function isFiltered(str: string, options: FixtureOptions): boolean {
  const filters = options.logFilters || [];
  return filters.some((filter) => !!filter.exec(str));
}

function replaceProjectPath(str: string): string {
  return str.replace(PROJECT_REGEXP, '<project>');
}

function normalisePaths(str: string): string {
  return str.split(path.win32.sep).join(path.posix.sep);
}

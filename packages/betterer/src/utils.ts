import type { PlatformPath } from 'node:path';

import { invariantΔ } from '@betterer/errors';
import path from 'node:path';

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: unknown): value is (...args: Array<unknown>) => unknown {
  return typeof value === 'function';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isRegExp(value: unknown): value is string {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function normalisedPath(filePath: string): string {
  return filePath.split(path.win32.sep).join(path.posix.sep);
}

export function sortEntriesKeys([keyA]: [string, unknown], [keyB]: [string, unknown]): 0 | -1 | 1 {
  return keyA === keyB ? 0 : keyA < keyB ? -1 : 1;
}

const NEW_LINE = '\n';
const NEW_LINES = /\r\n|\r|\n/g;

export function normaliseNewlines(str: string): string {
  return str.replace(NEW_LINES, NEW_LINE);
}

export function flatten<T>(toFlatten: ReadonlyArray<T | ReadonlyArray<T>>): Array<T> {
  const flattened: Array<T> = [];
  toFlatten.forEach((t) => {
    if (Array.isArray(t)) {
      flattened.push(...t);
    } else {
      flattened.push(t as T);
    }
  });
  return flattened;
}

const WRAPPERS: Array<[string, string]> = [
  [' ', ' '],
  ["'", "'"],
  ['"', '"'],
  ['`', '`'],
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>']
];
const WIN32_ROOT_REGEXP = /([A-Za-z]:(?:\\.*?)+)/;
const WIN32_RELATIVE_REGEXP = /(.{0,2}(?:\\.*?)+)/;
const POSIX_ROOT_REGEXP = /((?:\/.*?)+)/;
const POSIX_RELATIVE_REGEXP = /(.{1,2}(?:\/.*?)+)/;
const REGEXP_REGEXP = /\/(.*)\//;

const WIN32_ROOT_REGEXP_WRAPPED = WRAPPERS.map((wrapper) => wrapRegExp(WIN32_ROOT_REGEXP, wrapper));
const WIN32_RELATIVE_REGEXP_WRAPPED = WRAPPERS.map((wrapper) => wrapRegExp(WIN32_RELATIVE_REGEXP, wrapper));
const POSIX_ROOT_REGEXP_WRAPPED = WRAPPERS.map((wrapper) => wrapRegExp(POSIX_ROOT_REGEXP, wrapper));
const POSIX_RELATIVE_REGEXP_WRAPPED = WRAPPERS.map((wrapper) => wrapRegExp(POSIX_RELATIVE_REGEXP, wrapper));

function wrapRegExp(regexp: RegExp, [l, r]: [string, string]): RegExp {
  return new RegExp(`\\${l}${regexp.source}\\${r}`, 'g');
}

export function replaceAbsolutePaths(input: string, fromPath: string, path: PlatformPath): string {
  const regexps = path === path.posix ? POSIX_ROOT_REGEXP_WRAPPED : WIN32_ROOT_REGEXP_WRAPPED;
  return replaceWrappedPaths(input, fromPath, regexps);
}

export function replaceRelativePaths(input: string, fromPath: string, path: PlatformPath): string {
  const regexps = path === path.posix ? POSIX_RELATIVE_REGEXP_WRAPPED : WIN32_RELATIVE_REGEXP_WRAPPED;
  return replaceWrappedPaths(input, fromPath, regexps);
}

export function replaceWrappedPaths(input: string, fromPath: string, regexps: Array<RegExp>): string {
  let message = input;
  const foundWrappers = regexps.filter((regexp) => input.match(regexp));
  if (foundWrappers.length) {
    foundWrappers.forEach((regexp) => {
      const matches = [...message.matchAll(regexp)];
      matches.forEach((match) => {
        const [, maybePath] = match;
        invariantΔ(maybePath, 'All wrapper RegExps results must contain a group!');
        // A RegExp might look like a Posix file path:
        const regexMatch = REGEXP_REGEXP.exec(maybePath);
        if (regexMatch) {
          const [, maybeRegexp] = regexMatch;
          invariantΔ(maybeRegexp, 'The RegExp matching RegExp must contain a group!');
          // new RegExp(...) on something file path-esque e.g. /foo/bar/baz/ will transform to /foo\/bar\/baz/
          // I guess there is a false negative here for a root directory e.g. /foo/, but that would be pretty weird to
          // in an error message?
          if (new RegExp(maybeRegexp).source === maybeRegexp) {
            return;
          }
        }
        const resolved = path.resolve(fromPath, maybePath);
        let relative = path.relative(fromPath, resolved);
        if (path.dirname(resolved) === fromPath) {
          relative = `./${relative}`;
        }
        message = message.replace(maybePath, relative).replaceAll(path.win32.sep, path.posix.sep);
      });
    });
  }
  return message;
}

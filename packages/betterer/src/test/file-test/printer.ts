import type { BettererFileTestResultSerialised } from './types.js';

import { isKey } from './serialiser.js';

export function printer(serialised: BettererFileTestResultSerialised): string {
  const keys = Object.keys(serialised);
  if (keys.length === 0) {
    return '{}';
  }
  let printed = '{\n';
  keys
    .sort()
    .filter(isKey)
    .forEach((filePath, index) => {
      const file = `    "${filePath}": [\n`;
      printed += prependNewline(index, file);
      serialised[filePath]?.forEach((issue, index) => {
        const [line, column, length, message, hash] = issue;
        const printedIssue = `      [${String(line)}, ${String(column)}, ${String(length)}, ${JSON.stringify(message)}, ${JSON.stringify(
          hash
        )}]`;
        printed += prependNewline(index, printedIssue);
      });
      printed += `\n    ]`;
    });
  printed += '\n  }';
  return printed;
}

function prependNewline(index: number, str: string): string {
  return `${index === 0 ? '' : ',\n'}${str}`;
}

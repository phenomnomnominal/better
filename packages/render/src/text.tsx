import type { TextProps } from 'ink';

import { Text as InkText } from 'ink';
import React from 'react';
import path from 'node:path';

export type { TextProps } from 'ink';

/**
 * @internal This could change at any point! Please don't use!
 *
 * Re-exported from `ink`, but modified to remove process.cwd() from any text
 */
export const Text: React.FC<TextProps> = (props) => {
  const { children, ...rest } = props;
  const stripped = Array.isArray(children) ? children.map(stripCwd) : [children].map(stripCwd);
  return <InkText {...rest}>{stripped}</InkText>;
};

function stripCwd(log: React.ReactNode): React.ReactNode {
  if (typeof log !== 'string') {
    return log;
  }
  const processDir = path.join(process.cwd(), path.sep);
  return log.replaceAll(toPosixPath(processDir), '').replaceAll(toWin32Path(processDir), '').replaceAll('file://', '');
}

function toPosixPath(str: string): string {
  return str.split(path.sep).join(path.posix.sep);
}

function toWin32Path(str: string): string {
  return str.split(path.sep).join(path.win32.sep);
}

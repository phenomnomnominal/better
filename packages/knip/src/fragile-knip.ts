import type { KnipCLIOptions } from './types.js';

import { createRequire } from 'node:module';
import path from 'node:path';
import { kebabCase } from 'change-case';

// This is definitely fragile...
const require = createRequire(import.meta.url);
const pathName = require.resolve('knip');
export const binPath = path.resolve(pathName, '../../bin/knip.js');

// This is probably a bit fragile too 😅
export { ISSUE_TYPE_TITLE } from 'knip/dist/constants.js';

export function toArgs(options: KnipCLIOptions) {
  return Object.entries(options)
    .map(([name, result]) => {
      const param = kebabCase(name);
      if (result === true) {
        return `--${param}`;
      }
      if (result === false) {
        return `--no-${param}`;
      }
      return `--${kebabCase(name)}="${String(result)}"`;
    })
    .join(' ');
}

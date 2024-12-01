import { describe, expect, it } from 'vitest';

import { execSync } from 'node:child_process';
import path from 'node:path';

describe('betterer cli', () => {
  it('should print the version', async () => {
    const { version } = await import('../../packages/cli/package.json');

    const binPath = path.resolve(__dirname, '../../packages/cli/bin/betterer');
    const result = execSync(`node "${binPath}" -V`);

    expect(result.toString()).toContain(version);
  });
});

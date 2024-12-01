import type { FixturePersist } from './types.js';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function persist(fixtureMetaUrl: string, name: string, start: number): FixturePersist {
  const fixtureDir = path.dirname(fileURLToPath(fixtureMetaUrl));

  const persistPath = path.join(fixtureDir, `persist.${name}.json`);

  async function read(): Promise<number> {
    try {
      return JSON.parse(await fs.readFile(persistPath, 'utf-8')) as number;
    } catch {
      return start;
    }
  }

  async function write(result: number): Promise<void> {
    await fs.writeFile(persistPath, JSON.stringify(result), 'utf-8');
  }

  return {
    async increment(): Promise<number> {
      const val = await read();
      const result = val + 1;
      await write(result);
      return result;
    },
    async decrement(): Promise<number> {
      const val = await read();
      const result = val - 1;
      await write(result);
      return result;
    },
    async reset(): Promise<number> {
      await write(start);
      return start;
    }
  };
}

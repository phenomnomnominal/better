import { promises as fs } from 'node:fs';

import { normaliseNewlines } from '../utils.js';

const READ_CACHE: Record<string, string> = {};
const READ_CACHE_TIME: Record<string, number> = {};

export async function read(filePath: string): Promise<string | null> {
  try {
    const stat = await fs.stat(filePath);
    const modifiedTime = stat.mtime.getTime();
    const cached = READ_CACHE[filePath];
    if (READ_CACHE_TIME[filePath] === modifiedTime && cached) {
      return cached;
    }

    const contents = await fs.readFile(filePath, 'utf-8');
    const normalisedContents = normaliseNewlines(contents);
    READ_CACHE[filePath] = normalisedContents;
    READ_CACHE_TIME[filePath] = modifiedTime;
    return normalisedContents;
  } catch {
    return null;
  }
}

export async function readdir(dirPath: string): Promise<true | null> {
  try {
    const stat = await fs.stat(dirPath);
    const isDirectory = stat.isDirectory();
    return isDirectory || null;
  } catch {
    return null;
  }
}

import { promises as fs } from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';

const BETTERER_TEMP_DIR = 'betterer';
const BETTERER_TMP_EXT = '.betterer.tmp';

export function getTmpFileName(name: string, ext: string) {
  const id = crypto.randomBytes(4).toString('hex');
  return `${name}.${id}${BETTERER_TMP_EXT}${ext}`;
}

export function isTempFilePath(filePath: string): boolean {
  const { base } = path.parse(filePath);
  return base.includes(BETTERER_TMP_EXT);
}

export async function getTmpPath(fileName = ''): Promise<string> {
  const bettererTmpDirPath = path.join(os.tmpdir(), BETTERER_TEMP_DIR);
  await fs.mkdir(bettererTmpDirPath, { recursive: true });
  if (!fileName) {
    return bettererTmpDirPath;
  }
  const { name, ext } = path.parse(fileName);
  return path.join(bettererTmpDirPath, getTmpFileName(name, ext));
}

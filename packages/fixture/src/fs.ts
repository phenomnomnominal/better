import { ensureFile, remove } from 'fs-extra';
import { promises as fs } from 'graceful-fs';
import * as path from 'path';
import { FixtureFileSystem, FixtureFileSystemFiles } from './types';

const DEFAULT_CONFIG_PATH = './.betterer';
const DEFAULT_RESULTS_PATH = `./.betterer.results`;

export async function createFixtureFS(fixturePath: string, files: FixtureFileSystemFiles): Promise<FixtureFileSystem> {
  function resolve(itemPath: string): string {
    return path.resolve(fixturePath, itemPath);
  }

  async function cleanup(): Promise<void> {
    await remove(fixturePath);
  }

  async function writeFile(filePath: string, text: string): Promise<void> {
    const fullPath = resolve(filePath);
    await ensureFile(fullPath);
    return fs.writeFile(fullPath, text.trim(), 'utf8');
  }

  async function deleteDirectory(directoryPath: string): Promise<void> {
    return remove(directoryPath);
  }

  async function deleteFile(filePath: string): Promise<void> {
    return fs.unlink(resolve(filePath));
  }

  function readFile(filePath: string): Promise<string> {
    return fs.readFile(resolve(filePath), 'utf8');
  }

  const paths = {
    config: resolve(DEFAULT_CONFIG_PATH),
    cwd: fixturePath,
    results: resolve(DEFAULT_RESULTS_PATH)
  };

  try {
    await cleanup();
  } catch {
    // Move on...
  }

  await Promise.all(
    Object.keys(files).map(async (itemPath) => {
      await writeFile(itemPath, files[itemPath]);
    })
  );

  return { paths, deleteDirectory, deleteFile, resolve, cleanup, readFile, writeFile };
}

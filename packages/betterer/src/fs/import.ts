import { BettererError } from '@betterer/errors';
import { promises as fs } from 'node:fs';
import { Module } from 'node:module';
import path from 'node:path';
import url from 'node:url';

import { createCacheHash } from '../hasher.js';
import { read } from './reader.js';
import { getTmpFileName } from './temp.js';

interface ESModule {
  default: unknown;
}

interface ModulePrivate {
  _compile(source: string, path: string): void;
}

type ESBuild = typeof import('esbuild');

export async function importTranspiledHashed(importPath: string): Promise<[unknown, string]> {
  const esbuild = await importESBuild();
  if (!esbuild) {
    const contents = await read(importPath);
    if (contents == null) {
      throw new BettererError(`could not read "${importPath}". 😔`);
    }

    const hash = createCacheHash(contents);
    return [await importDefault(importPath), hash];
  }

  try {
    return await importFrom(importPath, esbuild);
  } catch (error) {
    throw new BettererError(`could not import "${importPath}". 😔`, error as Error);
  }
}

export async function importTranspiled(importPath: string): Promise<unknown> {
  const [result] = await importTranspiledHashed(importPath);
  return result;
}

export async function importDefault(importPath: string): Promise<unknown> {
  try {
    let importId = importPath;
    if (path.extname(importId)) {
      // Absolute paths on Windows must be transformed to a URL before importing:
      importId = url.pathToFileURL(importId).toString();
    }
    const m = (await import(importId)) as unknown;
    return getDefaultExport(m);
  } catch (error) {
    throw new BettererError(`could not import "${importPath}". 😔`, error as Error);
  }
}

let count = 0;
export function importText(filePath: string, text: string): unknown {
  const id = String(count++);
  const { base, dir, ext } = path.parse(filePath);
  const m = new Module(path.join(dir, `${base}.${id}.${ext}`));
  (m as unknown as ModulePrivate)._compile(text, id);
  return getDefaultExport(m.exports);
}

function getDefaultExport(module: unknown): unknown {
  return (module as ESModule).default || module;
}

async function importFrom(importPath: string, esbuild: ESBuild): Promise<[unknown, string]> {
  const outfile = getTmpFileName(importPath, '.mjs');
  const cleanup = async () => {
    await fs.rm(outfile);
  };

  try {
    await esbuild.build({
      bundle: true,
      format: 'esm',
      entryPoints: [importPath],
      outfile,
      packages: 'external',
      platform: 'node',
      logLevel: 'silent',
      jsx: 'automatic'
    });

    const transpiled = await read(outfile);
    if (transpiled === null) {
      throw new BettererError(`could not read "${importPath}". 😔`);
    }

    const hash = createCacheHash(transpiled);
    const result = await importDefault(outfile);
    return [result, hash];
  } catch (error) {
    throw new BettererError((error as Error).message);
  } finally {
    try {
      await cleanup();
    } catch {
      // No file was actually created!
    }
  }
}

async function importESBuild(): Promise<ESBuild | null> {
  try {
    return await import('esbuild');
  } catch {
    return null;
  }
}

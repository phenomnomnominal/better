import type { BettererLogger } from '@betterer/logger';

import { BettererError } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const GITATTRIBUTES_COMMENT = '# Betterer merge';
const NEW_LINE = '\n';
const MERGE_CONFIG = '[merge "betterer"]';
const MERGE_DIRECTIVE = 'merge=betterer';

/** @knipignore part of worker API */
export async function run(
  logger: BettererLogger,
  status: BettererLogger,
  cwd: string,
  repoPath: string,
  resultsPath: string
): Promise<void> {
  const gitDir = await validateGitRepo(repoPath);
  const rootPath = path.dirname(gitDir);

  resultsPath = path.resolve(cwd, resultsPath);

  await status.progress(`enabling Betterer merge for "${resultsPath}" file...`);
  await gitconfig(logger, gitDir);
  await gitattributes(logger, rootPath, resultsPath);
}

async function gitconfig(logger: BettererLogger, gitDir: string): Promise<void> {
  const gitconfigPath = path.join(gitDir, 'config');

  let gitconfig = '';
  try {
    gitconfig = await fs.readFile(gitconfigPath, 'utf-8');
  } catch {
    // Doesn't matter if it fails...
  }

  let lines: Array<string> = [];
  if (gitconfig) {
    lines = gitconfig.split(NEW_LINE);
    if (lines.includes(MERGE_CONFIG)) {
      await logger.warn(`git merge config already set, moving on...`);
      return;
    }
  }

  const cliPath = require.resolve('@betterer/cli');
  const mergePath = path.resolve(cliPath, '../../bin/betterer.js');
  const mergeCommand = `\tdriver = ${mergePath} merge %A %B`;

  lines.push(MERGE_CONFIG, mergeCommand, '');

  try {
    await fs.writeFile(gitconfigPath, lines.join(NEW_LINE), 'utf-8');
    await logger.success(`added Betterer merge config to "${gitconfigPath}"!`);
  } catch (error) {
    throw new BettererError(`could not write "${gitconfigPath}".`, error as Error);
  }
}

async function gitattributes(logger: BettererLogger, rootDir: string, resultsPath: string): Promise<void> {
  const gitattributesPath = path.join(rootDir, '.gitattributes');

  let gitattributes = '';
  try {
    gitattributes = await fs.readFile(gitattributesPath, 'utf-8');
  } catch {
    // Doesn't matter if it fails...
  }

  const resultsPathRelative = path.relative(rootDir, resultsPath);
  const mergeAttribute = `${resultsPathRelative} ${MERGE_DIRECTIVE}`;

  let lines: Array<string> = [];
  if (gitattributes) {
    lines = gitattributes.split(NEW_LINE);
    if (lines.includes(mergeAttribute)) {
      await logger.warn(`Betterer merge already enabled for "${resultsPath}", moving on...`);
      return;
    }

    lines = lines.filter((line) => {
      return line !== GITATTRIBUTES_COMMENT && !line.includes(MERGE_DIRECTIVE);
    });
  }
  lines.push(GITATTRIBUTES_COMMENT, mergeAttribute, '');

  try {
    await fs.writeFile(gitattributesPath, lines.join(NEW_LINE), 'utf-8');
    await logger.success(`added Betterer merge attribute to "${gitattributesPath}"!`);
  } catch (error) {
    throw new BettererError(`could not write "${gitattributesPath}".`, error as Error);
  }
}

async function validateGitRepo(repoPath: string): Promise<string> {
  try {
    const gitPath = path.join(repoPath, '.git');
    await fs.access(gitPath);
    return gitPath;
  } catch {
    throw new BettererError(
      `".git" directory not found in "${repoPath}". \`--automerge\` only works within a Git repository.`
    );
  }
}

exposeToMainΔ({ run });

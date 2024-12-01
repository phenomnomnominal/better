import type { KnipConfig, KnipCLIOptions, KnipIssues, KnipIssueType, KnipReport } from './types.js';

import { BettererFileTest } from '@betterer/betterer';
import { BettererError, invariantΔ } from '@betterer/errors';
import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';

import path from 'node:path';
import { ISSUE_TYPE_TITLE, binPath, toArgs } from './fragile-knip.js';

const asyncExec = promisify(exec);

/**
 * @beta Use this test to incrementally introduce {@link https://knip.dev/ | **Knip** checks }
 * to your codebase.
 *
 * This test is currently in *beta* since the underlying {@link https://knip.dev/ | Knip}
 * implementation is based on private APIs. Will stabilise when it can be migrated to
 * use public APIs.
 *
 * @remarks {@link knip | `knip`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { knip } from '@betterer/knip';
 *
 * export default {
 *   'knip dependency checks': () =>
 *     knip('./knip.json', { }, '--strict')
 *     .include('./src/*.ts')
 * };
 * ```
 *
 * @param configFilePath - The relative path to a knip.json file.
 * @param extraConfiguration - Additional {@link https://knip.dev/overview/configuration | **Knip** configuration }
 * to enable. This will be merged with the existing configuration in the config file,
 * overwriting any existing existing properties.
 * @param extraCLIOptions - Additional CLI flags to enable.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `configFilePath` or `extraConfiguration`.
 */
export function knip(
  configFilePath: string,
  extraConfiguration: KnipConfig = {},
  extraCliOptions: KnipCLIOptions = {}
): BettererFileTest {
  if (!configFilePath) {
    throw new BettererError(
      "For `@betterer/knip` to work, you need to provide the path to a knip.json file, e.g. `'./knip.json'`. ❌"
    );
  }

  return new BettererFileTest(async (_, fileTestResult, resolver) => {
    const absoluteConfigFilePath = resolver.resolve(configFilePath);

    let json: string;
    try {
      json = await fs.readFile(absoluteConfigFilePath, 'utf-8');
    } catch (error) {
      throw new BettererError(`Couldn't read knip configuration file: "${configFilePath}". ❌`, error as Error);
    }

    let config: object;
    try {
      config = JSON.parse(json) as object;
    } catch (error) {
      throw new BettererError(`Couldn't parse knip configuration file: "${configFilePath}". ❌`, error as Error);
    }

    const { dir, base } = path.parse(absoluteConfigFilePath);

    const tmpJSONPath = await resolver.tmp(base);
    const absoluteTmpJSONPath = resolver.resolve(tmpJSONPath);
    const relativeTmpJSONPath = path.relative(dir, absoluteTmpJSONPath);

    let stdout: string;

    try {
      const finalConfig = { ...config, ...extraConfiguration };
      await fs.writeFile(absoluteTmpJSONPath, JSON.stringify(finalConfig), 'utf-8');
      const finalArgs = toArgs({
        ...extraCliOptions,
        config: relativeTmpJSONPath,
        noExitCode: true,
        reporter: ['json']
      });
      const buffers = await asyncExec(`node "${binPath}" ${finalArgs}`, { cwd: dir });
      stdout = buffers.stdout;
    } catch (error) {
      throw new BettererError(`Couldn't run knip. ❌`, error as Error);
    } finally {
      await fs.unlink(absoluteTmpJSONPath);
    }

    const lines = stdout.split('\n').filter(Boolean);
    const lastLine = lines.at(-1);
    invariantΔ(lastLine, `\`lastLine\` should be the JSON output from knip!`);

    let report: KnipReport;
    try {
      report = JSON.parse(lastLine) as KnipReport;
    } catch (error) {
      throw new BettererError(`Couldn't parse JSON output from knip. ❌`, error as Error);
    }

    await Promise.all(
      report.files.map(async (relativeFilePath) => {
        const absoluteFilePath = resolver.resolve(relativeFilePath);
        const contents = await fs.readFile(absoluteFilePath, 'utf-8');
        const file = fileTestResult.addFile(absoluteFilePath, contents);
        file.addIssue(0, 0, knipIssueMessage('files', ''));
      })
    );

    await Promise.all(
      report.issues.map(async (filesIssues) => {
        const relativeFilePath = filesIssues.file;
        const absoluteFilePath = resolver.resolve(relativeFilePath);
        const contents = await fs.readFile(absoluteFilePath, 'utf-8');
        const file = fileTestResult.addFile(absoluteFilePath, contents);

        const entries = Object.entries(filesIssues).filter((entry): entry is [KnipIssueType, KnipIssues] => {
          const [key, issues] = entry;
          return isIssueType(key) && Array.isArray(issues) && issues.length !== 0;
        });

        if (!entries.length) {
          return;
        }

        entries.forEach(([issueType, issues]) => {
          issues.forEach((issue) => {
            const { line, col, name } = issue;
            const message = knipIssueMessage(issueType, name);
            if (line == null || col == null) {
              file.addIssue(0, 0, message);
            } else {
              file.addIssue(line, col, name.length, message);
            }
          });
        });
      })
    );
  });
}

function isIssueType(key: unknown): key is KnipIssueType {
  return !!ISSUE_TYPE_TITLE[key as KnipIssueType];
}

function knipIssueMessage(issueType: keyof typeof ISSUE_TYPE_TITLE, message: string) {
  let issueMessage = 'knip';
  issueMessage += `(${ISSUE_TYPE_TITLE[issueType]})`;
  issueMessage += message ? `: ${message}` : '';
  return issueMessage;
}

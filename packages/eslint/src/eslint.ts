import { BettererFileInfo, FileBetterer, createFileBetterer, BettererFileInfoMap } from '@betterer/betterer';
import * as stack from 'callsite';
import { CLIEngine, Linter } from 'eslint';
import * as glob from 'glob';
import LinesAndColumns from 'lines-and-columns';
import * as path from 'path';
import { promisify } from 'util';

import { FILE_GLOB_REQUIRED, RULE_OPTIONS_REQUIRED } from './errors';

const globAsync = promisify(glob);

type ESLintRuleConfig = [string, Linter.RuleLevel | Linter.RuleLevelAndOptions];

export function eslintBetterer(globs: string | ReadonlyArray<string>, rule: ESLintRuleConfig): FileBetterer {
  if (!globs) {
    throw FILE_GLOB_REQUIRED();
  }
  if (!rule) {
    throw RULE_OPTIONS_REQUIRED();
  }

  const [, callee] = stack();
  const cwd = path.dirname(callee.getFileName());
  const globsArray = Array.isArray(globs) ? globs : [globs];
  const resolvedGlobs = globsArray.map(glob => path.resolve(cwd, glob));

  return createFileBetterer(async (files = []) => {
    const cli = new CLIEngine({});

    const testFiles = [...files];
    if (testFiles.length === 0) {
      await Promise.all(
        resolvedGlobs.flatMap(async currentGlob => {
          const globFiles = await globAsync(currentGlob);
          testFiles.push(...globFiles);
        })
      );
    }

    return testFiles.reduce(
      (fileInfoMap, filePath) => {
        const linterOptions = cli.getConfigForFile(filePath);
        fileInfoMap[filePath] = getFileIssues(linterOptions, rule, filePath);
        return fileInfoMap;
      },
      {} as BettererFileInfoMap
    );
  });
}

function getFileIssues(
  linterOptions: Linter.Config,
  rule: ESLintRuleConfig,
  filePath: string
): Array<BettererFileInfo> {
  const [ruleName, ruleOptions] = rule;
  const runner = new CLIEngine({
    ...linterOptions,
    useEslintrc: false,
    globals: Object.keys(linterOptions.globals || {}),
    rules: {
      [ruleName]: ruleOptions
    }
  });

  const report = runner.executeOnFiles([filePath]);
  const resultsWithSource = report.results.filter(result => result.source);
  return resultsWithSource.flatMap(result => {
    const { source, messages } = result;
    return messages.map(message => {
      return eslintMessageToBettererError(filePath, source as string, message);
    });
  });
}

function eslintMessageToBettererError(filePath: string, source: string, message: Linter.LintMessage): BettererFileInfo {
  const lc = new LinesAndColumns(source);
  const startLocation = lc.indexForLocation({
    line: message.line - 1,
    column: message.column - 1
  });
  const endLocation = lc.indexForLocation({
    line: message.endLine ? message.endLine - 1 : 0,
    column: message.endColumn ? message.endColumn - 1 : 0
  });
  return {
    message: message.message,
    filePath: filePath,
    fileText: source,
    start: startLocation as number,
    end: endLocation as number
  };
}

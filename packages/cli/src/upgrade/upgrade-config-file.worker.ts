import type { BettererLogger } from '@betterer/logger';
import type { SourceFile } from 'typescript';

import { BettererError } from '@betterer/errors';
import { exposeToMainΔ } from '@betterer/worker';
import { tsquery } from '@phenomnomnominal/tsquery';
import { promises as fs } from 'node:fs';
import { format } from 'prettier';
import { createPrinter, ModuleKind } from 'typescript';

import { diff } from './diff.js';
import { upgradeCJS } from './upgrade-cjs.js';
import { upgradeESM } from './upgrade-esm.js';

const printer = createPrinter();

/** @knipignore part of worker API */
export async function run(
  logger: BettererLogger,
  status: BettererLogger,
  configPath: string,
  save: boolean
): Promise<void> {
  await status.progress(`upgrading "${configPath}"...`);

  const fileText = await fs.readFile(configPath, 'utf8');
  const replaceNewLines = fileText.split('\n\n').join('/* BLANK LINE */');

  const originalSourceFile = tsquery.ast(replaceNewLines, configPath);

  const moduleType = getModuleType(originalSourceFile);
  if (moduleType == null) {
    throw new BettererError('');
  }

  const upgrade = moduleType === ModuleKind.CommonJS ? upgradeCJS : upgradeESM;
  const upgradedSourceFile = upgrade(originalSourceFile, configPath);

  const printed = printUpgraded(originalSourceFile, upgradedSourceFile);

  const formatOptions = { parser: 'typescript' };
  const [formattedOriginal, formatted] = await Promise.all([
    format(fileText, formatOptions),
    format(printed, formatOptions)
  ]);

  if (formattedOriginal !== formatted) {
    if (!save) {
      await logger.info('\nBetterer can upgrade your test definition file automatically! ✨');
      await logger.info(`Here's what the changes will look like:\n`);
      await logger.info(diff(fileText, formatted));
      await logger.info(`\nIf that looks okay, run \`betterer upgrade --save\` to write the changes to disk. 💾\n`);
    }
  } else {
    await logger.success('Nothing to upgrade!');
  }

  if (save) {
    await status.progress(`Saving upgraded config to "${configPath}"...`);
    await fs.writeFile(configPath, formatted);
    await logger.success(`Saved upgraded config to "${configPath}"! ☀️`);
  }
}

// export { thing } from 'foo';
// export default {};
const EXPORT_QUERY = 'ExportDeclaration, ExportAssignment';

// export const thing = 'foo';
const EXPORT_VARIABLE_DECLARATION_QUERY = 'VariableStatement:has(ExportKeyword)';

// module.exports
const EXPORT_MODULE_EXPORTS_QUERY =
  'PropertyAccessExpression:has(Identifier[name="module"]):has(Identifier[name="exports"])';

function getModuleType(originalSourceFile: SourceFile): ModuleKind | null {
  const [exportStatement] = tsquery(originalSourceFile, EXPORT_QUERY);
  const [exportVariableDeclaration] = tsquery(originalSourceFile, EXPORT_VARIABLE_DECLARATION_QUERY);

  if (exportStatement || exportVariableDeclaration) {
    return ModuleKind.ES2015;
  }

  const [moduleExports] = tsquery(originalSourceFile, EXPORT_MODULE_EXPORTS_QUERY);
  if (moduleExports) {
    return ModuleKind.CommonJS;
  }

  return null;
}

function printUpgraded(originalSourceFile: SourceFile, upgradedSourceFile: SourceFile): string {
  return [getImport(originalSourceFile, upgradedSourceFile), print(upgradedSourceFile)].join('');
}

function getImport(originalSourceFile: SourceFile, upgradedSourceFile: SourceFile): string {
  const needsImport = checkNeedsImport(originalSourceFile, upgradedSourceFile);
  if (!needsImport) {
    return '';
  }

  const [exportStatement] = tsquery(originalSourceFile, EXPORT_QUERY);
  const [exportVariableDeclaration] = tsquery(originalSourceFile, EXPORT_VARIABLE_DECLARATION_QUERY);

  if (exportStatement || exportVariableDeclaration) {
    return `import { BettererTest } from '@betterer/betterer';`;
  }

  const [moduleExports] = tsquery(originalSourceFile, EXPORT_MODULE_EXPORTS_QUERY);
  if (moduleExports) {
    return `const { BettererTest } = require('@betterer/betterer');`;
  }
  return '';
}

// import {} from '@betterer/betterer';
// const {} = require('@betterer/better');
const IMPORT_QUERY =
  ':matches(ImportDeclaration, VariableStatement:has(CallExpression:has(Identifier[name="require"]))):has(StringLiteral[value="@betterer/betterer"])';

// BettererTest
const BETTERER_TEST_QUERY = 'Identifier[name="BettererTest"]';

function checkNeedsImport(originalSourceFile: SourceFile, upgradedSourceFile: SourceFile): boolean {
  const bettererImports = tsquery(originalSourceFile, IMPORT_QUERY);
  const existingImport = bettererImports.some(
    (bettererImport) => tsquery(bettererImport, BETTERER_TEST_QUERY).length > 0
  );
  const usedInUpgrade = tsquery(upgradedSourceFile, BETTERER_TEST_QUERY).length > 0;
  return !existingImport && usedInUpgrade;
}

function print(upgradedSourceFile: SourceFile): string {
  const printed = printer.printFile(upgradedSourceFile);
  return printed.replace(/\/\* BLANK LINE \*\//g, '\n\n');
}

exposeToMainΔ({ run });

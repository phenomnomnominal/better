import { BettererError } from '@betterer/errors';
import type { BettererLogger } from '@betterer/logger';
import { diffStrings__ } from '@betterer/logger';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { promises as fs } from 'fs';
import * as path from 'path';

const EXCLUDED_PACKAGES = ['docgen', 'extension', 'fixture', 'render'];
const EXTRACTION_EXTENSION = '.api.md';
const EXTRACTION_CONFIG_FILE = 'api-extractor.json';
const PACKAGES_DIR = path.resolve(__dirname, '../../../packages');
const GOLDENS_DIR = path.resolve(__dirname, '../../../goldens/api');
const TEMP_DIR = path.resolve(__dirname, '../../../goldens/temp');

const INTERNAL_TOKENS = ['Ω'];

export async function getPackages(): Promise<Array<string>> {
  const items = await fs.readdir(PACKAGES_DIR);

  const testDirectory = await Promise.all(
    items.map(async (item) => {
      const stat = await fs.lstat(path.join(PACKAGES_DIR, item));
      return stat.isDirectory();
    })
  );

  const packages = items.filter((_, index) => testDirectory[index]);
  return packages.filter((packageName) => {
    return packageName && !EXCLUDED_PACKAGES.includes(packageName);
  });
}

export async function run(logger: BettererLogger, packageName: string): Promise<string> {
  await logger.progress(`Validating API for "@betterer/${packageName}" ...`);

  const packageGoldenPath = path.join(GOLDENS_DIR, `${packageName}${EXTRACTION_EXTENSION}`);
  const packageGeneratedPath = path.join(TEMP_DIR, `${packageName}${EXTRACTION_EXTENSION}`);

  const apiExtractorJsonPath: string = path.join(PACKAGES_DIR, packageName, EXTRACTION_CONFIG_FILE);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

  Extractor.invoke(extractorConfig, {
    messageCallback: (message) => (message.handled = true)
  });

  const packageGolden = await fs.readFile(packageGoldenPath, 'utf-8');
  const packageGenerated = await fs.readFile(packageGeneratedPath, 'utf-8');

  const foundToken = INTERNAL_TOKENS.find((token) => {
    return checkForBannedTokens(packageGolden, token) || checkForBannedTokens(packageGenerated, token);
  });

  if (foundToken) {
    throw new BettererError(
      `found "${foundToken}" in the API for "@betterer/${packageName}. This means internal code has been exposed.`
    );
  }

  if (packageGolden === packageGenerated) {
    return `No Breaking API changes found in "@betterer/${packageName}".`;
  }

  const diff = diffStrings__(packageGolden, packageGenerated, { aAnnotation: 'Golden', bAnnotation: 'Current' });
  throw new BettererError(`API changes found in "@betterer/${packageName.toString()}"`, diff);
}

function checkForBannedTokens(types: string, token: string): boolean {
  return types.includes(token);
}

import { BettererError } from '@betterer/errors';
import { promises as fs } from 'fs';

export async function accessResults(resultsFile: string): Promise<boolean> {
  try {
    await fs.access(resultsFile);
    return true;
  } catch {
    return false;
  }
}

export async function readResults(resultsFile: string): Promise<string> {
  try {
    return await fs.readFile(resultsFile, 'utf-8');
  } catch {
    throw new BettererError(`could not read from "${resultsFile}". 😔`);
  }
}

/**
 * @internal This could change at any point! Please don't use!
 *
 * Writes a {@link @betterer/results#printResults__ | printed results object}
 * to the given results file path.
 */
export async function writeResults__(printedResults: string, resultsFile: string): Promise<void> {
  try {
    await fs.writeFile(resultsFile, printedResults, 'utf8');
  } catch {
    throw new BettererError(`could not write to "${resultsFile}". 😔`);
  }
}

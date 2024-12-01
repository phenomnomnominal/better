import type { BettererFileGlobs, BettererFilePaths } from '@betterer/betterer';
import type ts from 'typescript';

export interface TypeScriptReadConfigResult {
  config: {
    compilerOptions: ts.CompilerOptions;
    files: BettererFilePaths;
    include?: BettererFileGlobs;
  };
}

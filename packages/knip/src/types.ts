import type { ISSUE_TYPE_TITLE } from 'knip/dist/constants.js';

import type { z } from 'zod';
import type { ConfigurationValidator } from 'knip/dist/ConfigurationValidator.js';

/**
 * @beta all the possible configuration file options that can be passed to {@link https://knip.dev | **Knip** }.
 *
 * @remarks this is import from internal references in the **Knip** knip, so it is quite fragile.
 * It *is* exported, but currently causes issues due to invalid internal path references.
 * Would be good to get the fixed types exposed from their public API!
 */
export type KnipConfig = z.infer<typeof ConfigurationValidator>;

/**
 * @beta all the possible CLI Options that can be passed to {@link https://knip.dev | **Knip** }.
 *
 * @remarks this is stolen from {@link https://github.com/webpro-nl/knip/blob/main/packages/knip/src/util/cli-arguments.ts  | the **Knip** codebase},
 * so it is quite fragile. Would be good to get this exposed from their public API, or even
 * better, a full JS API!
 */
export type KnipCLIOptions = Partial<{
  cache: boolean;
  cacheLocation: string;
  config: string;
  debug: boolean;
  dependencies: boolean;
  directory: string;
  exclude: string;
  exports: boolean;
  tags: Array<string>;
  experimentalTags: Array<string>;
  files: boolean;
  fix: boolean;
  fixType: Array<string>;
  allowRemoveFiles: boolean;
  help: boolean;
  ignoreInternal: boolean;
  include: Array<string>;
  includeLibs: boolean;
  includeEntryExports: boolean;
  isolateWorkspaces: boolean;
  maxIssues: string;
  noConfigHints: boolean;
  noExitCode: boolean;
  noGitignore: boolean;
  noProgress: boolean;
  performance: boolean;
  production: boolean;
  preprocessor: Array<string>;
  preprocessorOptions: string;
  reporter: Array<string>;
  reporterOptions: string;
  strict: boolean;
  trace: boolean;
  traceExport: string;
  traceFile: string;
  tsConfig: string;
  version: boolean;
  watch: boolean;
  workspace: string;
}>;

export type KnipIssueType = keyof typeof ISSUE_TYPE_TITLE;

/** @knipignore used by an exported function */
export interface KnipIssue {
  line?: number;
  col?: number;
  name: string;
}

export type KnipIssues = ReadonlyArray<KnipIssue>;

/** @knipignore used by an exported function */
export type KnipFileIssues = {
  file: string;
} & {
  [IssueType in KnipIssueType]: KnipIssues;
};

/** @knipignore used by an exported function */
export type KnipFilesIssues = ReadonlyArray<KnipFileIssues>;

/** @knipignore used by an exported function */
export type KnipIssuesForFile = Record<string, KnipIssues>;

/** @knipignore used by an exported function */
export type KnipIssuesByType = Partial<Record<KnipIssueType, KnipIssuesForFile>>;

export interface KnipReport {
  files: Array<string>;
  issues: KnipFilesIssues;
}

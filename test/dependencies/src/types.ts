import type { BettererWorkerAPI } from '@betterer/worker';
import type { ISSUE_TYPE_TITLE } from 'knip/dist/constants.js';

export type TestPackageDependenciesWorker = BettererWorkerAPI<typeof import('./test-package-dependencies.worker.js')>;

/**
 * @remarks
 */

export type KnipIssueType = keyof typeof ISSUE_TYPE_TITLE;

export interface KnipIssue {
  line: number;
  col: number;
  name: string;
}

export type KnipIssues = ReadonlyArray<KnipIssue>;

export type KnipFileIssues = {
  file: string;
} & {
  [IssueType in KnipIssueType]: KnipIssues;
};

export type KnipFilesIssues = ReadonlyArray<KnipFileIssues>;

export type KnipIssuesForFile = Record<string, KnipIssues>;
export type KnipIssuesByType = Partial<Record<KnipIssueType, KnipIssuesForFile>>;

export interface KnipReport {
  files: Array<string>;
  issues: KnipFilesIssues;
}

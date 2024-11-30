import type { BettererLogger } from '@betterer/logger';
import type { FC } from '@betterer/render';
import type { CreateTestFileWorker, EnableAutomergeWorker, UpdatePackageJSONWorker } from './types.js';

import { Box, React, useCallback } from '@betterer/render';
import { BettererLogo, BettererTaskLogger, BettererTasksLogger } from '@betterer/tasks';
import { exposeToWorkerΔ, importWorkerΔ } from '@betterer/worker';

/** @knipignore used by an exported function */
export interface InitProps {
  automerge: boolean;
  configPath: string;
  cwd: string;
  logo: boolean;
  repoPath: string;
  resultsPath: string;
  ts: boolean;
}

export const Init: FC<InitProps> = function Init({ automerge, cwd, configPath, logo, repoPath, resultsPath, ts }) {
  const runCreateTestFile = useCallback(
    async (logger: BettererLogger, status: BettererLogger) => {
      const createTestFile: CreateTestFileWorker = await importWorkerΔ('./create-test-file.worker.js');
      try {
        await createTestFile.api.run(exposeToWorkerΔ(logger), exposeToWorkerΔ(status), cwd, configPath);
      } finally {
        await createTestFile.destroy();
      }
    },
    [cwd, configPath]
  );
  const runUpdatePackageJSON = useCallback(
    async (logger: BettererLogger, status: BettererLogger) => {
      const updatePackageJSON: UpdatePackageJSONWorker = await importWorkerΔ('./update-package-json.worker.js');
      try {
        await updatePackageJSON.api.run(exposeToWorkerΔ(logger), exposeToWorkerΔ(status), cwd, ts);
      } finally {
        await updatePackageJSON.destroy();
      }
    },
    [cwd, ts]
  );
  const runEnableAutomerge = useCallback(
    async (logger: BettererLogger, status: BettererLogger) => {
      const enableAutomerge: EnableAutomergeWorker = await importWorkerΔ('./enable-automerge.worker.js');
      try {
        await enableAutomerge.api.run(exposeToWorkerΔ(logger), exposeToWorkerΔ(status), cwd, repoPath, resultsPath);
      } finally {
        await enableAutomerge.destroy();
      }
    },
    [cwd, resultsPath]
  );

  return (
    <Box flexDirection="column">
      {logo && <BettererLogo />}
      <BettererTasksLogger name="Initialising Betterer">
        <BettererTaskLogger name="Create test file" task={runCreateTestFile} />
        <BettererTaskLogger name="Update package.json" task={runUpdatePackageJSON} />
        {automerge && <BettererTaskLogger name="Enable automerge" task={runEnableAutomerge} />}
      </BettererTasksLogger>
    </Box>
  );
};

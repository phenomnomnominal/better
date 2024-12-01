import type { BettererLogger } from '@betterer/logger';
import type { FC } from '@betterer/render';
import type { BettererTasksState } from '@betterer/tasks';

import type { TestPackageAPIWorker } from './types.js';

import { React, getRenderOptionsΔ, render, useCallback } from '@betterer/render';
import { BettererTaskLogger, BettererTasksLogger } from '@betterer/tasks';
import { exposeToWorkerΔ, importWorkerΔ } from '@betterer/worker';

interface APITestProps {
  packageNames: Array<string>;
}

export const APITest: FC<APITestProps> = function APITest({ packageNames }) {
  return (
    <BettererTasksLogger name="Test Package APIs" update={update}>
      {packageNames.map((packageName) => {
        const task = useCallback(
          async (_: BettererLogger, status: BettererLogger) => {
            const worker: TestPackageAPIWorker = await importWorkerΔ('./test-package-api.worker.js');
            try {
              return await worker.api.run(exposeToWorkerΔ(status), packageName);
            } finally {
              await worker.destroy();
            }
          },
          [packageName, exposeToWorkerΔ]
        );
        return <BettererTaskLogger key={packageName} name={packageName} task={task} />;
      })}
    </BettererTasksLogger>
  );
};

function update(state: BettererTasksState): string {
  const { done, errors, running } = state;
  const runningStatus = running ? `${tests(running)} running... ` : '';
  const doneStatus = done ? `${tests(done)} done! ` : '';
  const errorStatus = errors ? `${tests(errors)} errored! ` : '';
  return `${runningStatus}${doneStatus}${errorStatus}`;
}

function tests(n: number): string {
  return `${String(n)} ${n === 1 ? 'test' : 'tests'}`;
}

void (async () => {
  const worker: TestPackageAPIWorker = await importWorkerΔ('./test-package-api.worker.js');
  const packageNames = await worker.api.getPackages();
  const test = render(<APITest packageNames={packageNames} />, getRenderOptionsΔ(process.env.NODE_ENV));
  await worker.destroy();
  await test.waitUntilExit();
})();

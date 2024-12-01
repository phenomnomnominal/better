import '@betterer/fixture';

import { beforeEach, vitest } from 'vitest';

beforeEach(() => {
  vitest.mock('@betterer/time', async (importOriginal): Promise<typeof import('@betterer/time')> => {
    const time: typeof import('@betterer/time') = await importOriginal();
    return {
      ...time,
      getPreciseTimeΔ: () => 0,
      getTimeΔ: () => 0
    };
  });
});

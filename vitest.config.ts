import { defineConfig } from 'vitest/config';

import { MCROptions } from './mcr.config.js';

import tsconfigPaths from 'vite-tsconfig-paths';

const isNode16 = process.version.startsWith('v16');

export default defineConfig({
  plugins: [
    tsconfigPaths({
      configNames: ['tsconfig.spec.json']
    })
  ],
  server: {
    watch: {
      ignored: ['**/fixtures/**']
    }
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.spec.ts'],
    exclude: ['test/**/*.e2e.spec.ts'],
    reporters: ['basic'],
    isolate: true,

    // node.js v16 struggled with all the parallelism...
    fileParallelism: !isNode16,

    // Our tests are basically E2E so they're a bit slow as is...
    slowTestThreshold: 30000,
    testTimeout: 90000,

    watch: false,
    coverage: {
      enabled: true,
      reportsDirectory: 'reports/unit-coverage-v8',

      provider: 'custom',
      customProviderModule: 'vitest-monocart-coverage',

      // @ts-expect-error - types are wrong for monocart I guess?
      coverageReportOptions: MCROptions
    }
  }
});

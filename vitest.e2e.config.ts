import { defineConfig } from 'vitest/config';

import config from './vitest.config.js';

export default defineConfig({
  test: {
    ...config.test,
    include: ['test/**/*.e2e.spec.ts'],
    exclude: [],
    coverage: {
      enabled: false
    }
  }
});

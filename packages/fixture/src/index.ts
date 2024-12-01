// Disable Ink/React DevTools in test:
if (process.env.NODE_ENV === 'test') {
  process.env.DEV = 'false';
}

import './polyfills.js';
import './stubs.js';

export type {
  Fixture,
  FixtureFactory,
  FixtureFileSystem,
  FixtureFileSystemFiles,
  FixtureOptions,
  Paths
} from './types.js';

export { createFixtureDirectoryΔ } from './fixture.js';
export { persist } from './persist.js';

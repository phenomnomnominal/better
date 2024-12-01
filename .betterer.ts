import { regexp } from '@betterer/regexp';
import { knip } from '@betterer/knip';

export default {
  'no hack comments': () =>
    regexp(/(\/\/\s*HACK)/i).include(['./packages/**/src/**/*.ts', './packages/**/src/**/*.tsx']),
  'no knip errors': () =>
    knip(
      './knip.json',
      {},
      {
        production: true,
        strict: true,
        tags: ['-knipignore', '-internal']
      }
    ).skip()
};

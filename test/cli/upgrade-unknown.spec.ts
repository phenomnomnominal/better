import { describe, it, expect } from 'vitest';

import { createFixture } from '../fixture.js';

const ARGV = ['node', './bin/betterer', 'upgrade'];

describe('betterer upgrade', () => {
  it(`should doesn't change things it doesn't need to change`, async () => {
    const { cliΔ } = await import('@betterer/cli');

    const { cleanup, logs, paths } = await createFixture(
      'upgrade-unknown',
      {
        './.betterer.ts': `
const { BettererTest } = require('@betterer/betterer');
const { bigger } = require('@betterer/constraints');

let start = 0;

// Don't remove this important comment!
console.log('some stuff here!');

// This stuff shouldn't be in here but let's not break things:
module.exports = {
  num: 9,
  str: 'some string',
  array: [],
  set: new Set(),
  regexp: /regexp/,
  object: {
    notTest: () => 3
  }
}

module.exports.getsBetter = () => new BettererTest({
  test: () => start++,
  constraint: bigger
});

export function foo () {
  console.log('something');
}

function bar () {
  console.log('something');
}
        `
      },
      {
        logFilters: [/🌟 Upgrading Betterer/]
      }
    );

    const fixturePath = paths.cwd;

    process.env.BETTERER_WORKER = 'false';

    await cliΔ(fixturePath, ARGV);

    expect(logs).toMatchSnapshot();

    await cleanup();
  });
});

import { describe, expect, it } from 'vitest';

import { invariantΔ } from '@betterer/errors';

describe('betterer', () => {
  it('should throw when an invariant fails', () => {
    expect(() => {
      invariantΔ(false, 'invariant failed!', { some: 'context' });
    }).toThrow();
  });
});

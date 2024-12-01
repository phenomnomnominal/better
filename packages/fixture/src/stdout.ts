import { getStdInΔ } from '@betterer/render';

export function createFixtureStdout() {
  async function sendKeys(keys: string): Promise<void> {
    getStdInΔ().emit('data', keys);

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return {
    sendKeys
  };
}

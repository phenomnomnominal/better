export function testBetter(name: string, delta = ''): string {
  return `${name} got better!${delta} 😍`;
}

export function testsBetter(count: number, delta = ''): string {
  return testBetter(getTests(count), delta);
}

function testChecked(name: string): string {
  return `${name} got checked. 🤔`;
}

export function testsChecked(count: number): string {
  return testChecked(getTests(count));
}

export function testComplete(name: string, isSame = false): string {
  return `${name}${isSame ? ` ${getHas(1)} already` : ''} met ${getIts(1)} goal! ${isSame ? '✨' : '🎉'}`;
}

export function testsComplete(count: number): string {
  return `${getTests(count)} met ${getIts(count)} goal! 🎉`;
}

export function testExpired(name: string): string {
  return `${name} ${getHas(1)} passed ${getIts(1)} deadline. 👻`;
}

export function testsExpired(count: number): string {
  return `${getTests(count)} ${getHas(count)} passed ${getIts(count)} deadline. 👻`;
}

function testFailed(name: string): string {
  return `${name} failed to run. 🔥`;
}

export function testsFailed(count: number): string {
  return testFailed(getTests(count));
}

export function testNew(name: string, delta = ''): string {
  return `${name} got checked for the first time!${delta} 🎉`;
}

export function testsNew(count: number, delta = ''): string {
  return testNew(getTests(count), delta);
}

export function testObsolete(name: string): string {
  return `${name} ${getIs(1)} obsolete! 🗑️`;
}

export function testsObsolete(count: number): string {
  return `${getTests(count)} ${getIs(count)} obsolete! 🗑️`;
}

export function testRemoved(name: string): string {
  return `${name} got removed! 👋🏻`;
}

export function testsRemoved(count: number): string {
  return testRemoved(getTests(count));
}

export function testRunning(name: string): string {
  return `running ${name}!`;
}

export function testSame(name: string, delta = ''): string {
  return `${name} stayed the same.${delta} 😐`;
}

export function testsSame(count: number, delta = ''): string {
  return testSame(getTests(count), delta);
}

export function testSkipped(name: string, delta = ''): string {
  return `${name} got skipped.${delta} 🚫`;
}

export function testsSkipped(count: number, delta = ''): string {
  return testSkipped(getTests(count), delta);
}

export function testUpdated(name: string, delta = ''): string {
  return `${name} got force updated.${delta} 🆙`;
}

export function testsUpdated(count: number, delta = ''): string {
  return testUpdated(getTests(count), delta);
}

export function testWorse(name: string, delta = ''): string {
  return `${name} got worse.${delta} 😔`;
}

export function testsWorse(count: number, delta = ''): string {
  return testWorse(getTests(count), delta);
}

export function testsChanged(): string {
  return 'Your tests have changed, re-checking everything...\nThis could take a sec. ⏰';
}

export function updateInstructionsWorse(): string {
  return 'You should try to fix the new issues! As a last resort, you can run `betterer --update` to force an update of the results file. 🆙';
}

export function updateInstructionsObsolete(): string {
  return 'You have saved tests results that no longer have tests! If they are no longer needed, you can run `betterer --update` to remove the obsolete results from the results file. 🆙';
}

export function unexpectedChanges(): string {
  return 'Unexpected changes detected in these tests while running in CI mode:';
}

export function unexpectedChangesInstructions(): string {
  return 'You should make sure the results file is up-to-date before committing!';
}

export function stayedTheSameButChanged(): string {
  return 'All test results stayed the same, but your code has changed in other ways!';
}

export function stayedTheSameButChangedInstructions(): string {
  return 'You should make sure the results file is up-to-date before committing, and also after a rebase! 🔃';
}

export function workflowSuggestions() {
  return 'Check out some suggestions to improve your workflow in the docs:';
}

export function workflowLink() {
  return 'https://phenomnomnominal.github.io/betterer/docs/workflow';
}

export function filesChecking(files: number): string {
  return `Checking ${getFiles(files)}... 🤔`;
}

export function filesChecked(files: number): string {
  return `Checked ${getFiles(files)}! 🔍`;
}

export function watchStart(): string {
  return 'Starting Betterer in watch mode! 🎉';
}

export function watchEnd(): string {
  return 'Stopping watch mode... 👋';
}

function getFiles(count: number): string {
  return count === 1 ? '1 file' : `${String(count)} files`;
}

function getTests(count: number): string {
  return count === 1 ? '1 test' : `${String(count)} tests`;
}

function getIs(count: number): string {
  return count === 1 ? 'is' : 'are';
}

function getHas(count: number): string {
  return count === 1 ? 'has' : 'have';
}

function getIts(count: number): string {
  return count === 1 ? 'its' : 'their';
}

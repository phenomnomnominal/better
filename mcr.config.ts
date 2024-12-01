export const MCROptions = {
  name: 'Unit Coverage Report',
  outputDir: './reports/unit-coverage',

  reports: ['v8', 'markdown-summary', 'console-summary'],

  filter: {
    '**/index.ts': false,
    '**/packages/angular/src/**': true,
    '**/packages/betterer/src/**': true,
    '**/packages/cli/src/**': true,
    '**/packages/constraints/src/**': true,
    '**/packages/coverage/src/**': true,
    '**/packages/errors/src/**': true,
    '**/packages/eslint/src/**': true,
    '**/packages/knip/src/**': false,
    '**/packages/logger/src/**': true,
    '**/packages/regexp/src/**': true,
    '**/packages/reporter/src/**': true,
    '**/packages/stylelint/src/**': true,
    '**/packages/tsquery/src/**': true,
    '**/packages/typescript/src/**': true,
    '**/packages/worker/src/**': true
  }
};

import type { BettererPackageJSON } from '@betterer/cli';
import type { Diagnostic, Uri } from 'vscode';

import assert from 'node:assert';

import { vscode, createFixture } from './runner/index.js';

describe('Betterer VSCode Extension', () => {
  jest.setTimeout(600000);

  it('should work', async () => {
    {
      const { resolve, readFile, deleteDirectory, deleteFile } = await createFixture('.', {
        'package.json': '{ "name": "e2e-init" }',
        'index.js': ''
      });

      await vscode.commands.executeCommand('betterer.init');

      await waitFor(() => readFile('.betterer.ts'));
      const packageJSON = await waitFor(() => readFile('package.json'));
      const pack = JSON.parse(packageJSON) as BettererPackageJSON;
      expect(pack.devDependencies['@betterer/cli']).toBeDefined();
      expect(pack.scripts.betterer).toBe('betterer');

      const bettererConfig = await readFile('.betterer.ts');
      expect(bettererConfig).not.toBe(null);

      await deleteDirectory(resolve('./.vscode'));
      await deleteFile(resolve('./package.json'));
      await deleteFile(resolve('./.betterer.ts'));
      await deleteFile(resolve('./index.js'));
    }

    {
      const { cleanup, resolve } = await createFixture('e2e-eslint', {
        '.betterer.ts': `
    const { eslint } = require('../../node_modules/@betterer/eslint');

    module.exports = {
      'e2e-eslint': () => eslint({ 'no-debugger': 'error' }).include('./src/**/*.ts')
    };
          `,
        '.eslintrc.cjs': `
    const path = require('node:path');

    module.exports = {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        project: path.resolve(__dirname, './tsconfig.json'),
        sourceType: 'module'
      },
      root: true,
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        'no-debugger': 0
      }
    };
          `,
        'tsconfig.json': `
    {
      "extends": "../../tsconfig.json",
      "include": ["./src/**/*", "./.betterer.js", "./.eslintrc.js"]
    }
          `,
        'package.json': `
    {
      "name": "betterer-e2e-eslint",
      "version": "0.0.1"
    }
          `,
        'src/index.ts': ''
      });

      const indexPath = resolve('./src/index.ts');
      const cachePath = resolve('./.betterer.cache');
      const configPath = resolve('./.betterer.js');
      const resultsPath = resolve('./.betterer.results');

      const indexUri = vscode.Uri.file(indexPath);

      const config = vscode.workspace.getConfiguration('betterer', indexUri);
      await config.update('resultsPath', resultsPath);
      await config.update('cachePath', cachePath);
      await config.update('configPath', configPath);

      await writeToFile(indexUri, 'debugger;');

      const { code, message } = await waitFor(() => getDiagnostics(indexUri));

      // TODO: Restore the `new` vs `existing` check:
      expect(code).toBeDefined();
      expect(code?.toString().startsWith('[e2e-eslint]')).toEqual(true);
      expect(message).toEqual(`Unexpected 'debugger' statement.`);

      await cleanup();
    }

    {
      const { cleanup, resolve } = await createFixture('e2e-typescript', {
        '.betterer.ts': `
import { BettererTest } from '@betterer/betterer';
import { typescript } from '@betterer/typescript';
import { persist } from '@betterer/fixture';
import { smaller } from '@betterer/constraints';

const shrinks = persist(import.meta.url, 'shrinks', 2);

export default {
  'e2e-typescript': () => typescript('./tsconfig.json', {
    strict: true
  }).include('./src/**/*.ts'),
  'should shrink': () => new BettererTest({
    test: () => shrinks.decrement(),
    constraint: smaller
  })
};
      `,
        'tsconfig.json': `
{
  "compilerOptions": {
    "noEmit": true,
    "lib": ["esnext", "dom"],
    "moduleResolution": "node",
    "target": "ES5",
    "typeRoots": [],
    "resolveJsonModule": true
  },
  "include": ["./src/**/*"]
}
          `,
        'src/index.ts': ''
      });

      const indexPath = resolve('./src/index.ts');
      const cachePath = resolve('./.betterer.cache');
      const configPath = resolve('./.betterer.ts');
      const resultsPath = resolve('./.betterer.results');

      const indexUri = vscode.Uri.file(indexPath);

      const config = vscode.workspace.getConfiguration('betterer', indexUri);
      await config.update('resultsPath', resultsPath);
      await config.update('cachePath', cachePath);
      await config.update('configPath', configPath);

      await writeToFile(
        indexUri,
        `
export function extractIds(list) {
  return list.map((member) => member.id);
}
        `
      );

      const { code, message } = await waitFor(() => {
        const diagnostic = getDiagnostics(indexUri);
        assert.ok(diagnostic.code !== 7044);
        return diagnostic;
      });

      // TODO: Restore the `new` vs `existing` check:
      expect(code).toBeDefined();
      expect(code?.toString().startsWith('[e2e-typescript]')).toEqual(true);
      expect(message).toEqual(`Parameter 'list' implicitly has an 'any' type.`);

      await cleanup();
    }
  });
});

async function writeToFile(uri: Uri, text: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document, 1, false);
  await editor.edit((edit) => {
    edit.insert(new vscode.Position(0, 0), text);
  });
  await document.save();
}

function getDiagnostics(uri: Uri): Diagnostic {
  const found = vscode.languages.getDiagnostics().find((diagnostic) => {
    const [url, diagnostics] = diagnostic;
    return url.path === uri.path && diagnostics.length;
  });
  assert.ok(found);
  const [, diagnostics] = found;
  const [diagnostic] = diagnostics;
  return diagnostic;
}

function waitFor<T>(test: () => T, timeout = 600000): Promise<T> {
  const start = Date.now();

  type PromiseArgs = Parameters<ConstructorParameters<typeof Promise>[0]>;
  type Resolve = PromiseArgs[0];
  type Reject = PromiseArgs[1];

  async function wait(id: NodeJS.Timeout, resolve: Resolve, reject: Reject) {
    try {
      const result = await Promise.resolve(test());
      if (result != null) {
        clearInterval(id);
        resolve(result);
      }
    } catch {
      if (Date.now() - start > timeout) {
        reject();
      }
    }
  }

  return new Promise((resolve, reject) => {
    const id = setInterval(() => {
      void wait(id, resolve as Resolve, reject);
    }, 1000);
  });
}

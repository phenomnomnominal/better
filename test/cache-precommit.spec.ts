import { describe, expect, it } from 'vitest';

import { simpleGit } from 'simple-git';

import { createFixture } from './fixture.js';

describe('betterer', () => {
  it('should work with precommit', async () => {
    const { betterer } = await import('@betterer/betterer');

    const { logs, paths, readFile, cleanup, resolve, writeFile } = await createFixture('cache-precommit', {
      '.betterer.js': `
import { regexp } from '@betterer/regexp';
import { eslint } from '@betterer/eslint';

export default {
  'no enzyme tests': () => regexp(/from 'enzyme'/g).include('**/*.test.*'),
  'no explicit any': () =>
    eslint({
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      }
    }).include('**/*.{ts,tsx}'),
  'no type assertions': () =>
    eslint({
      rules: {
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          {
            assertionStyle: 'never',
          },
        ]
      }
    }).include('**/*.{ts,tsx}'),
};
    `,
      'eslint.config.js': `
import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default tslint.config(
  eslint.configs.recommended,
  ...tslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url))
      },
    },
  }
);
    `,
      'tsconfig.json': `
{
"include": ["./src/**/*"]
}
    `,
      'src/example.test.tsx': `
import { mount, shallow } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { QueryOperationRow } from './QueryOperationRow';

describe('QueryOperationRow', () => {
  it('renders', () => {
    expect(() =>
      shallow(
        <QueryOperationRow id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      )
    ).not.toThrow();
  });

  describe('callbacks', () => {
    it('should not call onOpen when component is shallowed', async () => {
      const onOpenSpy = jest.fn();
      // @ts-ignore strict null error, you shouldn't use promise like approach with act but I don't know what the intention is here
      await act(async () => {
        shallow(
          <QueryOperationRow onOpen={onOpenSpy} id="test-id" index={0}>
            <div>Test</div>
          </QueryOperationRow>
        );
      });
      expect(onOpenSpy).not.toBeCalled();
    });

    it('should call onOpen when row is opened and onClose when row is collapsed', async () => {
      const onOpenSpy = jest.fn();
      const onCloseSpy = jest.fn();
      const wrapper = mount(
        <QueryOperationRow title="title" onOpen={onOpenSpy} onClose={onCloseSpy} isOpen={false} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );
      const titleEl = wrapper.find({ 'aria-label': 'Query operation row title' });
      expect(titleEl).toHaveLength(1);

      // @ts-ignore strict null error, you shouldn't use promise like approach with act but I don't know what the intention is here
      await act(async () => {
        // open
        titleEl.first().simulate('click');
      });

      // @ts-ignore strict null error, you shouldn't use promise like approach with act but I don't know what the intention is here
      await act(async () => {
        // close
        titleEl.first().simulate('click');
      });

      expect(onOpenSpy).toBeCalledTimes(1);
      expect(onCloseSpy).toBeCalledTimes(1);
    });
  });

  describe('headerElement rendering', () => {
    it('should render headerElement provided as element', () => {
      const title = <div aria-label="test title">Test</div>;
      const wrapper = mount(
        <QueryOperationRow headerElement={title} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      const titleEl = wrapper.find({ 'aria-label': 'test title' });
      expect(titleEl).toHaveLength(1);
    });

    it('should render headerElement provided as function', () => {
      const title = () => <div aria-label="test title">Test</div>;
      const wrapper = mount(
        <QueryOperationRow headerElement={title} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      const titleEl = wrapper.find({ 'aria-label': 'test title' });
      expect(titleEl).toHaveLength(1);
    });

    it('should expose api to headerElement rendered as function', () => {
      const propsSpy = jest.fn();
      const title = (props: any) => {
        propsSpy(props);
        return <div aria-label="test title">Test</div>;
      };
      shallow(
        <QueryOperationRow headerElement={title} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      expect(Object.keys(propsSpy.mock.calls[0][0])).toContain('isOpen');
    });
  });

  describe('actions rendering', () => {
    it('should render actions provided as element', () => {
      const actions = <div aria-label="test actions">Test</div>;
      const wrapper = mount(
        <QueryOperationRow actions={actions} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      const actionsEl = wrapper.find({ 'aria-label': 'test actions' });
      expect(actionsEl).toHaveLength(1);
    });
    it('should render actions provided as function', () => {
      const actions = () => <div aria-label="test actions">Test</div>;
      const wrapper = mount(
        <QueryOperationRow actions={actions} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      const actionsEl = wrapper.find({ 'aria-label': 'test actions' });
      expect(actionsEl).toHaveLength(1);
    });

    it('should expose api to title rendered as function', () => {
      const propsSpy = jest.fn();
      const actions = (props: any) => {
        propsSpy(props);
        return <div aria-label="test actions">Test</div>;
      };
      shallow(
        <QueryOperationRow actions={actions} id="test-id" index={0}>
          <div>Test</div>
        </QueryOperationRow>
      );

      expect(Object.keys(propsSpy.mock.calls[0][0])).toEqual(['isOpen', 'onOpen', 'onClose']);
    });
  });
});
`
    });

    const cachePath = paths.cache;
    const configPaths = [paths.config];
    const resultsPath = paths.results;

    const indexPath = resolve('./src/example.test.tsx');

    await betterer({ configPaths, resultsPath, cachePath, workers: false });

    const firstCache = await readFile(cachePath);

    expect(firstCache).toMatchSnapshot();

    const firstResult = await readFile(resultsPath);

    expect(firstResult).toMatchSnapshot();

    // Should bust the cache:
    const indexContent = await readFile(indexPath);
    await writeFile(indexPath, indexContent.replace(`import { mount, shallow } from 'enzyme';\n`, ''));

    await betterer({ configPaths, resultsPath, cachePath, workers: false, precommit: true, repoPath: './' });

    const nextCache = await readFile(cachePath);

    expect(nextCache).toMatchSnapshot();

    const nextResult = await readFile(resultsPath);

    expect(nextResult).toMatchSnapshot();

    expect(firstCache).not.toEqual(nextCache);

    expect(logs).toMatchSnapshot();

    const git = simpleGit();

    await git.reset([resultsPath]);

    await cleanup();
  });
});

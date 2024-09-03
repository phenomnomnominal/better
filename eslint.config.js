import { FlatCompat } from '@eslint/eslintrc';
import jsLint from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tsLint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
});

// eslint-disable-next-line no-undef -- process is global
const isTest = process.env['TEST'];

export default tsLint.config(
  { files: ['packages/**/src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}', '*.{ts}'] },
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'reports/**', 'website/**', '**/.vscode-test/**']
  },

  // TODO: Should probably add ESLint config files to test fixtures
  // instead. Don't ignore `fixtures` directory when running tests:
  !isTest ? { ignores: ['fixtures/**'] } : {},

  // TODO: Fix when extension is upgraded:
  {
    ignores: [
      '**/jest.config.js',
      '**/webpack.server.config.js',
      '**/webpack.client.config.js',
      '**/extension/test/*.e2e-spec.ts'
    ]
  },

  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname
      }
    }
  },

  comments.recommended,
  jsLint.configs.recommended,

  {
    rules: {
      'no-console': 'error',
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: ['eslint-enable'] }]
    }
  },

  ...compat.plugins('require-extensions'),
  ...compat.extends('plugin:require-extensions/recommended'),

  // TODO: Fix when import rules support ESLint 9:
  // ...compat.extends('plugin:import/recommended'),
  // ...compat.extends('plugin:import/typescript'),

  ...tsLint.configs.strictTypeChecked,
  ...tsLint.configs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/return-await': ['error', 'always'],
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/member-ordering': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', disallowTypeAnnotations: false }
      ],
      '@typescript-eslint/array-type': ['error', { default: 'generic', readonly: 'generic' }],
      '@typescript-eslint/no-invalid-void-type': 'off'
    }
  },

  {
    files: ['*.js'],
    ...tsLint.configs.disableTypeChecked
  },

  prettier
);

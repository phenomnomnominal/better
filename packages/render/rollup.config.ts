import { defineConfig } from 'rollup';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

export default defineConfig({
  input: './src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    strict: false
  },
  plugins: [
    replace({
      preventAssignment: true,
      [`process.env.NODE_ENV`]: JSON.stringify('production'),
      "'use strict'": '',
      // React dev tools breaks tests because of the `ink` DEV mode
      [`process.env.DEV`]: JSON.stringify(false)
    }),
    nodeResolve({
      dedupe: ['react', 'react-reconciler'],
      preferBuiltins: true
    }),
    json(),
    commonjs({
      include: /node_modules/
    }),
    typescript({
      outputToFilesystem: false,
      sourceMap: true
    })
  ]
});

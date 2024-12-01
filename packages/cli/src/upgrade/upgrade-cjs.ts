import type { BinaryExpression, SourceFile } from 'typescript';

import { tsquery } from '@phenomnomnominal/tsquery';
import { factory, isObjectLiteralExpression } from 'typescript';

import { reparse, wrapTest, wrapTests } from './utils.js';

// foo
const TEST_NAME_QUERY = 'Identifier[name!=/module/][name!=/exports/]';

// module.exports = {}
const EXPORT_TESTS_QUERY = `BinaryExpression:has(BinaryExpression > PropertyAccessExpression:not(:has(${TEST_NAME_QUERY}))):has(ObjectLiteralExpression)`;

// module.exports.foo
const EXPORT_TEST_QUERY = `BinaryExpression:has(BinaryExpression > PropertyAccessExpression:has(PropertyAccessExpression > ${TEST_NAME_QUERY}))`;

export function upgradeCJS(originalSourceFile: SourceFile, configPath: string): SourceFile {
  let upgraded = reparse(
    tsquery.map(originalSourceFile, EXPORT_TESTS_QUERY, (configExports) => {
      const { left, operatorToken, right } = configExports as BinaryExpression;
      if (isObjectLiteralExpression(right)) {
        return factory.createBinaryExpression(left, operatorToken, wrapTests(right));
      }
      return configExports;
    }),
    configPath
  );

  upgraded = reparse(
    tsquery.map(upgraded, EXPORT_TEST_QUERY, (configExportConst) => {
      const { left, operatorToken, right } = configExportConst as BinaryExpression;
      const wrapped = wrapTest(right);
      if (!wrapped) {
        return configExportConst;
      }
      return factory.createBinaryExpression(left, operatorToken, wrapped);
    }),
    configPath
  );

  return upgraded;
}

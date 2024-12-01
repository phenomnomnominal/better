import type { ExportAssignment, SourceFile, VariableDeclaration } from 'typescript';

import { tsquery } from '@phenomnomnominal/tsquery';
import { factory, isObjectLiteralExpression } from 'typescript';

import { reparse, wrapTest, wrapTests } from './utils.js';

// export const foo
const EXPORT_TEST_QUERY = 'VariableStatement:has(ExportKeyword) VariableDeclaration';

// export default {}
const EXPORT_TESTS_QUERY = 'ExportAssignment:has(PropertyAssignment)';

export function upgradeESM(originalSourceFile: SourceFile, configPath: string): SourceFile {
  let upgraded = reparse(
    tsquery.map(originalSourceFile, EXPORT_TESTS_QUERY, (configExports) => {
      const { expression, modifiers, isExportEquals } = configExports as ExportAssignment;
      if (isObjectLiteralExpression(expression)) {
        return factory.createExportAssignment(modifiers, isExportEquals, wrapTests(expression));
      }
      return configExports;
    }),
    configPath
  );

  upgraded = reparse(
    tsquery.map(upgraded, EXPORT_TEST_QUERY, (configExportConst) => {
      const { name, exclamationToken, type, initializer } = configExportConst as VariableDeclaration;
      const wrapped = !!initializer && wrapTest(initializer);
      if (!wrapped) {
        return configExportConst;
      }
      return factory.createVariableDeclaration(name, exclamationToken, type, wrapped);
    }),
    configPath
  );

  return upgraded;
}

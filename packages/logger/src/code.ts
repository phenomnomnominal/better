import { codeFrameColumns } from '@babel/code-frame';
import LinesAndColumns from 'lines-and-columns';
import * as path from 'path';

import { BettererLoggerCodeInfo } from './types';

const IS_JS_REGEXP = /.t|jsx?$/;

export function code(codeInfo: BettererLoggerCodeInfo): string {
  const { filePath, fileText, message } = codeInfo;
  const isJS = IS_JS_REGEXP.exec(path.extname(filePath));
  const options = {
    highlightCode: !!isJS,
    message
  };
  const lc = new LinesAndColumns(fileText);
  const startLocation = codeInfo;
  const startIndex = lc.indexForLocation(startLocation) || 0;
  const endLocation = lc.locationForIndex(startIndex + codeInfo.length) || startLocation;
  const start = {
    line: startLocation.line + 1,
    column: startLocation.column + 1
  };
  const end = {
    line: endLocation.line + 1,
    column: endLocation.column + 1
  };
  return `\n  // ${filePath}\n${codeFrameColumns(fileText, { start, end }, options)}\n`;
}

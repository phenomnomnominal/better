import type { BettererLoggerCodeInfo } from './types.js';

import { codeFrameColumns } from '@babel/code-frame';
import { LinesAndColumns } from 'lines-and-columns';
import path from 'node:path';

const IS_JS_REGEXP = /.t|jsx?$/;
const IS_JSON_REGEXP = /.json$/;
const IS_CSS_REGEXP = /.s?css$/;

/**
 * @internal Definitely not stable! Please don't use!
 *
 * Logs a code block with syntax highlighting and a message.
 */
export function codeΔ(codeInfo: BettererLoggerCodeInfo): string {
  codeInfo.line = isNaN(codeInfo.line) ? 0 : codeInfo.line;
  codeInfo.column = isNaN(codeInfo.column) ? 0 : codeInfo.column;

  const { filePath, fileText, message } = codeInfo;
  const ext = path.extname(filePath);
  const isJS = IS_JS_REGEXP.exec(ext);
  const isJSON = IS_JSON_REGEXP.exec(ext);
  const isCSS = IS_CSS_REGEXP.exec(ext);
  const options = {
    highlightCode: !!(isJS ?? isJSON ?? isCSS),
    message
  };
  const lc = new LinesAndColumns(fileText);
  const startLocation = codeInfo;
  const startIndex = lc.indexForLocation(startLocation) ?? 0;
  const endLocation = lc.locationForIndex(startIndex + codeInfo.length) ?? startLocation;
  const start = {
    line: startLocation.line + 1,
    column: startLocation.column + 1
  };
  const end = {
    line: endLocation.line + 1,
    column: endLocation.column + 1
  };
  // `codeFrameColumns` doesn't handle empty strings very well, so add some whitespace!
  return `\n${codeFrameColumns(fileText || ' ', { start, end }, options)}\n`;
}

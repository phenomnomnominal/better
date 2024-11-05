import type { CompilerOptions, DiagnosticWithLocation, ParseConfigHost } from 'typescript';
import type { TypeScriptReadConfigResult } from './types.js';

import { BettererFileTest, BettererCacheStrategy } from '@betterer/betterer';
import { BettererError, invariantΔ } from '@betterer/errors';
import path from 'node:path';
import ts from 'typescript';

const NEW_LINE = '\n';

// TypeScript throws a 6307 error when it need to access type information from a file
// that wasn't included by the tsconfig. This happens whenever we run the compiler on
// a subset of files, so we need to filter out those errors!
const CODE_FILE_NOT_INCLUDED = 6307;

/**
 * @public Use this test to incrementally introduce {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html | **TypeScript** configuration}
 * to your codebase.
 *
 * @remarks {@link @betterer/typescript#typescript | `typescript`} is a {@link @betterer/betterer#BettererFileTest | `BettererFileTest`},
 * so you can use {@link @betterer/betterer#BettererResolverTest.include | `include()`}, {@link @betterer/betterer#BettererResolverTest.exclude | `exclude()`},
 * {@link @betterer/betterer#BettererTest.only | `only()`}, and {@link @betterer/betterer#BettererTest.skip | `skip()`}.
 *
 * @example
 * ```typescript
 * import { typescript } from '@betterer/typescript';
 *
 * export default {
 *  'stricter compilation': () =>
 *    typescript('./tsconfig.json', {
 *      strict: true
 *    })
 *    .include('./src/*.ts')
 * };
 * ```
 *
 * @param configFilePath - The relative path to a tsconfig.json file.
 * @param extraCompilerOptions - Additional {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html | **TypeScript** configuration }
 * to enable.
 *
 * @throws {@link @betterer/errors#BettererError | `BettererError` }
 * Will throw if the user doesn't pass `configFilePath` or `extraCompilerOptions`.
 */
export function typescript(configFilePath: string, extraCompilerOptions: CompilerOptions = {}): BettererFileTest {
  if (!configFilePath) {
    throw new BettererError(
      "for `@betterer/typescript` to work, you need to provide the path to a tsconfig.json file, e.g. `'./tsconfig.json'`. ❌"
    );
  }

  return new BettererFileTest((filePaths, fileTestResult, resolver) => {
    if (filePaths.length === 0) {
      return;
    }

    const absoluteConfigFilePath = resolver.resolve(configFilePath);
    const { config } = ts.readConfigFile(
      absoluteConfigFilePath,
      ts.sys.readFile.bind(ts.sys)
    ) as TypeScriptReadConfigResult;
    const { compilerOptions } = config;
    const basePath = path.dirname(absoluteConfigFilePath);

    const fullCompilerOptions = {
      ...compilerOptions,
      ...extraCompilerOptions,
      noErrorTruncation: true
    };
    config.compilerOptions = fullCompilerOptions;

    if (!config.compilerOptions.incremental) {
      config.files = filePaths;
      delete config.include;
    }

    const compilerHost = ts.createCompilerHost(fullCompilerOptions);
    const configHost: ParseConfigHost = {
      ...compilerHost,
      readDirectory: ts.sys.readDirectory.bind(ts.sys),
      useCaseSensitiveFileNames: compilerHost.useCaseSensitiveFileNames()
    };
    const { options, fileNames } = ts.parseJsonConfigFileContent(config, configHost, basePath);
    const incrementalHost = ts.createIncrementalCompilerHost(options);

    const oldProgram = ts.readBuilderProgram(options, incrementalHost);
    const program = oldProgram
      ? ts.createEmitAndSemanticDiagnosticsBuilderProgram(fileNames, options, incrementalHost, oldProgram)
      : ts.createIncrementalProgram({
          options,
          rootNames: fileNames,
          host: incrementalHost
        });

    const { diagnostics } = program.emit();

    const allDiagnostics = ts.sortAndDeduplicateDiagnostics([
      ...diagnostics,
      ...program.getConfigFileParsingDiagnostics(),
      ...program.getOptionsDiagnostics(),
      ...program.getSyntacticDiagnostics(),
      ...program.getGlobalDiagnostics(),
      ...program.getSemanticDiagnostics()
    ]);

    allDiagnostics
      .filter((diagnostic): diagnostic is DiagnosticWithLocation => {
        const { file, start, length } = diagnostic;
        return file != null && start != null && length != null;
      })
      .filter(({ file, code }) => filePaths.includes(file.fileName) && code !== CODE_FILE_NOT_INCLUDED)
      .forEach(({ start, length, file, source, messageText }) => {
        const resultFile = fileTestResult.addFile(file.fileName, file.getFullText());
        const message = ts.flattenDiagnosticMessageText(messageText, NEW_LINE);
        resultFile.addIssue(start, start + length, typescriptIssueMessage(source, message));
      });
  }).cache(BettererCacheStrategy.FilePaths);
}

function typescriptIssueMessage(source = 'tsc', message: string) {
  let issueMessage = source ? `${source}: ` : '';
  issueMessage = `${issueMessage}${message}`;
  issueMessage = fixUnionOrder(issueMessage);
  issueMessage = fixMissingProperties(issueMessage);
  return issueMessage;
}

// TypeScript produces error messages that are unstable.
// Trying to handle this is probably a bad idea (https://github.com/microsoft/TypeScript/issues/49996#issuecomment-1198383661)
// But what the heck, let's give it a go.
// And yes I know this should probably use a parser instead of a RegExp but maybe it's good enough?
//
// Example input:
//   "Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Document | Node | Element | Window'.\n	 Type 'null' is not assignable to type 'Document | Node | Element | Window'.",
// Output:
//   "Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Document | Element | Node | Window'.\n	 Type 'null' is not assignable to type 'Document | Element | Node | Window'.",
const UNION_REGEX = /'([^']*?\s+\|+\s+[^']*?)'/g;
function fixUnionOrder(message: string): string {
  const matches = [...message.matchAll(UNION_REGEX)];
  matches.forEach((match) => {
    const [, union] = match;
    invariantΔ(union, 'RegExp has group so matches must contain union!');
    const members = union.split('|').map((member) => member.trim());
    const sortedMembers = members.sort();
    const sortedUnion = sortedMembers.join(' | ');
    message = message.replace(union, sortedUnion);
  });
  return message;
}

// Again we will probably regret this but:
//
// Example input:
//   "Type '{}' is missing the following properties from type 'D': d1, d2, d3, d4"
//   "Type '{}' is missing the following properties from type 'F': f1, f2, f3, f4, and 2 more."
// Output:
//   "Type '{}' is missing 4 properties from type 'D'"
//   "Type '{}' is missing 6 properties from type 'F'"
const MISSING_PROPERTIES_MESSAGE = 'is missing the following properties from type';
const MISSING_PROPERTIES_REGEXP = /from type '.*?':((?:\W+.*?,)+\W.*)/g;
const AND_N_MORE_REGEXP = /and\W(.*)\Wmore/;
function fixMissingProperties(message: string): string {
  if (message.includes(MISSING_PROPERTIES_MESSAGE)) {
    const matches = [...message.matchAll(MISSING_PROPERTIES_REGEXP)];
    matches.forEach((match) => {
      const [, props] = match;
      invariantΔ(props, 'RegExp has group so matches must contain properties!');
      const propNames = props.split(',').map((member) => member.trim());

      const last = propNames[propNames.length - 1];
      invariantΔ(last, 'RegExp has matches must contain a property!');

      let nProps = propNames.length;
      const hasNMore = AND_N_MORE_REGEXP.exec(last);
      if (hasNMore) {
        const [, nStr] = hasNMore;
        invariantΔ(nStr, 'RegExp has matches must contain a property!');
        const n = parseFloat(nStr);
        nProps = nProps + n - 1;
      }
      message = message.replace('the following', String(nProps));
      message = message.replace(`:${props}`, '');
    });
  }
  return message;
}

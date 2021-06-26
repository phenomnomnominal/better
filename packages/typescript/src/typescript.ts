import { BettererFileGlobs, BettererFilePaths, BettererFileTest } from '@betterer/betterer';
import { BettererError } from '@betterer/errors';
import * as path from 'path';
import * as ts from 'typescript';

const NEW_LINE = '\n';

type TypeScriptReadConfigResult = {
  config: {
    compilerOptions: ts.CompilerOptions;
    files: BettererFilePaths;
    include?: BettererFileGlobs;
  };
};

// TypeScript throws a 6307 error when it need to access type information from a file
// that wasn't included by the tsconfig. This happens whenever we run the compiler on
// a subset of files, so we need to filter out those errors!
const CODE_FILE_NOT_INCLUDED = 6307;

export function typescript(configFilePath: string, extraCompilerOptions: ts.CompilerOptions = {}): BettererFileTest {
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
      ...extraCompilerOptions
    };
    config.compilerOptions = fullCompilerOptions;

    if (!config.compilerOptions.incremental) {
      config.files = filePaths;
      delete config.include;
    }

    const compilerHost = ts.createCompilerHost(fullCompilerOptions);
    const configHost: ts.ParseConfigHost = {
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
      .filter((diagnostic): diagnostic is ts.DiagnosticWithLocation => {
        const { file, start, length } = diagnostic;
        return file != null && start != null && length != null;
      })
      .filter(({ file, code }) => {
        return filePaths.includes(file.fileName) && code !== CODE_FILE_NOT_INCLUDED;
      })
      .forEach(({ start, length, file: source, messageText }) => {
        const file = fileTestResult.addFile(source.fileName, source.getFullText());
        const message = ts.flattenDiagnosticMessageText(messageText, NEW_LINE);
        file.addIssue(start, start + length, message);
      });
  });
}

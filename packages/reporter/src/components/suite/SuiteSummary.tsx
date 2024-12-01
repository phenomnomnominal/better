import type { BettererContext, BettererSuiteSummary } from '@betterer/betterer';
import type { FC, TextProps } from '@betterer/render';

import { Box, React, Text, memo } from '@betterer/render';
import { BettererTasksResult } from '@betterer/tasks';

import {
  testsBetter,
  testsChecked,
  testsComplete,
  testsExpired,
  testsFailed,
  testsNew,
  testsObsolete,
  testsRemoved,
  testsSame,
  testsSkipped,
  testsUpdated,
  testsWorse,
  unexpectedChanges,
  unexpectedChangesInstructions,
  stayedTheSameButChanged,
  stayedTheSameButChangedInstructions,
  updateInstructionsObsolete,
  updateInstructionsWorse
} from '../../messages.js';
import { useReporterState } from '../../state/index.js';
import { RunSummary } from './RunSummary.js';
import { update } from './update.js';
import { WorkflowSuggestions } from './WorkflowSuggestions.js';

/** @knipignore used by an exported function */
export interface SuiteSummaryProps {
  context: BettererContext;
  suiteSummary: BettererSuiteSummary;
}

type TestCategories = Exclude<keyof BettererSuiteSummary, 'error' | 'filePaths' | 'runs' | 'runSummaries'>;

const TEXT_COLOURS: Record<TestCategories, TextProps['color']> = {
  better: 'greenBright',
  changed: 'red',
  completed: 'greenBright',
  expired: 'brightRed',
  failed: 'brightRed',
  new: 'gray',
  obsolete: 'magentaBright',
  ran: 'gray',
  removed: 'white',
  same: 'brightYellow',
  skipped: 'brightYellow',
  updated: 'white',
  worse: 'red'
};

export const SuiteSummary: FC<SuiteSummaryProps> = memo(function SuiteSummary({ context, suiteSummary }) {
  const [state] = useReporterState();

  function getColor(name: TestCategories): TextProps['color'] {
    return TEXT_COLOURS[name];
  }

  function showIfHasCategory(name: TestCategories, getMessage: (count: number) => string): React.JSX.Element | null {
    const count = suiteSummary[name].length;
    return count ? <Text color={getColor(name)}>{getMessage(count)}</Text> : null;
  }

  const { endTime } = state;

  if (endTime == null) {
    return null;
  }

  const unexpectedChangesDetected = context.config.ci && suiteSummary.changed.length;
  const fileContentChanges = unexpectedChangesDetected && onlyFileContentsChanges(suiteSummary);

  return (
    <>
      <Box flexDirection="column" paddingBottom={1}>
        <BettererTasksResult {...state} name="Betterer" time={endTime} update={update}>
          {suiteSummary.runSummaries.map((runSummary) => (
            <RunSummary key={runSummary.name} runSummary={runSummary} />
          ))}
        </BettererTasksResult>
      </Box>
      <Box flexDirection="column" paddingBottom={1}>
        <Text color={getColor('ran')}>{testsChecked(suiteSummary.ran.length)}</Text>
        {showIfHasCategory('new', testsNew)}
        {showIfHasCategory('better', testsBetter)}
        {showIfHasCategory('completed', testsComplete)}
        {showIfHasCategory('same', testsSame)}
        {showIfHasCategory('failed', testsFailed)}
        {showIfHasCategory('skipped', testsSkipped)}
        {showIfHasCategory('updated', testsUpdated)}
        {suiteSummary.worse.length ? (
          <>
            <Box paddingBottom={1}>
              <Text color={getColor('worse')}>{testsWorse(suiteSummary.worse.length)}</Text>
            </Box>
            {!context.config.strict ? <Text>{updateInstructionsWorse()}</Text> : null}
          </>
        ) : null}
        {showIfHasCategory('removed', testsRemoved)}
        {suiteSummary.obsolete.length ? (
          <>
            <Box paddingBottom={1}>
              <Text color={getColor('obsolete')}>{testsObsolete(suiteSummary.obsolete.length)}</Text>
            </Box>
            {<Text>{updateInstructionsObsolete()}</Text>}
          </>
        ) : null}
        {showIfHasCategory('expired', testsExpired)}
      </Box>
      {unexpectedChangesDetected && !fileContentChanges ? (
        <Box flexDirection="column" paddingBottom={1}>
          <Text color={getColor('changed')}>{unexpectedChanges()}</Text>
          <Box flexDirection="column" padding={1}>
            {suiteSummary.changed.map((name) => (
              <Text key={name}>"{name}"</Text>
            ))}
          </Box>
          <Text color={getColor('changed')}>{unexpectedChangesInstructions()}</Text>
          <WorkflowSuggestions />
        </Box>
      ) : null}
      {fileContentChanges ? (
        <Box flexDirection="column" paddingBottom={1}>
          <Text color={TEXT_COLOURS.changed}>{stayedTheSameButChanged()}</Text>
          <Text color={TEXT_COLOURS.changed}>{stayedTheSameButChangedInstructions()}</Text>
          <WorkflowSuggestions />
        </Box>
      ) : null}
    </>
  );
});

function onlyFileContentsChanges(suiteSummary: BettererSuiteSummary): boolean {
  // If every test name listed in `changed` is also the name of a test listed in `same`,
  // the the actual contents of the files changed, but not the results:
  return suiteSummary.changed.every(
    (testName) => !!suiteSummary.same.find((runSummary) => runSummary.name === testName)
  );
}

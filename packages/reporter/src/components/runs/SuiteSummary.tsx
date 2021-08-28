import React, { FC, memo } from 'react';

import { BettererContext, BettererSuiteSummary } from '@betterer/betterer';
import { Box, Text, TextProps } from 'ink';

import {
  testBetter,
  testChecked,
  testComplete,
  testExpired,
  testFailed,
  testNew,
  testSame,
  testSkipped,
  testUpdated,
  testWorse,
  unexpectedChanges,
  unexpectedChangesInstructions,
  updateInstructions
} from '../../messages';

export type SuiteSummaryProps = {
  context: BettererContext;
  suiteSummary: BettererSuiteSummary;
};

const TEXT_COLOURS: Record<string, TextProps['color']> = {
  better: 'greenBright',
  changed: 'red',
  checked: 'gray',
  completed: 'greenBright',
  expired: 'brightRed',
  failed: 'brightRed',
  new: 'gray',
  obsolete: 'brightRed',
  same: 'brightYellow',
  skipped: 'brightYellow',
  updated: 'white',
  worse: 'red'
};

export const SuiteSummary: FC<SuiteSummaryProps> = memo(function SuiteSummary({ context, suiteSummary }) {
  const better = suiteSummary.better.length;
  const completed = suiteSummary.completed.length;
  const expired = suiteSummary.expired.length;
  const failed = suiteSummary.failed.length;
  const neww = suiteSummary.new.length;
  const ran = suiteSummary.ran.length;
  const same = suiteSummary.same.length;
  const skipped = suiteSummary.skipped.length;
  const updated = suiteSummary.updated.length;
  const worse = suiteSummary.worse.length;

  return (
    <>
      <Box flexDirection="column" paddingBottom={1}>
        <Text color={TEXT_COLOURS.checked}>{testChecked(tests(ran))}</Text>
        {neww ? <Text color={TEXT_COLOURS.new}>{testNew(tests(neww))}</Text> : null}
        {better ? <Text color={TEXT_COLOURS.better}>{testBetter(tests(better))}</Text> : null}
        {completed ? <Text color={TEXT_COLOURS.completed}>{testComplete(tests(completed))})</Text> : null}
        {same ? <Text color={TEXT_COLOURS.same}>{testSame(tests(same))}</Text> : null}
        {failed ? <Text color={TEXT_COLOURS.failed}>{testFailed(tests(failed))}</Text> : null}
        {skipped ? <Text color={TEXT_COLOURS.skipped}>{testSkipped(tests(skipped))}</Text> : null}
        {updated ? <Text color={TEXT_COLOURS.updated}>{testUpdated(tests(updated))}</Text> : null}
        {worse ? (
          <>
            <Box paddingBottom={1}>
              <Text color={TEXT_COLOURS.worse}>{testWorse(tests(worse))}</Text>
            </Box>
            {!context.config.strict && <Text>{updateInstructions()}</Text>}
          </>
        ) : null}
        {expired ? <Text color={TEXT_COLOURS.expired}>{testExpired(tests(expired))})</Text> : null}
      </Box>
      {context.config.ci && suiteSummary.changed.length ? (
        <Box flexDirection="column" paddingBottom={1}>
          <Text color={TEXT_COLOURS.changed}>{unexpectedChanges()}</Text>
          <Box flexDirection="column" padding={1}>
            {suiteSummary.changed.map((name) => (
              <Text key={name}>"{name}"</Text>
            ))}
          </Box>
          <Text color={TEXT_COLOURS.changed}>{unexpectedChangesInstructions()}</Text>
        </Box>
      ) : null}
    </>
  );
});

function tests(n: number): string {
  return n === 1 ? `${n} test` : `${n} tests`;
}

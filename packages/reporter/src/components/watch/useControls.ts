import type { BettererContext } from '@betterer/betterer';

import type { ConfigEditField } from '../config/index.js';

import { useEffect, useState, useStdin } from '@betterer/render';

// Stolen mostly from ink's `useInput` hook.
export function useControls(context: BettererContext): ConfigEditField {
  const { stdin } = useStdin();
  const [editing, setEditing] = useState<ConfigEditField>(null);

  useEffect(() => {
    function handleData(data: string) {
      const input = String(data);
      const isReturn = input === '\r';
      const isEscape = input === '\u001B';

      if (editing) {
        if (isReturn || isEscape) {
          setEditing(null);
          return;
        }
        return;
      }

      if (isEscape || input === 'q') {
        void context.stop();
        return;
      }

      if (input === 'f') {
        setEditing('filters');
        return;
      }

      if (input === 'i') {
        setEditing('ignores');
        return;
      }
    }

    stdin?.on('data', handleData);
    return () => {
      stdin?.off('data', handleData);
    };
  }, [editing]);
  return editing;
}

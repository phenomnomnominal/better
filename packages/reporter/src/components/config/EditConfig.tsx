import type { PropsWithChildren } from '@betterer/render';

import { React, Box, Text, TextInput, useState, useCallback } from '@betterer/render';

/** @knipignore used by an exported function */
export type EditConfigProps<ValidatedConfigType> = PropsWithChildren<{
  name: string;
  onChange: (newValue: string) => [ValidatedConfigType | null, Error | null];
  onSubmit: (newValue: ValidatedConfigType) => Promise<void>;
  value: string;
}>;

export function EditConfig<ValidatedConfigType>(props: EditConfigProps<ValidatedConfigType>): React.JSX.Element {
  const { children, name, onChange, onSubmit, value } = props;
  const [error, setError] = useState<Error | null>(null);
  const [valid, setValid] = useState<ValidatedConfigType | null>(null);

  const change = useCallback(
    (newValue: string): void => {
      const [valid, error] = onChange(newValue);
      setValid(valid);
      setError(error);
    },
    [onChange]
  );

  const submit = useCallback(async (): Promise<void> => {
    if (valid) {
      await onSubmit(valid);
    }
  }, [valid, onSubmit]);

  return (
    <Box flexDirection="column">
      <Text color="grey">Press "enter" to confirm, or "esc" to cancel.</Text>
      <Text color="grey">{children}</Text>
      <Box>
        <Text color={error ? 'redBright' : 'yellowBright'}>{name}: </Text>
        <TextInput value={value} onChange={change} onSubmit={() => void submit()}></TextInput>
      </Box>
      <Box>{error && <Text>{error.message}</Text>}</Box>
    </Box>
  );
}

import type {
  BettererContext,
  BettererConfig,
  BettererOptionsFilters,
  BettererOptionsIgnores
} from '@betterer/betterer';
import type { FC } from '@betterer/render';

import { React, Box, Text, useState } from '@betterer/render';

import { EditConfig } from './EditConfig.js';

export type ConfigEditField = 'filters' | 'ignores' | null;

/** @knipignore used by an exported function */
export interface ConfigProps {
  context: BettererContext;
  editField: ConfigEditField;
}

export const Config: FC<ConfigProps> = function Config({ context, editField }) {
  const [filters, setFilters] = useState<string>(serialiseFilters(context.config));
  const [ignores, setIgnores] = useState<string>(serialiseIgnores(context.config));

  function updateFilters(newFilters: string): [BettererOptionsFilters | null, Error | null] {
    setFilters(newFilters);
    try {
      const validated = deserialiseFilters(newFilters);
      return [validated, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  function submitFilters(filters: BettererOptionsFilters): Promise<void> {
    return context.options({ filters });
  }

  function updateIgnores(newIgnores: string): [BettererOptionsIgnores | null, Error | null] {
    setIgnores(newIgnores);
    try {
      const validated = deserialiseIgnores(newIgnores);
      return [validated, null];
    } catch (error) {
      return [null, error as Error];
    }
  }

  function submitIgnores(ignores: BettererOptionsIgnores): Promise<void> {
    return context.options({ ignores });
  }

  return (
    <Box flexDirection="column" marginBottom={1}>
      {editField == null && (
        <>
          <Box>
            <Text color="yellowBright">Filters</Text>
            <Text> (press "f" to edit)</Text>
            <Text color="yellowBright">: </Text>
            {filters.length ? <Text>{filters}</Text> : <Text color="gray">No current filter patterns</Text>}
          </Box>
          <Box>
            <Text color="yellowBright">Ignores</Text>
            <Text> (press "i" to edit)</Text>
            <Text color="yellowBright">: </Text>
            {ignores.length ? <Text>{ignores}</Text> : <Text color="gray">No current ignore patterns</Text>}
          </Box>
        </>
      )}
      {editField == 'filters' && (
        <EditConfig<BettererOptionsFilters>
          name="Filters"
          value={filters}
          onChange={updateFilters}
          onSubmit={submitFilters}
        >
          Use RegExp patterns e.g. /my test/. Use "," to separate multiple filters.
        </EditConfig>
      )}
      {editField == 'ignores' && (
        <EditConfig<BettererOptionsIgnores>
          name="Ignores"
          value={ignores}
          onChange={updateIgnores}
          onSubmit={submitIgnores}
        >
          Use glob patterns starting from CWD e.g. **/*.ts. Use "," to separate multiple ignores.
        </EditConfig>
      )}
    </Box>
  );
};

function serialiseFilters(config: BettererConfig): string {
  return config.filters.map((filter) => `/${filter.source}/`).join(', ');
}

function serialiseIgnores(config: BettererConfig): string {
  return config.ignores.join(', ');
}

function deserialiseFilters(filters: string): BettererOptionsFilters {
  if (filters === '') {
    return [];
  }
  return filters.split(',').map((filter) => new RegExp(filter.replace(/^\//, '').replace(/\/$/, ''), 'i'));
}

function deserialiseIgnores(ignores: string): BettererOptionsIgnores {
  return ignores.split(',').map((ignore) => ignore.trim());
}

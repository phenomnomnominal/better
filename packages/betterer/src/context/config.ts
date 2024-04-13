import type { BettererConfig } from '../config/index.js';
import type { BettererConfigContext, BettererOptionsContext, BettererOptionsContextOverride } from './types.js';

import {
  toArray,
  toRegExps,
  validateBool,
  validateStringArray,
  validateStringRegExpArray,
  validateWorkers
} from '../config/index.js';

export function createContextConfig(options: BettererOptionsContext): BettererConfigContext {
  const ci = options.ci || false;
  const filters = toRegExps(toArray<string | RegExp>(options.filters));
  const excludes = toRegExps(toArray<string | RegExp>(options.excludes)) || [];
  const includes = toArray<string>(options.includes) || [];
  const precommit = options.precommit || false;
  const strict = options.strict || false;
  const update = options.update || false;

  validateBool({ ci });
  validateBool({ precommit });
  validateBool({ strict });
  validateBool({ update });
  validateStringRegExpArray({ excludes });
  validateStringRegExpArray({ filters });
  validateStringArray({ includes });

  const workers = validateWorkers(options.workers);

  return {
    ci,
    excludes,
    filters,
    includes,
    precommit,
    strict,
    update,
    workers
  };
}

export function overrideContextConfig(config: BettererConfig, optionsOverride: BettererOptionsContextOverride): void {
  if (optionsOverride.filters) {
    validateStringRegExpArray({ filters: optionsOverride.filters });
    config.filters = toRegExps(toArray<string | RegExp>(optionsOverride.filters));
  }
}

export function enableMode(config: BettererConfig): BettererConfig {
  // CI mode:
  if (config.ci) {
    config.precommit = false;
    config.strict = true;
    config.update = false;
    config.watch = false;
    return config;
  }

  // Precommit mode:
  if (config.precommit) {
    config.ci = false;
    config.strict = true;
    config.update = false;
    config.watch = false;
    return config;
  }

  // Strict mode:
  if (config.strict) {
    config.ci = false;
    config.precommit = false;
    config.update = false;
    config.watch = false;
    return config;
  }

  // Update mode:
  if (config.update) {
    config.ci = false;
    config.precommit = false;
    config.strict = false;
    config.watch = false;
    return config;
  }

  // Watch mode:
  if (config.watch) {
    config.ci = false;
    config.precommit = false;
    config.strict = false;
    config.update = false;
    return config;
  }

  return config;
}

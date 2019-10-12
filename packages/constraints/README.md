# `@betterer/constraints`

[![npm version](https://img.shields.io/npm/v/@betterer/constraints.svg)](https://www.npmjs.com/package/@betterer/constraints)

Simple constraint functions for use with [**`betterer`**](https://github.com/phenomnomnominal/betterer).

## Usage

```typescript
import { bigger, smaller } from '@betterer/constraints';

bigger(1, 2); // worse;
bigger(1, 1); // worse;
bigger(2, 1); // better;
bigger(2, 2); // same;

smaller(2, 1); // worse;
smaller(1, 1); // worse;
smaller(1, 2); // better;
smaller(2, 2); // same;
```

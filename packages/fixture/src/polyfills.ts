// Let's see if we can keep our tests running on old version of node.js 😅

// `structuredClone` is needed by ESLint and doesn't exist in node.js v16:
import 'core-js/actual/structured-clone.js';

// `Promise.withResolvers` is only a proposal but it's super useful:
import 'core-js/proposals/promise-with-resolvers.js';

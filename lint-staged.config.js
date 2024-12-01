export default {
  '*.{ts,tsx}': () => 'npm run api',
  '*': ['npm run lint', 'npm run format', 'npm run betterer:precommit']
};

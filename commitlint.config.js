module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['@phenomnomnominal'],
  rules: {
    '@phenomnomnominal/scopes': [2, 'always']
  }
};

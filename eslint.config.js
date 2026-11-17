import js from '@eslint/js';

export default [
  { ignores: ['coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { process: 'readonly', Buffer: 'readonly' } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
  },
  {
    files: ['tests/smoke.js'],
    languageOptions: { globals: { __ENV: 'readonly' } }
  }
];

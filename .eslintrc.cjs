/** @type {import('eslint').LConfig} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-refresh/only'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  rules: {
    'react-refresh/only-export-components': 'warn'
  }
};

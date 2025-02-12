// @ts-check
const { FlatCompat } = require('@eslint/eslintrc');
const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginJest = require('eslint-plugin-jest');
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      parser: typescriptEslintParser,
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      prettier: eslintPluginPrettier,
      jest: eslintPluginJest,
    },
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/camelcase': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:jest/recommended'),
];

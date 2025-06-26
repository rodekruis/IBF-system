// @ts-check
const { FlatCompat } = require('@eslint/eslintrc');
const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginJest = require('eslint-plugin-jest');
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin');
const eslintPluginSimpleSort = require('eslint-plugin-simple-import-sort');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      parser: typescriptEslintParser,
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2022, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
      prettier: eslintPluginPrettier,
      jest: eslintPluginJest,
      'simple-import-sort': eslintPluginSimpleSort,
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/camelcase': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
          objectWrap: 'collapse',
        },
      ],
      'jest/no-focused-tests': 'error',
      'object-shorthand': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^@nestjs'], // NestJS imports
            ['^@?\\w'], // start with a letter (or digit or underscore), or `@` followed by a letter.
            ['^~'], // starts with a tilde
          ],
        },
      ],
    },
  },
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:jest/recommended'),
];

// @ts-check
const globals = require('globals');
const tseslint = require('typescript-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const eslintPluginSimpleSort = require('eslint-plugin-simple-import-sort');
const eslintPluginPerfectionist = require('eslint-plugin-perfectionist');
const typescriptEslintParser = require('@typescript-eslint/parser');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const eslintPluginPlaywright = require('eslint-plugin-playwright');

module.exports = tseslint.config(
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
      sourceType: 'script', // Allows for the use of imports
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      'simple-import-sort': eslintPluginSimpleSort,
    },
    extends: [eslintPluginPrettierRecommended],
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
      globals: {
        ...globals.node,
      },
      parser: typescriptEslintParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      perfectionist: eslintPluginPerfectionist,
      eslintPluginPrettier,
      playwright: eslintPluginPlaywright,
      'simple-import-sort': eslintPluginSimpleSort,
    },
    extends: [
      tseslint.configs.eslintRecommended,
      ...tseslint.configs.stylisticTypeChecked,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'object-shorthand': 'error',
      // There was a problem with using the eslint-plugin-promise package when migrating from .eslintrc.js to eslint.config.js. So switching this off as not actually used.
      // 'promise/no-nesting': 'error',
      // 'promise/no-callback-in-promise': 'error',
      // 'promise/no-multiple-resolved': 'error',
      // 'promise/no-promise-in-callback': 'error',
      // 'promise/no-return-in-finally': 'error',
      // 'promise/prefer-await-to-callbacks': 'error',
      // 'promise/prefer-await-to-then': 'error',
      // 'promise/valid-params': 'error',
      'perfectionist/sort-enums': ['error'],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^@?\\w'], // start with a letter (or digit or underscore), or `@` followed by a letter.
            ['^~'], // starts with a tilde
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'prettier/prettier': [
        'error',
        { endOfLine: 'auto', objectWrap: 'collapse' },
      ],
      'playwright/no-focused-test': 'error',
    },
  },
);

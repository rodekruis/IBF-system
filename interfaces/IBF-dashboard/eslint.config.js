// @ts-check
const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const eslintPluginNoRelativePaths = require('eslint-plugin-no-relative-import-paths');
const eslintPluginQuery = require('@tanstack/eslint-plugin-query');
const eslintPluginPerfectionist = require('eslint-plugin-perfectionist');
const eslintPluginRegexp = require('eslint-plugin-regexp');
const eslintPluginSimpleSort = require('eslint-plugin-simple-import-sort');

module.exports = tseslint.config(
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'no-relative-import-paths': eslintPluginNoRelativePaths,
      // @ts-ignore-next-line - `perfectionist` package does have correct shape; maybe not correct type definition.
      perfectionist: eslintPluginPerfectionist,
      regexp: eslintPluginRegexp,
      'simple-import-sort': eslintPluginSimpleSort,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      // @ts-ignore-next-line - `configs` DOES exist.
      ...eslintPluginQuery.configs['flat/recommended'],
      eslintPluginRegexp.configs['flat/recommended'],
      eslintPluginPrettierRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // REFACTOR
      'object-shorthand': 'warn',
      'simple-import-sort/imports': 'warn',
      'no-relative-import-paths/no-relative-import-paths': 'warn',
      'regexp/no-unused-capturing-group': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'warn',
      '@typescript-eslint/no-confusing-void-expression': 'warn',
      '@typescript-eslint/dot-notation': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/no-extraneous-class': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@angular-eslint/prefer-standalone': 'warn',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/component-class-suffix': 'warn',
      '@angular-eslint/no-async-lifecycle-method': 'warn',
      'perfectionist/sort-enums': 'warn',
      'perfectionist/sort-union-types': 'warn',
      'perfectionist/sort-array-includes': 'warn',

      //'no-relative-import-paths/no-relative-import-paths': [
      //  'error',
      //  {
      //    prefix: '~',
      //    rootDir: './src/app',
      //  },
      //],
      //'@typescript-eslint/no-extraneous-class': [
      //  'error',
      //  {
      //    allowWithDecorator: true,
      //  },
      //],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      //'@angular-eslint/no-async-lifecycle-method': ['error'],
      '@angular-eslint/no-conflicting-lifecycle': ['error'],
      //'@angular-eslint/prefer-on-push-component-change-detection': ['error'],
      '@angular-eslint/prefer-output-readonly': ['error'],
      //'@angular-eslint/prefer-standalone': ['error'],
      '@angular-eslint/sort-lifecycle-methods': ['error'],
      '@angular-eslint/use-component-selector': ['error'],
      '@angular-eslint/use-lifecycle-interface': ['error'],
      //'perfectionist/sort-array-includes': ['error'],
      //'perfectionist/sort-enums': ['error'],
      'perfectionist/sort-intersection-types': ['error'],
      //'perfectionist/sort-union-types': ['error'],
      //'object-shorthand': 'error',
      //'simple-import-sort/imports': [
      //  'error',
      //  {
      //    groups: [
      //      // Angular packages.
      //      ['^@angular'],
      //      // Packages.
      //      // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
      //      ['^@?\\w'],
      //      // Alias imports
      //      ['^@API-service'],
      //      // Local imports
      //      // Anything that starts with a tilde.
      //      ['^~'],
      //    ],
      //  },
      //],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['src/app/**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      // REFACTOR
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/elements-content': 'warn',
      '@angular-eslint/template/i18n': 'warn',

      //'@angular-eslint/template/i18n': [
      //  'error',
      //  {
      //    checkId: false,
      //    ignoreAttributes: [
      //      'app-query-table[localStorageKey]',
      //      'data-testid',
      //      'field',
      //      'img[ngSrc]',
      //      'inputStyleClass',
      //      'ng-container[slot]',
      //      'p-button[icon]',
      //      'p-button[iconPos]',
      //      'p-columnFilter[display]',
      //      'p-contextMenu[appendTo]',
      //      'p-dropdown[appendTo]',
      //      'p-iconField[iconPosition]',
      //      'p-sidebar[position]',
      //      'p-table[stateKey]',
      //      'p-table[stateStorage]',
      //      'styleClass',
      //      'severity',
      //      'th[pSortableColumn]',
      //      'app-colored-chip[variant]',
      //      'app-confirmation-dialog[headerIcon]',
      //      'app-metric-tile[chipIcon]',
      //      'app-metric-tile[chipVariant]',
      //      'iframe[referrerpolicy]',
      //      'iframe[loading]',
      //      'iframe[sandbox]',
      //    ],
      //  },
      //],
      'prettier/prettier': [
        'error',
        {
          parser: 'angular',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    extends: [eslintPluginPrettierRecommended],
    rules: {},
  },
);

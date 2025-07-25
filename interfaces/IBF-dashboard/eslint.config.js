import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginNoRelativePaths from 'eslint-plugin-no-relative-import-paths';
import eslintPluginQuery from '@tanstack/eslint-plugin-query';
import eslintPluginPerfectionist from 'eslint-plugin-perfectionist';
import eslintPluginRegexp from 'eslint-plugin-regexp';
import eslintPluginSimpleSort from 'eslint-plugin-simple-import-sort';
import eslintPluginJasmine from 'eslint-plugin-jasmine';
import stylistic from '@stylistic/eslint-plugin';

const declarativeStatements = ['const', 'let', 'var'];
const controlFlowStatements = ['if', 'for', 'while', 'do', 'switch'];

export default tseslint.config(
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.jasmine },
      parserOptions: { project: './tsconfig.json' },
    },
  },
  {
    files: ['**/*.ts'],
    plugins: {
      'no-relative-import-paths': eslintPluginNoRelativePaths,
      perfectionist: eslintPluginPerfectionist,
      regexp: eslintPluginRegexp,
      'simple-import-sort': eslintPluginSimpleSort,
      '@stylistic': stylistic,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...angular.configs.tsRecommended,
      ...eslintPluginQuery.configs['flat/recommended'],
      eslintPluginRegexp.configs['flat/recommended'],
      eslintPluginPrettierRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // TODO: set these to either 'error' or 'off'
      'regexp/no-unused-capturing-group': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
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
      '@typescript-eslint/consistent-type-definitions': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
      // Put this to 'off' for now because it automatically tries to fix this in code on save
      '@angular-eslint/prefer-standalone': 'off',
      // Put this to 'off' for now as changing this leads to breaking changes in the code
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/component-class-suffix': 'warn',
      '@angular-eslint/no-async-lifecycle-method': 'warn',
      'perfectionist/sort-union-types': 'warn',

      'no-relative-import-paths/no-relative-import-paths': 'error',
      '@typescript-eslint/no-extraneous-class': [
        'error',
        { allowWithDecorator: true },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      //'@angular-eslint/no-async-lifecycle-method': ['error'],
      '@angular-eslint/no-conflicting-lifecycle': ['error'],
      //'@angular-eslint/prefer-on-push-component-change-detection': ['error'],
      '@angular-eslint/prefer-output-readonly': ['error'],
      //'@angular-eslint/prefer-standalone': ['error'],
      '@angular-eslint/sort-lifecycle-methods': ['error'],
      '@angular-eslint/use-component-selector': ['error'],
      '@angular-eslint/use-lifecycle-interface': ['error'],
      'perfectionist/sort-array-includes': 'off', // allow unsorted arrays for domain specific ordering
      'perfectionist/sort-enums': ['error'],
      'perfectionist/sort-intersection-types': ['error'],
      //'perfectionist/sort-union-types': ['error'],
      'object-shorthand': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^@?\\w'], // start with a letter (or digit or underscore), or `@` followed by a letter.
            ['^@API-service'], // alias imports
            ['^~'], // starts with a tilde
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // stylistic
      ...stylistic.configs.recommended.rules,
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/indent': [
        'error',
        2,
        { offsetTernaryExpressions: true, SwitchCase: 1 },
      ],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          multilineDetection: 'brackets',
          overrides: {
            interface: { multiline: { delimiter: 'semi', requireLast: true } },
          },
          singleline: { delimiter: 'semi' },
        },
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'after',
        { overrides: { '?': 'before', ':': 'before' } },
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'never',
          prev: declarativeStatements,
          next: declarativeStatements,
        },
        { blankLine: 'never', prev: 'expression', next: 'expression' },
        {
          blankLine: 'always',
          prev: 'expression',
          next: 'multiline-expression',
        },
        {
          blankLine: 'always',
          prev: 'multiline-expression',
          next: 'expression',
        },
        {
          blankLine: 'always',
          prev: 'multiline-expression',
          next: 'multiline-expression',
        },
        {
          blankLine: 'always',
          prev: ['expression', ...controlFlowStatements],
          next: declarativeStatements,
        },
        { blankLine: 'always', prev: declarativeStatements, next: 'return' },
        {
          blankLine: 'always',
          prev: declarativeStatements,
          next: ['expression', ...controlFlowStatements],
        },
        {
          blankLine: 'always',
          prev: controlFlowStatements,
          next: controlFlowStatements,
        },
        {
          blankLine: 'always',
          prev: ['expression', ...controlFlowStatements],
          next: 'return',
        },
        { blankLine: 'always', prev: '*', next: 'block' },
        { blankLine: 'always', prev: 'block', next: '*' },
        { blankLine: 'always', prev: '*', next: ['enum', 'interface', 'type'] },
        { blankLine: 'always', prev: ['enum', 'interface', 'type'], next: '*' },
      ],

      // prettier
      'prettier/prettier': [
        'error',
        { endOfLine: 'auto', quoteProps: 'as-needed', singleQuote: true },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    plugins: { jasmine: eslintPluginJasmine },
    extends: [eslintPluginJasmine.configs.recommended],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'jasmine/no-focused-tests': 'error',
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'expression', next: 'expression' },
      ],
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
      '@angular-eslint/template/i18n': 'off', // 'warn' caused automatic changes that broke the code

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
      'prettier/prettier': ['error', { parser: 'angular', endOfLine: 'auto' }],
    },
  },
  {
    files: ['**/*.js'],
    extends: [eslintPluginPrettierRecommended],
    rules: { 'prettier/prettier': ['error', { endOfLine: 'auto' }] },
  },
);

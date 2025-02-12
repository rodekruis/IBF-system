module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  objectWrap: 'collapse',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['^@nestjs', '', '<THIRD_PARTY_MODULES>', '', '^[.]'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
};

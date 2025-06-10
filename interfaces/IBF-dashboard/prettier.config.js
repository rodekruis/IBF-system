export default {
  trailingComma: 'all',
  singleQuote: true,
  objectWrap: 'collapse',
  overrides: [{ files: '*.html', options: { parser: 'angular' } }],
  plugins: ['prettier-plugin-tailwindcss'],
};

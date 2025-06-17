export default {
  trailingComma: 'all',
  singleQuote: true,
  objectWrap: 'collapse',
  quoteProps: 'as-needed',
  overrides: [{ files: '*.html', options: { parser: 'angular' } }],
  plugins: ['prettier-plugin-tailwindcss'],
};

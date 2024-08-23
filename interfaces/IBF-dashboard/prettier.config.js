module.exports = {
  trailingComma: 'all',
  singleQuote: true,
  overrides: [
    {
      files: '*.html',
      options: { parser: 'angular' },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
};

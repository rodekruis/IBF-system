import baseConfig from '../../.lintstagedrc.js';

export default {
  ...baseConfig,
  '*.{ts,js,html}': ['eslint --fix', 'node build-prod.js'],
};

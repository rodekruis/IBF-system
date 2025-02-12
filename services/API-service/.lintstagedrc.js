// eslint-disable-next-line @typescript-eslint/no-require-imports
const baseConfig = require('../../.lintstagedrc.js');

module.exports = { ...baseConfig, '*.ts': ['eslint --fix'] };

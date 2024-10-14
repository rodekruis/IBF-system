const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.test.ts'],
  coverageReporters: ['json', 'lcov'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 30_000,
  verbose: true,
  reporters: ['default'],
};

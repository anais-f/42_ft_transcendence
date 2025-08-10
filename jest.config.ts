import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/'],
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
  projects: [
    {
      displayName: 'pong-shared',
      testMatch: ['<rootDir>/modules/pong/packages/shared/**/*.test.ts'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@pong/shared/(.*)$': '<rootDir>/modules/pong/packages/shared/$1'
      }
    },
    {
      displayName: 'pong-client',
      testMatch: ['<rootDir>/modules/pong/packages/Client/**/*.test.ts'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@pong/client/(.*)$': '<rootDir>/modules/pong/packages/Client/$1'
      }
    },
    {
      displayName: 'pong-server',
      testMatch: ['<rootDir>/modules/pong/packages/Server/**/*.test.ts'],
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@pong/server/(.*)$': '<rootDir>/modules/pong/packages/Server/$1'
      }
    }
  ],
  collectCoverageFrom: [
    'modules/**/srcs/**/*.{ts}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
}

export default config;

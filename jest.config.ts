import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  projects: [
    {
      displayName: 'pong-shared',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/pong-shared/**/*.test.ts'],
      rootDir: './',
    },
    {
      displayName: 'pong-client',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/pong-client/**/*.test.ts'],
      rootDir: './',
    },
    {
      displayName: 'pong-server',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/pong-server/**/*.test.ts'],
      rootDir: './',
    },
    {
      displayName: 'pong-server-app',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/services/pong-server/app/**/*.test.ts'],
      rootDir: './',
    },
    // ESM + TS only for users-account-app
    {
      displayName: 'users-account-app',
      preset: 'ts-jest/presets/default-esm',
      testEnvironment: 'node',
      extensionsToTreatAsEsm: ['.ts'],
      testMatch: ['<rootDir>/services/users-account/app/**/*.test.ts'],
      rootDir: './',
      moduleNameMapper: {
        // Allow source/tests to import ESM paths with ".js" while resolving to ".ts"
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@packages/(.*)$': '<rootDir>/packages/$1',
        '^@services/(.*)$': '<rootDir>/services/$1',
      },
      globals: {
        'ts-jest': {
          useESM: true,
          tsconfig: '<rootDir>/services/users-account/app/tsconfig.json',
          // optional: isolatedModules: true,
        },
      },
    },
  ],
}

export default config
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
      testMatch: ['<rootDir>/services/users-account/app/**/*.test.ts'],
      rootDir: './',
      extensionsToTreatAsEsm: ['.ts'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^@packages/(.*)$': '<rootDir>/packages/$1',
        '^@services/(.*)$': '<rootDir>/services/$1',
      },
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            useESM: true,
            tsconfig: '<rootDir>/services/users-account/app/tsconfig.json',
          },
        ],
      },
    }
  ],
}

export default config
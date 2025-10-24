import path from 'node:path'
import type { Config } from '@jest/types'

const repoRoot = path.resolve(__dirname)

// Map to sources (recommended: no prebuild required)
const COMMON_SRC = path.join(repoRoot, 'packages/common/src/index.ts')

const commonConfig: Partial<Config.InitialProjectOptions> = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
  rootDir: './',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
		'^@packages/(.*)$': '<rootDir>/packages/$1',
		'^@services/(.*)$': '<rootDir>/services/$1',
    '^@ft_transcendence/common$': COMMON_SRC,
  },
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: true
			}
		]
	}
}

const config: Config.InitialOptions = {
	rootDir: './',
	projects: [
		{
			...commonConfig,
			displayName: 'pong-shared',
			rootDir: '<rootDir>/packages/pong-shared',
			testMatch: ['**/*.test.ts']
		},
		{
			...commonConfig,
			displayName: 'pong-client',
			rootDir: '<rootDir>/packages/pong-client',
			testMatch: ['**/*.test.ts']
		},
		{
			...commonConfig,
			displayName: 'pong-server',
			rootDir: '<rootDir>/packages/pong-server',
			testMatch: ['**/*.test.ts']
		},
		{
			...commonConfig,
			displayName: 'pong-server-app',
			testMatch: ['<rootDir>/services/pong-server/app/**/*.test.ts'],
			rootDir: './'
		},
		{
			...commonConfig,
			displayName: 'users',
			rootDir: '<rootDir>/services/users/app',
			testMatch: ['**/*.test.ts']
		}
	]
}

export default config

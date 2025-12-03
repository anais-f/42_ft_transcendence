import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const repoRoot = path.dirname(__filename)
const COMMON_DIST = path.join(repoRoot, 'packages/common/dist/index.js')

const commonConfig= {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	rootDir: './',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
		'^@packages/(.*)$': '<rootDir>/packages/$1',
		'^@services/(.*)$': '<rootDir>/services/$1',
		'^@ft_transcendence/common$': COMMON_DIST
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

const config = {
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
		,
		{
			...commonConfig,
			displayName: 'auth',
			rootDir: '<rootDir>/services/auth/app',
			testMatch: ['**/*.test.ts']
		},
		{
			...commonConfig,
			displayName: 'monitoring',
			rootDir: '<rootDir>/packages/monitoring',
			testMatch: ['**/*.test.ts']
		}
	]
}

export default config

import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	modulePaths: ['<rootDir/'],
	moduleNameMapper: {
		'^@ft_transcendence/(.*)$': '<rootDir>/packages/$1',
	},
	projects: [
		{
			displayName: 'pong-shared',
			testMatch: ['<rootDir>/packages/pong-shared/**/*.test.ts'],
			preset: 'ts-jest',
			rootDir: './',
		},
		{
			displayName: 'pong-client',
			testMatch: ['<rootDir>/packages/pong-client/**/*.test.ts'],
			preset: 'ts-jest',
			rootDir: './',
		},
		{
			displayName: 'pong-server',
			testMatch: ['<rootDir>/packages/pong-server/**/*.test.ts'],
			preset: 'ts-jest',
			rootDir: './',
		},
	],
}

export default config

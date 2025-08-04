import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/../modules'],
	modulePaths: ['<rootDir>/../'],
	moduleNameMapper: {
		'^@modules/(.*)$': '<rootDir>/../modules/$1'
	},
	projects: [
		{
			displayName: 'pong',
			testMatch: ['<rootDir>/../modules/pong/**/*.test.ts'],
			moduleNameMapper: {
				'^@modules/pong/(.*)$': '<rootDir>/../modules/pong/$1'
			}
		}
	],
	collectCoverageFrom: [
		'../modules/**/src/**/*.{ts,tsx}',
		'!**/node_modules/**',
		'!**/dist/**',
	],
};

export default config;

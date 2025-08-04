import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/'],
	modulePaths: ['<rootDir>/'],
	moduleNameMapper: {
		'^@modules/(.*)$': '<rootDir>/modules/$1'
	},
	projects: [
		{
			displayName: 'pong',
			testMatch: ['<rootDir>/modules/pong/**/*.test.ts'],
			preset: 'ts-jest',
			moduleNameMapper: {
				'^@modules/pong/(.*)$': '<rootDir>/modules/pong/$1'
			}
		}
	],
	collectCoverageFrom: [
		'modules/**/srcs/**/*.{ts,tsx}',
		'!**/node_modules/**',
		'!**/dist/**',
	],
};

export default config;

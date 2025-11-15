import { jest } from '@jest/globals'

const { getGoogleCredentials } = await import('./secrets.js')

describe('auth_google getGoogleCredentials (env only)', () => {
	beforeEach(() => {
		delete process.env.GOOGLE_CLIENT_ID
		delete process.env.GOOGLE_CLIENT_SECRET
	})

	test('returns env vars when set', () => {
		process.env.GOOGLE_CLIENT_ID = 'env_id'
		process.env.GOOGLE_CLIENT_SECRET = 'env_secret'
		const creds = getGoogleCredentials()
		expect(creds).toEqual({ clientId: 'env_id', clientSecret: 'env_secret' })
	})

	test('returns undefined when env vars absent', () => {
		const creds = getGoogleCredentials()
		expect(creds).toEqual({ clientId: undefined, clientSecret: undefined })
	})
})

import { jest } from '@jest/globals'

const { getGoogleCredentials } = await import('./secrets.js')

describe('auth_google getGoogleCredentials (env only)', () => {
	beforeEach(() => {
		delete process.env.GOOGLE_CLIENT_ID
		delete process.env.GOOGLE_CLIENT_SECRET
	})

	test('returns env vars when set', async () => {
		process.env.GOOGLE_CLIENT_ID = 'env-id'
		process.env.GOOGLE_CLIENT_SECRET = 'env-secret'
		const creds = getGoogleCredentials()
		expect(creds.clientId).toBe('env-id')
		expect(creds.clientSecret).toBe('env-secret')
	})

	test('returns undefineds when env missing', async () => {
		const creds = getGoogleCredentials()
		expect(creds.clientId).toBeUndefined()
		expect(creds.clientSecret).toBeUndefined()
	})
})

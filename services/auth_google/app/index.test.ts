import { jest } from '@jest/globals'

const readFileSyncMock: jest.MockedFunction<
	(path: string, encoding: any) => string
> = jest.fn()
await jest.unstable_mockModule('fs', () => ({
	__esModule: true,
	readFileSync: readFileSyncMock
}))

describe('auth_google secrets module', () => {
	beforeEach(() => {
		jest.resetAllMocks()
		delete process.env.GOOGLE_CLIENT_ID
		delete process.env.GOOGLE_CLIENT_SECRET
	})

	test('getGoogleCredentials reads secrets when env missing', async () => {
		readFileSyncMock
			.mockReturnValueOnce('client-id-value' as any)
			.mockReturnValueOnce('client-secret-value' as any)
		const { getGoogleCredentials } = await import('./secrets.ts')
		const creds = getGoogleCredentials()
		expect(readFileSyncMock).toHaveBeenCalledTimes(2)
		expect(creds.clientId).toBe('client-id-value')
		expect(creds.clientSecret).toBe('client-secret-value')
	})

	test('getGoogleCredentials falls back to env', async () => {
		process.env.GOOGLE_CLIENT_ID = 'env-id'
		process.env.GOOGLE_CLIENT_SECRET = 'env-secret'
		const { getGoogleCredentials } = await import('./secrets.ts')
		const creds = getGoogleCredentials()
		expect(creds.clientId).toBe('env-id')
		expect(creds.clientSecret).toBe('env-secret')
	})
})

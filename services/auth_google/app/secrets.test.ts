import { jest } from '@jest/globals'

const readSecretMock: jest.MockedFunction<
	(name: string) => string | undefined
> = jest.fn()

await jest.unstable_mockModule('@ft_transcendence/common', () => ({
	__esModule: true,
	readSecret: readSecretMock
}))

const { getGoogleCredentials } = await import('./secrets.js')

describe('auth_google getGoogleCredentials', () => {
	beforeEach(() => {
		jest.resetAllMocks()
		delete process.env.GOOGLE_CLIENT_ID
		delete process.env.GOOGLE_CLIENT_SECRET
	})

	test('uses secrets when available', () => {
		readSecretMock.mockImplementation((name) =>
			name === 'google_client_id'
				? 'sid'
				: name === 'google_client_secret'
					? 'ssecret'
					: undefined
		)
		const creds = getGoogleCredentials()
		expect(creds).toEqual({ clientId: 'sid', clientSecret: 'ssecret' })
	})

	test('falls back to env when secrets missing', () => {
		readSecretMock.mockReturnValue(undefined)
		process.env.GOOGLE_CLIENT_ID = 'env_id'
		process.env.GOOGLE_CLIENT_SECRET = 'env_secret'
		const creds = getGoogleCredentials()
		expect(creds).toEqual({ clientId: 'env_id', clientSecret: 'env_secret' })
	})

	test('returns undefineds when both missing', () => {
		readSecretMock.mockReturnValue(undefined)
		const creds = getGoogleCredentials()
		expect(creds).toEqual({ clientId: undefined, clientSecret: undefined })
	})
})

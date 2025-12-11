import { jest } from '@jest/globals'

// Prepare ESM-safe mocks for dependencies before importing SUT
const createUserMock: jest.MockedFunction<
	(login: string, hash: string) => void
> = jest.fn()
const findUserByLoginMock: jest.MockedFunction<
	(
		login: string
	) =>
		| { user_id: number; login: string; password: string; is_admin: boolean }
		| undefined
> = jest.fn()
const createAdminUserMock: jest.MockedFunction<
	(login: string, hash: string) => void
> = jest.fn()
const createGoogleUserMock: jest.MockedFunction<
	(
		googleId: string,
		login: string,
		avatar?: string
	) => { user_id: number; login: string; password: string; is_admin: boolean }
> = jest.fn()
const hashPasswordMock: jest.MockedFunction<(pwd: string) => Promise<string>> =
	jest.fn()
const verifyPasswordMock: jest.MockedFunction<
	(hash: string, pwd: string) => Promise<boolean>
> = jest.fn()
const signTokenMock: jest.MockedFunction<(payload: any) => string> = jest.fn()
const isUser2FAEnabledMock: jest.MockedFunction<(id: number) => boolean> =
	jest.fn()
const getSessionIdMock: jest.MockedFunction<(userId: number) => number | null> = 
	jest.fn()
const incrementSessionIdMock: jest.MockedFunction<(userId: number) => void> = 
	jest.fn()

await jest.unstable_mockModule('../repositories/userRepository.js', () => ({
	__esModule: true,
	createUser: createUserMock,
	findUserByLogin: findUserByLoginMock,
	createAdminUser: createAdminUserMock,
	createGoogleUser: createGoogleUserMock,
	isUser2FAEnabled: isUser2FAEnabledMock,
	getSessionId: getSessionIdMock,
	incrementSessionId: incrementSessionIdMock
}))

await jest.unstable_mockModule('../utils/password.js', () => ({
	__esModule: true,
	hashPassword: hashPasswordMock,
	verifyPassword: verifyPasswordMock
}))

await jest.unstable_mockModule('../utils/jwt.js', () => ({
	__esModule: true,
	signToken: signTokenMock
}))

const { loginUser, registerUser, registerAdminUser, registerGoogleUser } =
	await import('./register.js')

describe('auth register/login usecases', () => {
	beforeEach(() => {
		jest.resetAllMocks()
		// Valeurs par défaut pour les nouveaux mocks
		getSessionIdMock.mockReturnValue(0)
		incrementSessionIdMock.mockImplementation(() => {})
	})

	test('registerUser hashes and creates user', async () => {
		hashPasswordMock.mockResolvedValue('hash123')
		createUserMock.mockImplementation(() => {})
		const res = await registerUser('alice', 'pw')
		expect(hashPasswordMock).toHaveBeenCalledWith('pw')
		expect(createUserMock).toHaveBeenCalledWith('alice', 'hash123')
		expect(res).toEqual({ success: true })
	})

	test('loginUser returns null if password missing', async () => {
		const res = await loginUser('alice', '')
		expect(res).toBeNull()
	})

	test('loginUser returns token when credentials valid (no 2FA)', async () => {
		findUserByLoginMock.mockReturnValue({
			user_id: 5,
			login: 'alice',
			password: 'hash',
			is_admin: false
		} as any)
		verifyPasswordMock.mockResolvedValue(true)
		isUser2FAEnabledMock.mockReturnValue(false)
		getSessionIdMock.mockReturnValue(1)
		signTokenMock.mockReturnValue('jwt.token.value')

		const res = await loginUser('alice', 'pw')

		expect(verifyPasswordMock).toHaveBeenCalledWith('hash', 'pw')
		expect(incrementSessionIdMock).toHaveBeenCalledWith(5)
		expect(getSessionIdMock).toHaveBeenCalledWith(5)
		expect(signTokenMock).toHaveBeenCalledWith(
			{
				user_id: 5,
				login: 'alice',
				session_id: 1,
				is_admin: false,
				type: 'auth'
			},
			'1h'
		)
		expect(res).toEqual({ token: 'jwt.token.value' })
	})

	test('loginUser returns pre_2fa_token when 2FA enabled', async () => {
		findUserByLoginMock.mockReturnValue({
			user_id: 5,
			login: 'alice',
			password: 'hash',
			is_admin: false
		} as any)
		verifyPasswordMock.mockResolvedValue(true)
		isUser2FAEnabledMock.mockReturnValue(true)
		signTokenMock.mockReturnValue('pre.2fa.token')

		const res = await loginUser('alice', 'pw')

		expect(verifyPasswordMock).toHaveBeenCalledWith('hash', 'pw')
		expect(incrementSessionIdMock).toHaveBeenCalledWith(5)
		expect(signTokenMock).toHaveBeenCalledWith(
			{
				user_id: 5,
				type: '2fa'
			},
			'5m'
		)
		expect(res).toEqual({ pre_2fa_token: 'pre.2fa.token' })
	})

	test('loginUser returns null when verify fails', async () => {
		findUserByLoginMock.mockReturnValue({
			user_id: 5,
			login: 'alice',
			password: 'hash',
			is_admin: false
		} as any)
		verifyPasswordMock.mockResolvedValue(false)
		const res = await loginUser('alice', 'pw')
		expect(res).toBeNull()
	})

	test('registerAdminUser creates admin user', async () => {
		hashPasswordMock.mockResolvedValue('hash999')
		createAdminUserMock.mockImplementation(() => {})
		const res = await registerAdminUser('root', 'pw')
		expect(createAdminUserMock).toHaveBeenCalledWith('root', 'hash999')
		expect(res).toEqual({ success: true })
	})
})

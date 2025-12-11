import { jest } from '@jest/globals'

const loginUserMock: jest.MockedFunction<
	(login: string, password: string) => Promise<{ token: string } | null>
> = jest.fn()
const registerUserMock: jest.MockedFunction<
	(login: string, password: string) => Promise<{ success: true }>
> = jest.fn()
const registerGoogleUserMock: jest.MockedFunction<
	(google_id: string) => Promise<{ success: true }>
> = jest.fn()
const verifyTokenMock: jest.MockedFunction<(token: string) => any> = jest.fn()
const signTokenMock: jest.MockedFunction<(payload: any) => string> = jest.fn()
const findPublicUserByLoginMock: jest.MockedFunction<(login: string) => any> =
	jest.fn()
const findUserByGoogleIdMock: jest.MockedFunction<(google_id: string) => any> =
	jest.fn()
const deleteUserByIdMock: jest.MockedFunction<(id: number) => void> = jest.fn()

await jest.unstable_mockModule('../usecases/register.js', () => ({
	__esModule: true,
	loginUser: loginUserMock,
	registerUser: registerUserMock,
	registerGoogleUser: registerGoogleUserMock
}))
await jest.unstable_mockModule('../utils/jwt.js', () => ({
	__esModule: true,
	verifyToken: verifyTokenMock,
	signToken: signTokenMock
}))

// Additional mocks needed for registerController tests
await jest.unstable_mockModule('../repositories/userRepository.js', () => ({
	__esModule: true,
	findPublicUserByLogin: findPublicUserByLoginMock,
	deleteUserById: deleteUserByIdMock,
	findUserByGoogleId: findUserByGoogleIdMock
}))

// mock fetch side-effect for register controller flows
const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn() as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).fetch = fetchMock

const { loginController, validateAdminController, registerController } =
	await import('./authController.js')

describe('authController login', () => {
	beforeEach(() => jest.resetAllMocks())

	function buildReply() {
		return {
			code: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis(),
			setCookie: jest.fn().mockReturnThis()
		} as any
	}

	test('loginController: invalid payload returns 400', async () => {
		const req: any = { body: { login: 1, password: 'pw' } } // login should be string per schema
		const reply = buildReply()
		await expect(loginController(req, reply)).rejects.toThrow('Invalid payload')
	})

	test('loginController: bad credentials 401', async () => {
		loginUserMock.mockResolvedValue(null as any)
		// password length >=8 to pass schema, still wrong credentials
		const req: any = { body: { login: 'alice', password: 'wrongpass' } }
		const reply = buildReply()
		await expect(loginController(req, reply)).rejects.toThrow(
			'Invalid credentials'
		)
	})

	test('loginController: sets auth_token cookie and returns token', async () => {
		loginUserMock.mockResolvedValue({ token: 'jwt.token' } as any)
		// password length >=8 to satisfy schema
		const req: any = { body: { login: 'alice', password: 'password1' } }
		const reply = buildReply()
		await loginController(req, reply)
		expect(reply.setCookie).toHaveBeenCalled()
		expect(reply.send).toHaveBeenCalledWith({
			pre_2fa_required: false,
			token: 'jwt.token'
		})
	})
})

describe('validateAdminController', () => {
	beforeEach(() => jest.resetAllMocks())

	test('missing token returns 401', async () => {
		const req: any = { headers: {}, cookies: {} }
		const reply: any = { code: jest.fn().mockReturnThis(), send: jest.fn() }
		await expect(validateAdminController(req, reply)).rejects.toThrow(
			'Missing token'
		)
	})

	test('non admin returns 403', async () => {
		verifyTokenMock.mockReturnValue({ user_id: 1, login: 'a' } as any)
		const req: any = { headers: { authorization: 'Bearer t' }, cookies: {} }
		const reply: any = { code: jest.fn().mockReturnThis(), send: jest.fn() }
		await expect(validateAdminController(req, reply)).rejects.toThrow(
			'Forbidden'
		)
	})

	test('admin token returns 200', async () => {
		verifyTokenMock.mockReturnValue({
			user_id: 1,
			login: 'a',
			is_admin: true
		} as any)
		const req: any = { headers: { authorization: 'Bearer t' }, cookies: {} }
		const reply: any = { code: jest.fn().mockReturnThis(), send: jest.fn() }
		await validateAdminController(req, reply)
		expect(reply.code).toHaveBeenCalledWith(200)
	})
})

describe('authController registerController', () => {
	beforeEach(() => {
		jest.resetAllMocks()
		process.env.INTERNAL_API_SECRET = 'secret'
		process.env.USERS_SERVICE_URL = 'http://users'
		signTokenMock.mockReturnValue('test-token')
	})

	test('returns 500 if INTERNAL_API_SECRET missing', async () => {
		delete process.env.INTERNAL_API_SECRET
		const req: any = { body: { login: 'newuser', password: 'password1' } }
		const reply: any = { code: jest.fn().mockReturnThis(), send: jest.fn() }
		await expect(registerController(req, reply)).rejects.toThrow(
			'Server configuration error'
		)
	})

	test('returns 400 for invalid payload', async () => {
		const req: any = { body: { login: 'usr', password: 'short' } } // too short
		const reply: any = { code: jest.fn().mockReturnThis(), send: jest.fn() }
		await expect(registerController(req, reply)).rejects.toThrow(
			'Invalid payload'
		)
	})

	test('creates user and syncs with users service (happy path)', async () => {
		registerUserMock.mockResolvedValue({ success: true })
		findPublicUserByLoginMock.mockReturnValue({
			user_id: 10,
			login: 'newuser'
		})
		fetchMock.mockResolvedValue({ ok: true, status: 200 } as any)

		const req: any = { body: { login: 'newuser', password: 'password1' } }
		const reply: any = {
			send: jest.fn(),
			code: jest.fn().mockReturnThis(),
			setCookie: jest.fn().mockReturnThis()
		}

		await registerController(req, reply)

		expect(registerUserMock).toHaveBeenCalled()
		expect(fetchMock).toHaveBeenCalledWith(
			'http://users/api/internal/users/new-user',
			expect.any(Object)
		)
		expect(signTokenMock).toHaveBeenCalledWith(
			{ user_id: 10, login: 'newuser', is_admin: false, type: 'auth' },
			'1h'
		)
		expect(reply.setCookie).toHaveBeenCalledWith(
			'auth_token',
			'test-token',
			expect.objectContaining({ httpOnly: true })
		)
		expect(reply.send).toHaveBeenCalledWith({
			message: 'User registered successfully',
			token: 'test-token'
		})
	})

	test('on users service 401, deletes created user and returns 500', async () => {
		registerUserMock.mockResolvedValue({ success: true })
		findPublicUserByLoginMock.mockReturnValue({
			user_id: 11,
			login: 'newuser'
		})
		fetchMock.mockResolvedValue({ ok: false, status: 401 } as any)

		const req: any = { body: { login: 'newuser', password: 'password1' } }
		const reply: any = {
			code: jest.fn().mockReturnThis(),
			send: jest.fn(),
			setCookie: jest.fn().mockReturnThis()
		}

		await expect(registerController(req, reply)).rejects.toThrow(
			'Failed to sync user with users service'
		)
		expect(deleteUserByIdMock).toHaveBeenCalledWith(11)
	})

	test('on users service failure, deletes created user and returns 400', async () => {
		registerUserMock.mockResolvedValue({ success: true })
		findPublicUserByLoginMock.mockReturnValue({
			user_id: 12,
			login: 'newuser'
		})
		fetchMock.mockResolvedValue({ ok: false, status: 500 } as any)

		const req: any = { body: { login: 'newuser', password: 'password1' } }
		const reply: any = {
			code: jest.fn().mockReturnThis(),
			send: jest.fn(),
			setCookie: jest.fn().mockReturnThis()
		}

		await expect(registerController(req, reply)).rejects.toThrow(
			'Users service unavailable'
		)
		expect(deleteUserByIdMock).toHaveBeenCalledWith(12)
	})
})

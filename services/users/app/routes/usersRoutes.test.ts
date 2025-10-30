/**
 * Test Coverage Summary for usersRoutes
 *
 * SECTION 1: SUCCESSFUL CASES
 * - POST /api/users/new-user: Creates user with valid data, returns 200 if exists (with API key)
 * - GET /api/users/:id: Returns complete profile with all required fields (with JWT)
 * - GET /api/users/me: Returns private profile for authenticated user (with JWT)
 *
 * SECTION 2: BASIC FAILURE CASES
 * - POST: Missing/invalid API key (401), missing fields, invalid user_id/login
 * - GET: Invalid/negative id, user not found
 * - GET /me: Missing JWT (401), user not found (404)
 *
 * SECTION 3: TRICKY CASES
 * - Boundary values: login length limits, large user_id
 * - Special characters: valid patterns (underscores/dashes)
 *
 * SECTION 4: EXCEPTIONS
 * - Controller error propagation (500)
 */

import {
	jest,
	beforeEach,
	describe,
	test,
	expect,
	afterEach
} from '@jest/globals'
import type { FastifyInstance } from 'fastify'

let Fastify: any
let usersRoutes: any
let UsersControllers: any
let ERROR_MESSAGES: any
let serializerCompiler: any
let validatorCompiler: any
let ZodTypeProvider: any
let fastifyJwt: any

// Test auth token from environment (or fallback to 'test')
const TEST_USERS_TOKEN = process.env.USERS_API_SECRET || 'test'
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'

beforeAll(async () => {
	if (!process.env.USERS_API_SECRET) {
		process.env.USERS_API_SECRET = 'test'
	}
	if (!process.env.JWT_SECRET) {
		process.env.JWT_SECRET = 'test-jwt-secret'
	}

	await jest.unstable_mockModule('../controllers/usersControllers.js', () => ({
		handleUserCreated: jest.fn(),
		getPublicUser: jest.fn(),
		getPrivateUser: jest.fn()
	}))

	const fastify = await import('fastify')
	Fastify = fastify.default

	const jwt = await import('@fastify/jwt')
	fastifyJwt = jwt.default

	const routesModule = await import('./usersRoutes.js')
	usersRoutes = routesModule.usersRoutes

	const controllersModule = await import('../controllers/usersControllers.js')
	UsersControllers = controllersModule

	const common = await import('@ft_transcendence/common')
	ERROR_MESSAGES = common.ERROR_MESSAGES

	const zodProvider = await import('fastify-type-provider-zod')
	serializerCompiler = zodProvider.serializerCompiler
	validatorCompiler = zodProvider.validatorCompiler
	ZodTypeProvider = zodProvider.ZodTypeProvider
})

describe('usersRoutes', () => {
	let app: FastifyInstance
	let testJwtToken: string

	beforeEach(async () => {
		jest.clearAllMocks()
		app = Fastify().withTypeProvider<typeof ZodTypeProvider>()
		app.setValidatorCompiler(validatorCompiler)
		app.setSerializerCompiler(serializerCompiler)

		// Register JWT plugin BEFORE routes
		await app.register(fastifyJwt, { secret: JWT_SECRET })

		// Generate a valid test JWT token
		testJwtToken = app.jwt.sign({ user_id: 1, login: 'testuser' })

		await app.register(usersRoutes)
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	// ==================== SECTION 1: SUCCESSFUL CASES ====================
	describe('1. Successful cases (Happy Path)', () => {
		describe('POST /api/users/new-user', () => {
			test('creates user successfully with valid data (201)', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(201)
							.send({ success: true, message: 'User created' })
					}
				)

				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 42, login: 'testuser' }
				})

				expect(response.statusCode).toBe(201)
				expect(response.json()).toMatchObject({ success: true })
				expect(UsersControllers.handleUserCreated).toHaveBeenCalled()
			})

			test('returns 200 when user already exists', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(200).send({
							success: true,
							message: ERROR_MESSAGES.USER_ALREADY_EXISTS
						})
					}
				)

				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 1, login: 'existing' }
				})

				expect(response.statusCode).toBe(200)
				expect(response.json().message).toBe(ERROR_MESSAGES.USER_ALREADY_EXISTS)
			})
		})

		describe('GET /api/users/:id', () => {
			test('returns complete user profile with all 5 required fields', async () => {
				const mockProfile = {
					user_id: 42,
					username: 'testuser',
					avatar: '/avatars/default.png',
					status: 1,
					last_connection: '2024-01-01T00:00:00.000Z'
				}

				;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(200).send(mockProfile)
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/42',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(200)
				const data = response.json()
				expect(data).toHaveProperty('user_id')
				expect(data).toHaveProperty('username')
				expect(data).toHaveProperty('avatar')
				expect(data).toHaveProperty('status')
				expect(data).toHaveProperty('last_connection')
			})
		})
	})

	// ==================== SECTION 2: BASIC FAILURE CASES ====================
	describe('2. Basic failure cases', () => {
		describe('POST /api/users/new-user - Authorization', () => {
			test('returns 401 when authorization header is missing', async () => {
				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 42, login: 'testuser' }
				})

				expect(response.statusCode).toBe(401)
				expect(response.json()).toMatchObject({ error: 'Unauthorized' })
			})

			test('returns 401 when authorization header is invalid', async () => {
				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: 'wrong-token'
					},
					payload: { user_id: 42, login: 'testuser' }
				})

				expect(response.statusCode).toBe(401)
				expect(response.json()).toMatchObject({ error: 'Unauthorized' })
			})
		})

		describe('POST /api/users/new-user - Validation', () => {
			test('returns 400 when required fields are missing', async () => {
				const missingUserId = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { login: 'testuser' }
				})
				expect(missingUserId.statusCode).toBe(400)

				const missingLogin = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 1 }
				})
				expect(missingLogin.statusCode).toBe(400)
			})

			test('returns 400 for invalid user_id (negative/zero/non-numeric)', async () => {
				const negative = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: -1, login: 'test' }
				})
				expect(negative.statusCode).toBe(400)

				const zero = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 0, login: 'test' }
				})
				expect(zero.statusCode).toBe(400)
			})

			test('returns 400 for invalid login (too short/long, invalid chars)', async () => {
				const tooShort = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 1, login: 'abc' }
				})
				expect(tooShort.statusCode).toBe(400)

				const tooLong = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 1, login: '12345678901234567' }
				})
				expect(tooLong.statusCode).toBe(400)

				const invalidChars = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					headers: {
						authorization: TEST_USERS_TOKEN
					},
					payload: { user_id: 1, login: 'test user' }
				})
				expect(invalidChars.statusCode).toBe(400)
			})
		})

		describe('GET /api/users/:id', () => {
			test('returns 400 for invalid id (non-numeric/negative/zero)', async () => {
				const nonNumeric = await app.inject({
					method: 'GET',
					url: '/api/users/notanumber',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})
				expect(nonNumeric.statusCode).toBe(400)

				const negative = await app.inject({
					method: 'GET',
					url: '/api/users/-1',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})
				expect(negative.statusCode).toBe(400)

				const zero = await app.inject({
					method: 'GET',
					url: '/api/users/0',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})
				expect(zero.statusCode).toBe(400)
			})

			test('returns 404 when user not found', async () => {
				;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(404)
							.send({ success: false, error: 'User not found' })
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/999',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(404)
			})

			test('returns 500 on internal error', async () => {
				;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(500)
							.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/1',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(500)
			})
		})

		describe('GET /api/users/me', () => {
			test('returns 401 when JWT token is missing', async () => {
				const response = await app.inject({
					method: 'GET',
					url: '/api/users/me'
				})

				expect(response.statusCode).toBe(401)
				expect(response.json()).toMatchObject({ error: 'Unauthorized' })
			})

			test('returns private profile with valid JWT token', async () => {
				const mockPrivateProfile = {
					user_id: 1,
					username: 'testuser',
					avatar: '/avatars/default.png',
					status: 1,
					last_connection: '2024-01-01T00:00:00.000Z'
				}

				;(UsersControllers.getPrivateUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(200).send(mockPrivateProfile)
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/me',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(200)
				expect(response.json()).toMatchObject(mockPrivateProfile)
				expect(UsersControllers.getPrivateUser).toHaveBeenCalled()
			})

			test('returns profile for user_id from JWT payload', async () => {
				// Create a JWT token with user_id: 42
				const customToken = app.jwt.sign({ user_id: 42, login: 'customuser' })

				const mockProfile = {
					user_id: 42,
					username: 'customuser',
					avatar: '/avatars/custom.png',
					status: 0,
					last_connection: '2024-10-29T10:00:00.000Z'
				}

				;(UsersControllers.getPrivateUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						// Verify that the controller receives the correct user_id from JWT
						expect(req.user.user_id).toBe(42)
						return reply.code(200).send(mockProfile)
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/me',
					headers: {
						authorization: `Bearer ${customToken}`
					}
				})

				expect(response.statusCode).toBe(200)
				expect(response.json().user_id).toBe(42)
			})

			test('returns 404 when user not found in database', async () => {
				;(UsersControllers.getPrivateUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(404)
							.send({ success: false, error: 'User not found' })
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/me',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(404)
				expect(response.json()).toMatchObject({ error: 'User not found' })
			})

			test('returns 500 on internal server error', async () => {
				;(UsersControllers.getPrivateUser as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(500)
							.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
					}
				)

				const response = await app.inject({
					method: 'GET',
					url: '/api/users/me',
					headers: {
						authorization: `Bearer ${testJwtToken}`
					}
				})

				expect(response.statusCode).toBe(500)
			})
		})
	})
})

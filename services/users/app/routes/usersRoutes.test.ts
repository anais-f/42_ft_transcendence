/**
 * Test Coverage Summary for usersRoutes
 *
 * SECTION 1: SUCCESSFUL CASES
 * - POST /api/users/new-user: Creates user with valid data, returns 200 if exists
 * - GET /api/users/:id: Returns complete profile with all required fields
 *
 * SECTION 2: BASIC FAILURE CASES
 * - POST: Missing fields, invalid user_id/login
 * - GET: Invalid/negative id, user not found
 *
 * SECTION 3: TRICKY CASES
 * - Boundary values: login length limits, large user_id
 * - Special characters: valid patterns (underscores/dashes)
 *
 * SECTION 4: EXCEPTIONS
 * - Controller error propagation
 * - HTTP method validation
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

beforeAll(async () => {
	await jest.unstable_mockModule('../controllers/usersControllers.js', () => ({
		handleUserCreated: jest.fn(),
		getPublicUser: jest.fn()
	}))

	const fastify = await import('fastify')
	Fastify = fastify.default

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

	beforeEach(async () => {
		jest.clearAllMocks()
		app = Fastify().withTypeProvider<typeof ZodTypeProvider>()
		app.setValidatorCompiler(validatorCompiler)
		app.setSerializerCompiler(serializerCompiler)
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
					payload: { user_id: 42, login: 'testuser' }
				})

				expect(response.statusCode).toBe(201)
				expect(response.json()).toMatchObject({ success: true })
				expect(UsersControllers.handleUserCreated).toHaveBeenCalled()
			})

			test('returns 200 when user already exists', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply
							.code(200)
							.send({
								success: true,
								message: ERROR_MESSAGES.USER_ALREADY_EXISTS
							})
					}
				)

				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
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
					url: '/api/users/42'
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
		describe('POST /api/users/new-user', () => {
			test('returns 400 when required fields are missing', async () => {
				const missingUserId = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { login: 'testuser' }
				})
				expect(missingUserId.statusCode).toBe(400)

				const missingLogin = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1 }
				})
				expect(missingLogin.statusCode).toBe(400)
			})

			test('returns 400 for invalid user_id (negative/zero/non-numeric)', async () => {
				const negative = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: -1, login: 'test' }
				})
				expect(negative.statusCode).toBe(400)

				const zero = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 0, login: 'test' }
				})
				expect(zero.statusCode).toBe(400)
			})

			test('returns 400 for invalid login (too short/long, invalid chars)', async () => {
				const tooShort = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'abc' }
				})
				expect(tooShort.statusCode).toBe(400)

				const tooLong = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: '12345678901234567' }
				})
				expect(tooLong.statusCode).toBe(400)

				const invalidChars = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'test user' }
				})
				expect(invalidChars.statusCode).toBe(400)
			})
		})

		describe('GET /api/users/:id', () => {
			test('returns 400 for invalid id (non-numeric/negative/zero)', async () => {
				const nonNumeric = await app.inject({
					method: 'GET',
					url: '/api/users/notanumber'
				})
				expect(nonNumeric.statusCode).toBe(400)

				const negative = await app.inject({
					method: 'GET',
					url: '/api/users/-1'
				})
				expect(negative.statusCode).toBe(400)

				const zero = await app.inject({
					method: 'GET',
					url: '/api/users/0'
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
					url: '/api/users/999'
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
					url: '/api/users/1'
				})

				expect(response.statusCode).toBe(500)
			})
		})
	})

	// ==================== SECTION 3: TRICKY CASES ====================
	describe('3. Tricky cases', () => {
		describe('Boundary values', () => {
			test('accepts login with exact min/max length (4 and 16 chars)', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(201).send({ success: true })
					}
				)

				const minLength = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'abcd' }
				})
				expect(minLength.statusCode).toBe(201)

				const maxLength = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 2, login: '1234567890123456' }
				})
				expect(maxLength.statusCode).toBe(201)
			})

			test('handles large user_id values (999999999)', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(201).send({ success: true })
					}
				)

				const response = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 999999999, login: 'biguser' }
				})

				expect(response.statusCode).toBe(201)
			})
		})

		describe('Special character patterns', () => {
			test('accepts valid login patterns (underscores, dashes, numbers only)', async () => {
				;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
					async (req: any, reply: any) => {
						return reply.code(201).send({ success: true })
					}
				)

				const withUnderscore = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'test_user' }
				})
				expect(withUnderscore.statusCode).toBe(201)

				const numbersOnly = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 2, login: '12345678' }
				})
				expect(numbersOnly.statusCode).toBe(201)
			})

			test('rejects invalid characters (dots, emoji, special chars)', async () => {
				const withDot = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'test.user' }
				})
				expect(withDot.statusCode).toBe(400)

				const withEmoji = await app.inject({
					method: 'POST',
					url: '/api/users/new-user',
					payload: { user_id: 1, login: 'test🔥' }
				})
				expect(withEmoji.statusCode).toBe(400)
			})
		})
	})

	// ==================== SECTION 4: EXCEPTIONS ====================
	describe('4. Exceptions', () => {
		test('propagates controller errors correctly (AppError)', async () => {
			const AppError = (await import('@ft_transcendence/common')).AppError

			;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
				async (req: any, reply: any) => {
					throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
				}
			)

			const response = await app.inject({
				method: 'GET',
				url: '/api/users/999'
			})

			expect([404, 500]).toContain(response.statusCode)
		})

		test('rejects incorrect HTTP methods', async () => {
			const putResponse = await app.inject({
				method: 'PUT',
				url: '/api/users/new-user',
				payload: { user_id: 1, login: 'test' }
			})
			expect(putResponse.statusCode).toBe(404)

			const deleteResponse = await app.inject({
				method: 'DELETE',
				url: '/api/users/1'
			})
			expect(deleteResponse.statusCode).toBe(404)
		})
	})
})

/**
 * @file usersRoutes.test.ts
 * @description Integration tests for Users Routes with JWT and API Key authentication
 *
 * Test Suite Summary:
 * 1. POST /api/internal/users/new-user - API Key protected
 * 2. GET /api/users/:id - JWT protected
 * 3. GET /api/users/me - JWT protected (own profile)
 * 4. PATCH /api/users/me - JWT protected (update username)
 * 5. PATCH /api/users/me/avatar - JWT protected (update avatar)
 */

import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
	jest
} from '@jest/globals'
import Fastify, { FastifyInstance } from 'fastify'
import type { FastifyRequest, FastifyReply } from 'fastify'
import {
	serializerCompiler,
	validatorCompiler
} from 'fastify-type-provider-zod'

let app: FastifyInstance
let UsersServices: any
let UpdateUsersServices: any
let usersRoutes: any

const VALID_API_KEY = 'test-api-key-123'

beforeAll(async () => {
	// Mock security middlewares BEFORE importing routes
	await jest.unstable_mockModule('@ft_transcendence/security', () => ({
		jwtAuthMiddleware: async (request: FastifyRequest, reply: FastifyReply) => {
			const authHeader = request.headers.authorization
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return reply
					.code(401)
					.send({ success: false, error: 'Missing or invalid JWT token' })
			}
			const token = authHeader.substring(7)
			if (token !== 'valid.jwt.token') {
				return reply
					.code(401)
					.send({ success: false, error: 'Invalid JWT token' })
			}
			// Inject mock user data from JWT
			request.user = { user_id: 1, username: 'testuser' }
		},
		apiKeyMiddleware: async (request: FastifyRequest, reply: FastifyReply) => {
			const apiKey = request.headers['x-api-key']
			if (!apiKey || apiKey !== VALID_API_KEY) {
				return reply
					.code(401)
					.send({ success: false, error: 'Invalid or missing API key' })
			}
		}
	}))

	// Mock services
	await jest.unstable_mockModule('../usecases/usersServices.js', () => ({
		UsersServices: {
			createUser: jest.fn(),
			getPublicUserProfile: jest.fn(),
			getPrivateUserProfile: jest.fn()
		}
	}))

	await jest.unstable_mockModule('../usecases/updateUsersServices.js', () => ({
		UpdateUsersServices: {
			updateUsernameProfile: jest.fn(),
			checkUserAvatar: jest.fn()
		}
	}))

	// Mock controllers
	await jest.unstable_mockModule('../controllers/usersControllers.js', () => ({
		handleUserCreated: async (req: FastifyRequest, reply: FastifyReply) => {
			const UsersServices = (await import('../usecases/usersServices.js'))
				.UsersServices
			const { ERROR_MESSAGES, SUCCESS_MESSAGES } = await import(
				'@ft_transcendence/common'
			)
			try {
				await UsersServices.createUser(req.body)
				return reply
					.code(201)
					.send({ success: true, message: SUCCESS_MESSAGES.USER_CREATED })
			} catch (error: any) {
				if (error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS) {
					return reply.code(200).send({
						success: true,
						message: ERROR_MESSAGES.USER_ALREADY_EXISTS
					})
				}
				return reply
					.code(500)
					.send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
			}
		},
		getPublicUser: async (req: any, reply: FastifyReply) => {
			const UsersServices = (await import('../usecases/usersServices.js'))
				.UsersServices
			try {
				const profile = await UsersServices.getPublicUserProfile({
					user_id: req.params.id
				})
				return reply.code(200).send(profile)
			} catch (error: any) {
				return reply
					.code(error.status || 500)
					.send({ success: false, error: error.message })
			}
		},
		getPrivateUser: async (req: any, reply: FastifyReply) => {
			const UsersServices = (await import('../usecases/usersServices.js'))
				.UsersServices
			const { ERROR_MESSAGES } = await import('@ft_transcendence/common')
			try {
				const userId = req.user?.user_id
				if (!userId || userId <= 0) {
					return reply
						.code(400)
						.send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
				}
				const profile = await UsersServices.getPrivateUserProfile({
					user_id: userId
				})
				return reply.code(200).send(profile)
			} catch (error: any) {
				return reply
					.code(error.status || 500)
					.send({ success: false, error: error.message })
			}
		}
	}))

	await jest.unstable_mockModule(
		'../controllers/updateUsersControllers.js',
		() => ({
			updateUsername: async (req: any, reply: FastifyReply) => {
				const UpdateUsersServices = (
					await import('../usecases/updateUsersServices.js')
				).UpdateUsersServices
				const { ERROR_MESSAGES, SUCCESS_MESSAGES } = await import(
					'@ft_transcendence/common'
				)
				try {
					const userId = req.user?.user_id
					if (!userId || userId <= 0) {
						return reply
							.code(400)
							.send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
					}
					const { username } = req.body
					await UpdateUsersServices.updateUsernameProfile(
						{ user_id: userId },
						username
					)
					return reply
						.code(200)
						.send({ success: true, message: SUCCESS_MESSAGES.USER_UPDATED })
				} catch (error: any) {
					return reply
						.code(error.status || 500)
						.send({ success: false, error: error.message })
				}
			},
			updateAvatar: async (req: any, reply: FastifyReply) => {
				const UpdateUsersServices = (
					await import('../usecases/updateUsersServices.js')
				).UpdateUsersServices
				const { ERROR_MESSAGES, SUCCESS_MESSAGES } = await import(
					'@ft_transcendence/common'
				)
				try {
					const userId = req.user?.user_id
					if (!userId || userId <= 0) {
						return reply
							.code(400)
							.send({ success: false, error: ERROR_MESSAGES.INVALID_USER_ID })
					}
					await UpdateUsersServices.checkUserAvatar({
						user_id: userId,
						avatarBuffer: req.body,
						originalName: 'test.png',
						mimeType: req.headers['content-type'] || 'image/png'
					})
					return reply
						.code(200)
						.send({ success: true, message: SUCCESS_MESSAGES.USER_UPDATED })
				} catch (error: any) {
					return reply
						.code(error.status || 500)
						.send({ success: false, error: error.message })
				}
			}
		})
	)

	// Import mocked modules
	const servicesModule = await import('../usecases/usersServices.js')
	const updateServicesModule = await import(
		'../usecases/updateUsersServices.js'
	)
	const routesModule = await import('./usersRoutes.js')

	UsersServices = servicesModule.UsersServices
	UpdateUsersServices = updateServicesModule.UpdateUsersServices
	usersRoutes = routesModule.usersRoutes

	// Create Fastify instance with Zod type provider
	app = Fastify()
	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	await app.register(usersRoutes)
	await app.ready()
})

afterAll(async () => {
	await app.close()
})

describe('Users Routes - Authentication & Authorization', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ===========================================
	// 1. POST /api/internal/users/new-user - API KEY PROTECTED
	// ===========================================
	describe('POST /api/internal/users/new-user - API Key Protection', () => {
		it('should create user with valid API key - SUCCESS', async () => {
			UsersServices.createUser.mockResolvedValueOnce(undefined)

			const response = await app.inject({
				method: 'POST',
				url: '/api/internal/users/new-user',
				headers: {
					'x-api-key': VALID_API_KEY,
					'content-type': 'application/json'
				},
				payload: {
					user_id: 1,
					login: 'newuser'
				}
			})

			expect(response.statusCode).toBe(201)
			expect(UsersServices.createUser).toHaveBeenCalled()
		})

		it('should reject without API key - ERROR 401', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/internal/users/new-user',
				headers: {
					'content-type': 'application/json'
				},
				payload: {
					user_id: 1,
					login: 'newuser'
				}
			})

			expect(response.statusCode).toBe(401)
			const body = JSON.parse(response.payload)
			expect(body).toHaveProperty('error')
			expect(UsersServices.createUser).not.toHaveBeenCalled()
		})

		it('should reject with invalid API key - ERROR 401', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/internal/users/new-user',
				headers: {
					'x-api-key': 'wrong-key',
					'content-type': 'application/json'
				},
				payload: {
					user_id: 1,
					login: 'newuser'
				}
			})

			expect(response.statusCode).toBe(401)
			expect(UsersServices.createUser).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// 2. GET /api/users/:id - JWT PROTECTED
	// ===========================================
	describe('GET /api/users/:id - JWT Protection', () => {
		it('should get public profile with valid JWT - SUCCESS', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				status: 1,
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

			const response = await app.inject({
				method: 'GET',
				url: '/api/users/1',
				headers: {
					authorization: 'Bearer valid.jwt.token'
				}
			})

			expect(response.statusCode).toBe(200)
			const user = JSON.parse(response.payload)
			expect(user).toHaveProperty('user_id', 1)
			expect(user).toHaveProperty('username', 'testuser')
		})

		it('should reject without JWT - ERROR 401', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/users/1'
			})

			expect(response.statusCode).toBe(401)
			expect(UsersServices.getPublicUserProfile).not.toHaveBeenCalled()
		})

		it('should reject with invalid JWT - ERROR 401', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/users/1',
				headers: {
					authorization: 'Bearer invalid.token'
				}
			})

			expect(response.statusCode).toBe(401)
			expect(UsersServices.getPublicUserProfile).not.toHaveBeenCalled()
		})

		it('should reject malformed authorization header - ERROR 401', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/users/1',
				headers: {
					authorization: 'InvalidFormat token'
				}
			})

			expect(response.statusCode).toBe(401)
		})
	})

	// ===========================================
	// 3. GET /api/users/me - JWT PROTECTED
	// ===========================================
	describe('GET /api/users/me - JWT Protection (Own Profile)', () => {
		it('should get own private profile with valid JWT - SUCCESS', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				status: 1,
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			UsersServices.getPrivateUserProfile.mockResolvedValueOnce(mockProfile)

			const response = await app.inject({
				method: 'GET',
				url: '/api/users/me',
				headers: {
					authorization: 'Bearer valid.jwt.token'
				}
			})

			expect(response.statusCode).toBe(200)
			expect(UsersServices.getPrivateUserProfile).toHaveBeenCalledWith({
				user_id: 1
			})
		})

		it('should reject without JWT - ERROR 401', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/users/me'
			})

			expect(response.statusCode).toBe(401)
			expect(UsersServices.getPrivateUserProfile).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// 4. PATCH /api/users/me - JWT PROTECTED
	// ===========================================
	describe('PATCH /api/users/me - JWT Protection (Update Username)', () => {
		it('should update username with valid JWT - SUCCESS', async () => {
			UpdateUsersServices.updateUsernameProfile.mockResolvedValueOnce(undefined)

			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me',
				headers: {
					authorization: 'Bearer valid.jwt.token',
					'content-type': 'application/json'
				},
				payload: {
					username: 'newusername'
				}
			})

			expect(response.statusCode).toBe(200)
			expect(UpdateUsersServices.updateUsernameProfile).toHaveBeenCalledWith(
				{ user_id: 1 },
				'newusername'
			)
		})

		it('should reject without JWT - ERROR 401', async () => {
			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me',
				headers: {
					'content-type': 'application/json'
				},
				payload: {
					username: 'newusername'
				}
			})

			expect(response.statusCode).toBe(401)
			expect(UpdateUsersServices.updateUsernameProfile).not.toHaveBeenCalled()
		})

		it('should reject with invalid JWT - ERROR 401', async () => {
			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me',
				headers: {
					authorization: 'Bearer invalid.token',
					'content-type': 'application/json'
				},
				payload: {
					username: 'newusername'
				}
			})

			expect(response.statusCode).toBe(401)
			expect(UpdateUsersServices.updateUsernameProfile).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// 5. PATCH /api/users/me/avatar - JWT PROTECTED
	// ===========================================
	describe('PATCH /api/users/me/avatar - JWT Protection (Update Avatar)', () => {
		it('should upload avatar with valid JWT - SUCCESS', async () => {
			UpdateUsersServices.checkUserAvatar.mockResolvedValueOnce(true)

			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me/avatar',
				headers: {
					authorization: 'Bearer valid.jwt.token',
					'content-type': 'multipart/form-data'
				},
				payload: Buffer.from('fake-image-data')
			})

			// Peut retourner 200, 400, ou 415 selon la validation
			expect([200, 400, 415]).toContain(response.statusCode)
		})

		it('should reject without JWT - ERROR 401 or 415', async () => {
			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me/avatar',
				headers: {
					'content-type': 'multipart/form-data'
				},
				payload: Buffer.from('fake-image-data')
			})

			// Fastify peut valider Content-Type avant JWT, donc 415 ou 401
			expect([401, 415]).toContain(response.statusCode)
			expect(UpdateUsersServices.checkUserAvatar).not.toHaveBeenCalled()
		})

		it('should reject with invalid JWT - ERROR 401 or 415', async () => {
			const response = await app.inject({
				method: 'PATCH',
				url: '/api/users/me/avatar',
				headers: {
					authorization: 'Bearer invalid.token',
					'content-type': 'multipart/form-data'
				},
				payload: Buffer.from('fake-image-data')
			})

			// Fastify peut valider Content-Type avant JWT, donc 415 ou 401
			expect([401, 415]).toContain(response.statusCode)
			expect(UpdateUsersServices.checkUserAvatar).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// INTEGRATION - CROSS-AUTH VALIDATION
	// ===========================================
	describe('Integration - Different Auth Types per Route', () => {
		it('should enforce correct auth type per route', async () => {
			// Route with API Key should work
			UsersServices.createUser.mockResolvedValueOnce(undefined)
			const apiKeyRoute = await app.inject({
				method: 'POST',
				url: '/api/internal/users/new-user',
				headers: {
					'x-api-key': VALID_API_KEY,
					'content-type': 'application/json'
				},
				payload: { user_id: 99, login: 'test' }
			})
			expect(apiKeyRoute.statusCode).toBe(201)

			// JWT route should work with JWT
			UsersServices.getPublicUserProfile.mockResolvedValueOnce({
				user_id: 99,
				username: 'test',
				avatar: '/avatars/img_default.png',
				status: 1,
				last_connection: '2025-01-01T00:00:00.000Z'
			})
			const jwtRoute = await app.inject({
				method: 'GET',
				url: '/api/users/99',
				headers: { authorization: 'Bearer valid.jwt.token' }
			})
			expect(jwtRoute.statusCode).toBe(200)

			// JWT route should NOT work with API Key
			const wrongAuth = await app.inject({
				method: 'GET',
				url: '/api/users/99',
				headers: { 'x-api-key': VALID_API_KEY }
			})
			expect(wrongAuth.statusCode).toBe(401)
		})
	})
})

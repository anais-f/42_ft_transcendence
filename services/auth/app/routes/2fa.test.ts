import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import Fastify, { FastifyInstance } from 'fastify'
import { registerRoutes } from '../routes/registerRoutes.js'
import cookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { runMigrations } from '../database/connection.js'
import {
	ZodTypeProvider,
	validatorCompiler,
	serializerCompiler
} from 'fastify-type-provider-zod'

describe('2FA Functionality Tests', () => {
	let app: FastifyInstance
	let authToken: string

	beforeAll(async () => {
		// Setup environment variables
		process.env.AUTH_DB_PATH = ':memory:'
		process.env.INTERNAL_API_SECRET = 'test-secret'
		process.env.USERS_SERVICE_URL = 'http://users'
		process.env.TWOFA_SERVICE_URL = 'http://2fa'

		// Mock fetch for both users service and 2FA service calls
		global.fetch = jest.fn().mockImplementation((url: string) => {
			// Mock 2FA service setup call
			if (url.includes('/api/2fa/setup')) {
				return Promise.resolve({
					ok: true,
					status: 200,
					json: async () => ({
						otpauth_url: 'otpauth://totp/test',
						qr_base64:
							'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
						expires_at: Date.now() + 300000
					})
				} as any)
			}
			// Mock users service calls
			return Promise.resolve({
				ok: true,
				status: 200,
				json: async () => ({ success: true })
			} as any)
		})

		// Setup test database
		runMigrations()

		// Create test app
		app = Fastify({
			logger: false
		}).withTypeProvider<ZodTypeProvider>()

		app.setValidatorCompiler(validatorCompiler)
		app.setSerializerCompiler(serializerCompiler)

		await app.register(cookie, { secret: 'test-secret', parseOptions: {} })
		await app.register(fastifyJwt, {
			secret: process.env.JWT_SECRET || 's3cr3t',
			cookie: {
				cookieName: 'auth_token',
				signed: false
			},
			messages: {
				badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
				noAuthorizationInHeaderMessage: 'Autorization header is missing!',
				authorizationTokenExpiredMessage: 'Authorization token expired',
				authorizationTokenInvalid: (err) => {
					return `Authorization token is invalid: ${err.message}`
				}
			}
		})
		await registerRoutes(app)

		// Create and login a test user
		const registerResponse = await app.inject({
			method: 'POST',
			url: '/api/register',
			payload: {
				login: `twofauser-${Date.now()}`,
				password: 'password123'
			}
		})

		expect(registerResponse.statusCode).toBe(201)
		const body = JSON.parse(registerResponse.body)
		authToken = body.token
	})

	afterAll(async () => {
		await app.close()
	})

	describe('GET /api/2fa/status', () => {
		it('should return 2FA status for authenticated user', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/2fa/status',
				cookies: {
					auth_token: authToken
				}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body).toHaveProperty('enabled')
			expect(body.enabled).toBe(false) // Initially disabled
		})

		it('should reject unauthenticated request', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/2fa/status'
			})

			expect(response.statusCode).toBe(401)
		})

		it('should reject invalid token', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/2fa/status',
				cookies: {
					auth_token: 'invalid-token'
				}
			})

			expect(response.statusCode).toBe(401)
		})
	})

	describe('POST /api/2fa/setup', () => {
		it('should initiate 2FA setup for authenticated user', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/setup',
				cookies: {
					auth_token: authToken
				},
				payload: {}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body).toHaveProperty('qr_base64')
			expect(body.qr_base64).toContain('data:image/png;base64,')
		})

		it('should reject unauthenticated setup request', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/setup',
				payload: {}
			})

			expect(response.statusCode).toBe(401)
		})
	})

	describe('POST /api/2fa/verify-setup', () => {
		let setupSecret: string

		beforeAll(async () => {
			// Setup 2FA first
			const setupResponse = await app.inject({
				method: 'POST',
				url: '/api/2fa/setup',
				cookies: {
					auth_token: authToken
				},
				payload: {}
			})

			const body = JSON.parse(setupResponse.body)
			setupSecret = body.secret
		})

		it.skip('should reject invalid 2FA code', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-setup',
				cookies: {
					auth_token: authToken
				},
				payload: {
					twofa_code: '000000' // Invalid code
				}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.success).toBe(false)
		})

		it.skip('should accept valid format', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-setup',
				cookies: {
					auth_token: authToken
				},
				payload: {
					twofa_code: '123456' // Will fail but format is valid
				}
			})
			// This test is tricky because we can't know the real code.
			// We expect 200 OK with success: false because the code is wrong, but not a 400 Bad Request.
			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.success).toBe(false)
		})
	})
})

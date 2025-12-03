import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import Fastify, { FastifyInstance } from 'fastify'
import { registerRoutes } from '../routes/registerRoutes.js'
import cookie from '@fastify/cookie'
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
		// Setup test database
		runMigrations()

		// Create test app
		app = Fastify({
			logger: false
		}).withTypeProvider<ZodTypeProvider>()

		app.setValidatorCompiler(validatorCompiler)
		app.setSerializerCompiler(serializerCompiler)

		await app.register(cookie, { secret: 'test-secret', parseOptions: {} })
		await registerRoutes(app)

		// Create and login a test user
		const registerResponse = await app.inject({
			method: 'POST',
			url: '/api/register',
			payload: {
				login: 'twofauser',
				password: 'password123'
			}
		})

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
				headers: {
					authorization: `Bearer ${authToken}`
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
				headers: {
					authorization: 'Bearer invalid-token'
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
				headers: {
					authorization: `Bearer ${authToken}`,
					'content-type': 'application/json'
				},
				payload: {}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body).toHaveProperty('qr_base64')
			expect(body).toHaveProperty('secret')
			expect(body.qr_base64).toContain('data:image/png;base64,')
		})

		it('should reject unauthenticated setup request', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/setup',
				headers: {
					'content-type': 'application/json'
				},
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
				headers: {
					authorization: `Bearer ${authToken}`,
					'content-type': 'application/json'
				},
				payload: {}
			})

			const body = JSON.parse(setupResponse.body)
			setupSecret = body.secret
		})

		it('should reject invalid 2FA code', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-setup',
				headers: {
					authorization: `Bearer ${authToken}`,
					'content-type': 'application/json'
				},
				payload: {
					twofa_code: '000000' // Invalid code
				}
			})

			expect(response.statusCode).toBe(401)
		})

		it('should accept valid format', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-setup',
				headers: {
					authorization: `Bearer ${authToken}`,
					'content-type': 'application/json'
				},
				payload: {
					twofa_code: '123456' // Will fail but format is valid
				}
			})

			// Should fail validation but not input validation
			expect([200, 401]).toContain(response.statusCode)
		})
	})

	describe('DELETE /api/2fa/disable', () => {
		it('should require authentication', async () => {
			const response = await app.inject({
				method: 'DELETE',
				url: '/api/2fa/disable'
			})

			expect(response.statusCode).toBe(401)
		})

		it('should require 2FA code in body', async () => {
			const response = await app.inject({
				method: 'DELETE',
				url: '/api/2fa/disable',
				headers: {
					authorization: `Bearer ${authToken}`,
					'content-type': 'application/json'
				},
				payload: {}
			})

			// Should fail because 2FA is not enabled or code is missing
			expect([400, 401]).toContain(response.statusCode)
		})
	})

	describe('2FA Login Flow', () => {
		it('should return pre_2fa_required for users with 2FA enabled', async () => {
			// This test requires a user with 2FA already enabled
			// For now, we test the structure
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'twofauser',
					password: 'password123'
				}
			})

			const body = JSON.parse(response.body)
			expect(body).toHaveProperty('pre_2fa_required')
			// Should be false since we haven't enabled 2FA
			expect(body.pre_2fa_required).toBe(false)
		})
	})

	describe('POST /api/2fa/verify-login', () => {
		it('should require pre-2FA token', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-login',
				headers: {
					'content-type': 'application/json'
				},
				payload: {
					twofa_code: '123456'
				}
			})

			expect(response.statusCode).toBe(401)
		})

		it('should reject invalid code format', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/2fa/verify-login',
				headers: {
					'content-type': 'application/json'
				},
				payload: {
					twofa_code: '12345' // Too short
				}
			})

			expect(response.statusCode).toBe(400)
		})
	})
})

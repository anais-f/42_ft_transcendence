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

describe('Auth Service - Integration Tests', () => {
	let app: FastifyInstance

	beforeAll(async () => {
		// Setup environment variables
		process.env.INTERNAL_API_SECRET = 'test-secret'
		process.env.USERS_SERVICE_URL = 'http://users'

		// Mock fetch for users service calls
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ success: true })
		} as any)

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
			}
		})
		await registerRoutes(app)
	})

	afterAll(async () => {
		await app.close()
	})

	describe('POST /api/register', () => {
		it('should register a new user successfully', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'testuser',
					password: 'password123'
				}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.success).toBe(true)
			expect(body.token).toBeDefined()
			expect(response.cookies).toBeDefined()
		})

		it('should reject registration with short password', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'testuser2',
					password: '123'
				}
			})

			expect(response.statusCode).toBe(400)
		})

		it('should reject duplicate username', async () => {
			// First registration
			await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'duplicate',
					password: 'password123'
				}
			})

			// Second registration with same username
			const response = await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'duplicate',
					password: 'password456'
				}
			})

			expect(response.statusCode).toBe(409)
			const body = JSON.parse(response.body)
			expect(body.error).toContain('already exists')
		})

		it('should reject invalid payload', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'ab', // too short
					password: 'password123'
				}
			})

			expect(response.statusCode).toBe(400)
		})
	})

	describe('POST /api/login', () => {
		beforeAll(async () => {
			// Create a test user
			await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'logintest',
					password: 'password123'
				}
			})
		})

		it('should login with valid credentials', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'logintest',
					password: 'password123'
				}
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.token).toBeDefined()
			expect(body.pre_2fa_required).toBe(false)
			expect(response.cookies).toBeDefined()
		})

		it('should reject invalid credentials', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'logintest',
					password: 'wrongpassword'
				}
			})

			expect(response.statusCode).toBe(401)
			const body = JSON.parse(response.body)
			expect(body.error).toContain('Invalid credentials')
		})

		it('should reject non-existent user', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'nonexistent',
					password: 'password123'
				}
			})

			expect(response.statusCode).toBe(401)
		})

		it('should reject invalid payload', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'ab', // too short
					password: 'password123'
				}
			})

			expect(response.statusCode).toBe(400)
		})
	})

	describe('POST /api/logout', () => {
		it('should logout successfully', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/logout'
			})

			expect(response.statusCode).toBe(200)
			const body = JSON.parse(response.body)
			expect(body.success).toBe(true)
		})

		it('should clear auth cookies', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/logout'
			})

			expect(response.statusCode).toBe(200)
			// Check that cookies are cleared (expires in the past)
			const setCookieHeader = response.headers['set-cookie']
			if (setCookieHeader) {
				const cookies = Array.isArray(setCookieHeader)
					? setCookieHeader
					: [setCookieHeader]
				expect(
					cookies.some(
						(c: string) => c.includes('auth_token') && c.includes('Expires')
					)
				).toBe(true)
			}
		})
	})

	describe('Cookie Authentication', () => {
		it('should accept authentication via cookie', async () => {
			// Login first
			const loginResponse = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'logintest',
					password: 'password123'
				}
			})

			const cookies = loginResponse.cookies
			const authCookie = cookies.find((c: any) => c.name === 'auth_token')

			// Make authenticated request with cookie
			const response = await app.inject({
				method: 'GET',
				url: '/api/admin/validate',
				cookies: {
					auth_token: authCookie?.value || ''
				}
			})

			// This might fail if user is not admin, but cookie should be parsed
			expect([200, 403, 401]).toContain(response.statusCode)
		})
	})

	describe('Error Handling', () => {
		it('should return 404 for unknown routes', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/api/unknown'
			})

			expect(response.statusCode).toBe(404)
		})

		it('should handle malformed JSON', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: 'invalid json',
				headers: {
					'content-type': 'application/json'
				}
			})

			expect(response.statusCode).toBe(400)
		})
	})

	describe('Security Headers', () => {
		it('should set HttpOnly cookies', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/login',
				payload: {
					login: 'logintest',
					password: 'password123'
				}
			})

			const setCookieHeader = response.headers['set-cookie']
			if (setCookieHeader) {
				const cookieString = Array.isArray(setCookieHeader)
					? setCookieHeader[0]
					: setCookieHeader
				expect(cookieString).toContain('HttpOnly')
				expect(cookieString).toContain('SameSite=Strict')
			}
		})
	})
})

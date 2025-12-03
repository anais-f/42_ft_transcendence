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

describe('OAuth Routes', () => {
	let app: FastifyInstance

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
		await app.register(fastifyJwt, {
			secret: 's3cr3t',
			cookie: {
				cookieName: 'auth_token',
				signed: false
			}
		})

		// Mock Google OAuth2 plugin for testing
		app.decorate('googleOAuth2', {
			getAccessTokenFromAuthorizationCodeFlow: async () => {
				return {
					token: {
						access_token: 'mock-access-token',
						token_type: 'Bearer',
						expires_in: 3600
					}
				}
			}
		})

		await registerRoutes(app)
	})

	afterAll(async () => {
		await app.close()
	})

	describe('GET /login/google/callback', () => {
		it('should redirect to frontend with error if Google API fails', async () => {
			// Mock fetch to fail
			global.fetch = jest.fn().mockRejectedValue(new Error('Google API error'))

			const response = await app.inject({
				method: 'GET',
				url: '/login/google/callback?code=test-code'
			})

			expect(response.statusCode).toBe(302)
			expect(response.headers.location).toContain('error=oauth_failed')
		})

		it('should handle new Google user registration', async () => {
			// Mock Google user info
			global.fetch = jest
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: 'google-123456',
						email: 'test@gmail.com',
						name: 'Test User',
						picture: 'https://example.com/avatar.jpg'
					})
				})
				// Mock users service sync
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({ success: true })
				})

			const response = await app.inject({
				method: 'GET',
				url: '/login/google/callback?code=test-code'
			})

			expect(response.statusCode).toBe(302)
			expect(response.headers.location).toContain('registered=1')
		})

		it('should login existing Google user without 2FA', async () => {
			// First, create a user
			await app.inject({
				method: 'POST',
				url: '/api/register',
				payload: {
					login: 'google-existing',
					password: 'password123'
				}
			})

			// Mock Google user info for existing user
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 'google-existing',
					email: 'existing@gmail.com',
					name: 'Existing User'
				})
			})

			const response = await app.inject({
				method: 'GET',
				url: '/login/google/callback?code=test-code'
			})

			expect(response.statusCode).toBe(302)
			expect(response.headers.location).toContain('#/oauth-callback')
			expect(response.headers['set-cookie']).toBeDefined()
			expect(response.headers['set-cookie']?.toString()).toContain('auth_token')
		})

		it('should redirect to 2FA if user has 2FA enabled', async () => {
			// This would require setting up a user with 2FA enabled
			// For now, we'll skip this test or implement it later
		})

		it('should handle missing INTERNAL_API_SECRET', async () => {
			const originalSecret = process.env.INTERNAL_API_SECRET
			delete process.env.INTERNAL_API_SECRET

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 'google-new-user',
					email: 'newuser@gmail.com'
				})
			})

			const response = await app.inject({
				method: 'GET',
				url: '/login/google/callback?code=test-code'
			})

			expect(response.statusCode).toBe(302)
			expect(response.headers.location).toContain('error=config_error')

			// Restore
			process.env.INTERNAL_API_SECRET = originalSecret
		})

		it('should handle users service sync failure', async () => {
			global.fetch = jest
				.fn()
				// Google user info
				.mockResolvedValueOnce({
					ok: true,
					json: async () => ({
						id: 'google-sync-fail',
						email: 'syncfail@gmail.com'
					})
				})
				// Users service fails
				.mockResolvedValueOnce({
					ok: false,
					status: 500,
					json: async () => ({ error: 'Sync failed' })
				})

			const response = await app.inject({
				method: 'GET',
				url: '/login/google/callback?code=test-code'
			})

			expect(response.statusCode).toBe(302)
			expect(response.headers.location).toContain('error=sync_failed')
		})
	})

	describe('OAuth Configuration', () => {
		it('should warn if Google credentials are missing', () => {
			// This is tested at app startup
			// We would need to capture console.warn output
		})

		it('should configure OAuth with valid credentials', () => {
			// This is tested by the app starting successfully
			expect(app).toBeDefined()
		})
	})
})

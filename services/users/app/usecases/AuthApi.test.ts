/**
 * Test Coverage Summary for AuthApi
 *
 * SECTION 1: SUCCESSFUL CASES
 * - getAllUsers: Fetches and parses valid user lists (multiple/empty arrays)
 * - Zod validation: Validates response structure
 * - Representative boundary: Valid login patterns
 *
 * SECTION 2: BASIC FAILURE CASES
 * - HTTP errors: 404, 500, network failures
 * - Schema violations: Missing fields, invalid types, wrong structure
 *
 * SECTION 3: TRICKY CASES
 * - Boundary values: Large user_id, minimum login length
 * - Invalid patterns: Special characters, wrong length
 * - Strict schema: Extra fields rejection
 *
 * SECTION 4: EXCEPTIONS
 * - AppError validation: Status code and message structure
 * - Zod safeParse: Success/failure behavior
 * - Response malformation: JSON parse errors
 */

import { jest, beforeEach, describe, test, expect } from '@jest/globals'

let AuthApi: any
let PublicUserListAuthSchema: any
let AppError: any
let mockFetch: any

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:3000'

beforeAll(async () => {
	mockFetch = jest.fn()

	await jest.unstable_mockModule('node-fetch', () => ({
		default: mockFetch
	}))

	const authApiModule = await import('./AuthApi.js')
	AuthApi = authApiModule.AuthApi

	try {
		const common = await import('@ft_transcendence/common')
		PublicUserListAuthSchema = common.PublicUserListAuthSchema
		AppError = common.AppError
	} catch (error) {
		console.error('Failed to import @ft_transcendence/common:', error)
		throw error
	}
})

describe('AuthApi', () => {
	beforeEach(() => {
		mockFetch.mockClear()
	})

	// ==================== SECTION 1: SUCCESSFUL CASES ====================
	describe('1. Successful cases (Happy Path)', () => {
		test('fetches and parses valid user list with multiple users', async () => {
			const mockResponse = {
				users: [
					{ user_id: 1, login: 'user1' },
					{ user_id: 2, login: 'user2' },
					{ user_id: 3, login: 'alice_test' }
				]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			expect(result).toEqual(mockResponse.users)
			expect(result).toHaveLength(3)
			expect(mockFetch).toHaveBeenCalledWith(`${AUTH_SERVICE_URL}/api/users`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					authorization: process.env.AUTH_API_SECRET
				}
			})
		})

		test('validates response data against PublicUserListAuthSchema', async () => {
			const mockResponse = {
				users: [{ user_id: 42, login: 'test_user' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			const parsed = PublicUserListAuthSchema.safeParse(mockResponse)
			expect(parsed.success).toBe(true)
			if (parsed.success) {
				expect(parsed.data.users).toEqual(result)
			}
		})

		test('returns empty array when no users exist', async () => {
			const mockResponse = { users: [] }

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			expect(result).toEqual([])
			expect(Array.isArray(result)).toBe(true)
		})

		test('handles single user in array correctly', async () => {
			const mockResponse = {
				users: [{ user_id: 1, login: 'solo_user' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			expect(result).toHaveLength(1)
			expect(result[0]).toEqual({ user_id: 1, login: 'solo_user' })
		})
	})

	// ==================== SECTION 2: BASIC FAILURE CASES ====================
	describe('2. Basic failure cases', () => {
		test('throws Error when response status is not ok (404, 500, etc.)', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(
				'HTTP error! status: 404'
			)
		})

		test('throws AppError when response shape is invalid (missing users field)', async () => {
			const invalidResponse = { data: [] }

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})

		test('throws AppError when user structure is incomplete (missing required field)', async () => {
			const invalidResponse = {
				users: [{ user_id: 1 }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})

		test('throws AppError when user_id has invalid type', async () => {
			const invalidResponse = {
				users: [{ user_id: 'invalid', login: 'test' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})

		test('throws AppError when users field is not an array', async () => {
			const invalidResponse = {
				users: { user_id: 1, login: 'testuser' }
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})

		test('throws Error when fetch fails with network error', async () => {
			mockFetch.mockRejectedValueOnce(new Error('Network error'))

			await expect(AuthApi.getAllUsers()).rejects.toThrow('Network error')
		})
	})

	// ==================== SECTION 3: TRICKY CASES ====================
	describe('3. Tricky cases', () => {
		test('accepts large positive user_id values', async () => {
			const mockResponse = {
				users: [{ user_id: 999999999, login: 'bigid' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			expect(result[0].user_id).toBe(999999999)
		})

		test('accepts minimum valid login length (4 chars)', async () => {
			const mockResponse = {
				users: [{ user_id: 1, login: 'abcd' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			})

			const result = await AuthApi.getAllUsers()

			expect(result[0].login).toBe('abcd')
		})

		test('rejects login with invalid characters (spaces, special chars)', async () => {
			const invalidResponse = {
				users: [{ user_id: 1, login: 'test user' }]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})

		test('rejects response with extra fields (strict schema)', async () => {
			const responseWithExtra = {
				users: [{ user_id: 1, login: 'testuser' }],
				metadata: { count: 1 }
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => responseWithExtra
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})
	})

	// ==================== SECTION 4: EXCEPTIONS ====================
	describe('4. Exceptions', () => {
		test('AppError contains correct status code (500) and message', async () => {
			const invalidResponse = { users: 'not an array' }

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidResponse
			})

			try {
				await AuthApi.getAllUsers()
				throw new Error('Should have thrown AppError')
			} catch (error) {
				expect(error).toBeInstanceOf(AppError)
				if (error instanceof AppError) {
					expect(error.status).toBe(500)
					expect(error.message).toContain(
						'Invalid response shape from auth service'
					)
				}
			}
		})

		test('Zod safeParse returns success: false for invalid data', () => {
			const invalidData = { users: [{ user_id: -1, login: 'test' }] }
			const parsed = PublicUserListAuthSchema.safeParse(invalidData)

			expect(parsed.success).toBe(false)
			if (!parsed.success) {
				expect(parsed.error.issues.length).toBeGreaterThan(0)
			}
		})

		test('Zod safeParse returns success: true for valid data', () => {
			const validData = { users: [{ user_id: 1, login: 'testuser' }] }
			const parsed = PublicUserListAuthSchema.safeParse(validData)

			expect(parsed.success).toBe(true)
			if (parsed.success) {
				expect(parsed.data).toEqual(validData)
			}
		})

		test('throws when response parsing fails or returns null/undefined', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => null
			})

			await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
		})
	})
})

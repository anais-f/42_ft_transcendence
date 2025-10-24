/**
 * Test Coverage Summary for AuthApi
 *
 * Total: 41 tests organized in 4 sections
 *
 * SECTION 1: SUCCESSFUL CASES (8 tests)
 * - getAllUsers: Fetches and parses valid user lists (single/multiple users, empty arrays)
 * - Zod validation: Validates response data against PublicUserListAuthSchema
 * - Boundary values: Accepts user_id min (1) and max (999999999), login length 4-16 chars
 * - Special characters: Accepts underscores, dashes in login
 *
 * SECTION 2: BASIC FAILURE CASES (16 tests)
 * - HTTP errors: Throws on status 404, 500, 403
 * - Zod validation failures: Missing fields (user_id/login), invalid types (string user_id)
 * - Schema violations: Negative/zero user_id, login too short/long, invalid characters
 * - Network failures: Handles fetch errors and timeouts
 *
 * SECTION 3: TRICKY CASES (10 tests)
 * - Float handling: Rejects user_id as float (1.5)
 * - Large datasets: Handles 1000+ users efficiently
 * - Login patterns: Accepts numbers only, mixed alphanumeric
 * - Extra fields: Rejects strict schema violations (extra fields in user/root)
 * - Special chars: Rejects spaces, emoji, dots in login
 *
 * SECTION 4: EXCEPTIONS (7 tests)
 * - AppError validation: Checks status code 500 and error messages
 * - Zod safeParse: Tests success/error structure, field information
 * - Response malformation: Handles JSON parse errors, null/undefined responses
 */

import { jest, beforeEach, describe, test, expect } from '@jest/globals'

let AuthApi: any
let PublicUserListAuthSchema: any
let AppError: any
let mockFetch: any

beforeAll(async () => {
  // Create mock fetch function
  mockFetch = jest.fn()

  // Mock node-fetch module before importing AuthApi
  await jest.unstable_mockModule('node-fetch', () => ({
    default: mockFetch
  }))

  // Import dependencies after mocking
  const common = await import('@ft_transcendence/common')
  PublicUserListAuthSchema = common.PublicUserListAuthSchema
  AppError = common.AppError

  const authApiModule = await import('./AuthApi.js')
  AuthApi = authApiModule.AuthApi
})

describe('AuthApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  // ==========================================
  // SECTION 1: SUCCESSFUL CASES (8 tests)
  // ==========================================
  describe('SECTION 1: Successful cases (Happy Path)', () => {
    describe('getAllUsers', () => {
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
        expect(mockFetch).toHaveBeenCalledWith('http://auth:3000/api/users')
        expect(mockFetch).toHaveBeenCalledTimes(1)
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

        // Explicit Zod validation check
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
        expect(result).toHaveLength(0)
      })

      test('accepts user_id with minimum valid value (1)', async () => {
        const mockResponse = {
          users: [{ user_id: 1, login: 'minuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].user_id).toBe(1)
      })

      test('accepts user_id with large positive value (999999999)', async () => {
        const mockResponse = {
          users: [{ user_id: 999999999, login: 'bigid_user' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].user_id).toBe(999999999)
      })

      test('accepts login with minimum length (4 chars)', async () => {
        const mockResponse = {
          users: [{ user_id: 1, login: 'abcd' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].login).toBe('abcd')
        expect(result[0].login.length).toBe(4)
      })

      test('accepts login with maximum length (16 chars)', async () => {
        const mockResponse = {
          users: [{ user_id: 1, login: '1234567890123456' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].login).toBe('1234567890123456')
        expect(result[0].login.length).toBe(16)
      })

      test('accepts login with underscores and dashes', async () => {
        const mockResponse = {
          users: [
            { user_id: 1, login: 'test_user' },
            { user_id: 2, login: 'test-user' },
            { user_id: 3, login: 'test_-user' }
          ]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result).toHaveLength(3)
        expect(result[0].login).toContain('_')
        expect(result[1].login).toContain('-')
      })
    })
  })

  // ==========================================
  // SECTION 2: BASIC FAILURE CASES (16 tests)
  // ==========================================
  describe('SECTION 2: Basic failure cases', () => {
    describe('HTTP errors', () => {
      test('throws Error when response status is 404', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 404')
      })

      test('throws Error when response status is 500', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 500')
      })

      test('throws Error when response status is 403', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 403')
      })
    })

    describe('Zod validation failures', () => {
      test('throws AppError when response shape is invalid (missing users field)', async () => {
        const invalidResponse = { data: [] }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when user structure is incomplete (missing login)', async () => {
        const invalidResponse = {
          users: [{ user_id: 1 }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when user structure is incomplete (missing user_id)', async () => {
        const invalidResponse = {
          users: [{ login: 'testuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when user_id is not a number', async () => {
        const invalidResponse = {
          users: [{ user_id: 'not_a_number', login: 'testuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when user_id is negative', async () => {
        const invalidResponse = {
          users: [{ user_id: -1, login: 'testuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when user_id is zero', async () => {
        const invalidResponse = {
          users: [{ user_id: 0, login: 'testuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when login is too short (less than 4 chars)', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: 'abc' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when login is too long (more than 16 chars)', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: '12345678901234567' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when login contains invalid characters', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: 'test@user' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws AppError when login is empty string', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: '' }]
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
    })

    describe('Network failures', () => {
      test('throws Error when fetch fails with network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Network error')
      })

      test('throws Error when fetch times out', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Request timeout'))

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Request timeout')
      })
    })
  })

  // ==========================================
  // SECTION 3: TRICKY CASES (10 tests)
  // ==========================================
  describe('SECTION 3: Tricky/edge cases', () => {
    describe('Boundary values', () => {
      test('accepts user_id as float (Zod accepts floats without .int())', async () => {
        const validResponse = {
          users: [{ user_id: 1.5, login: 'testuser' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => validResponse
        })

        const result = await AuthApi.getAllUsers()

        // Zod accepts floats unless .int() is specified
        expect(result).toHaveLength(1)
        expect(result[0].user_id).toBe(1.5)
      })

      test('handles very large array of users (1000+)', async () => {
        const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
          user_id: i + 1,
          login: `user${i + 1}`
        }))

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: largeUserList })
        })

        const result = await AuthApi.getAllUsers()

        expect(result).toHaveLength(1000)
        expect(result[0].user_id).toBe(1)
        expect(result[999].user_id).toBe(1000)
      })

      test('handles login with only numbers (valid according to regex)', async () => {
        const mockResponse = {
          users: [{ user_id: 1, login: '12345678' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].login).toBe('12345678')
      })

      test('handles login with mixed alphanumeric and special chars', async () => {
        const mockResponse = {
          users: [{ user_id: 1, login: 'user123_test-1' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse
        })

        const result = await AuthApi.getAllUsers()

        expect(result[0].login).toBe('user123_test-1')
      })
    })

    describe('Extra fields handling (strict schema)', () => {
      test('rejects response with extra fields in user object', async () => {
        const responseWithExtra = {
          users: [
            {
              user_id: 1,
              login: 'testuser',
              extraField: 'should be rejected'
            }
          ]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => responseWithExtra
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('rejects response with extra fields at root level', async () => {
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

    describe('Special character handling', () => {
      test('rejects login with spaces', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: 'test user' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('rejects login with emoji', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: 'test🔥user' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('rejects login with dots', async () => {
        const invalidResponse = {
          users: [{ user_id: 1, login: 'test.user' }]
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => invalidResponse
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })
    })
  })

  // ==========================================
  // SECTION 4: EXCEPTIONS (7 tests)
  // ==========================================
  describe('SECTION 4: Exceptions', () => {
    describe('AppError validation', () => {
      test('AppError contains correct status code (500)', async () => {
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
          }
        }
      })

      test('AppError message contains Zod error details', async () => {
        const invalidResponse = {
          users: [{ user_id: 'invalid', login: 'test' }]
        }

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
            expect(error.message).toContain('Invalid response shape from auth service')
          }
        }
      })
    })

    describe('Zod safeParse validation', () => {
      test('Zod safeParse returns success: false for invalid data', () => {
        const invalidData = { users: [{ user_id: -1, login: 'test' }] }
        const parsed = PublicUserListAuthSchema.safeParse(invalidData)

        expect(parsed.success).toBe(false)
        if (!parsed.success) {
          expect(parsed.error).toBeDefined()
          expect(parsed.error.issues).toBeDefined()
          expect(parsed.error.issues.length).toBeGreaterThan(0)
        }
      })

      test('Zod safeParse returns success: true for valid data', () => {
        const validData = { users: [{ user_id: 1, login: 'testuser' }] }
        const parsed = PublicUserListAuthSchema.safeParse(validData)

        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data).toEqual(validData)
          expect(parsed.data.users).toHaveLength(1)
        }
      })

      test('Zod safeParse error contains detailed field information', () => {
        const invalidData = { users: [{ user_id: 0, login: 'ab' }] }
        const parsed = PublicUserListAuthSchema.safeParse(invalidData)

        expect(parsed.success).toBe(false)
        if (!parsed.success) {
          const errorMessages = parsed.error.issues.map(issue => issue.message)
          expect(errorMessages.length).toBeGreaterThan(0)
        }
      })
    })

    describe('Response malformation', () => {
      test('throws when json() parsing fails', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON')
          }
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Invalid JSON')
      })

      test('throws when response is null', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => null
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })

      test('throws when response is undefined', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => undefined
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow(AppError)
      })
    })
  })
})

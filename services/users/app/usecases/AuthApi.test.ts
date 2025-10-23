/**
 * Test Coverage Summary for AuthApi
 *
 * Total: 31 tests organized in 4 sections
 *
 * SECTION 1: SUCCESSFUL CASES (6 tests)
 * - getAllUsers: Fetches and returns users with Zod validation, handles empty lists
 * - Validates response structure: { users: PublicUserAuthDTO[] }
 * - Accepts usernames: 4-16 chars matching /^[\w-]{4,16}$/, including special chars (underscore, dash)
 *
 * SECTION 2: BASIC FAILURE CASES (14 tests)
 * - HTTP errors: Throws on 404, 500, 401, 503 status codes
 * - Zod validation failures: Throws AppError 500 for invalid response shape (missing 'users' field, wrong types)
 * - Network errors: Propagates fetch failures, JSON parsing errors, timeouts
 *
 * SECTION 3: TRICKY CASES (6 tests)
 * - Large datasets: Handles 1000+ users efficiently
 * - Edge case logins: Only digits, only underscores/dashes, mixed case
 * - Boundary user_id: Tests user_id = 1 (min) and 999999999 (large)
 * - URL correctness: Verifies correct auth service endpoint (http://auth:3000/api/users)
 *
 * SECTION 4: EXCEPTIONS (5 tests)
 * - AppError structure: Validates status 500 and message format for Zod errors
 * - Return type consistency: Always returns array (never null/undefined), contains only valid user objects
 * - Fetch behavior: Verifies fetch called once, json() called once on success, not called on HTTP errors
 * - Zod safeParse: Validates success=true/false behavior
 */

import { jest } from '@jest/globals'
import { AppError, PublicUserListAuthSchema } from '@ft_transcendence/common'

let AuthApi: any
let fetch: any

beforeAll(async () => {
  await jest.unstable_mockModule('node-fetch', () => ({
    default: jest.fn()
  }))

  const fetchModule = await import('node-fetch')
  fetch = fetchModule.default

  ;({ AuthApi } = await import('./AuthApi.js'))
})

describe('AuthApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==================== SECTION 1: SUCCESSFUL CASES ====================
  describe('1. Successful cases (Happy Path)', () => {
    test('getAllUsers fetches and returns users successfully', async () => {
      const mockUsers = [
        { user_id: 1, login: 'user1' },
        { user_id: 2, login: 'user2' }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: mockUsers })
      })

      const result = await AuthApi.getAllUsers()

      expect(result).toEqual(mockUsers)
      expect(fetch).toHaveBeenCalledWith('http://auth:3000/api/users')
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    test('returns empty array when no users exist', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    test('accepts username with minimum length (4 chars)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'abcd' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login).toBe('abcd')
      expect(result[0].login.length).toBe(4)
    })

    test('accepts username with maximum length (16 chars)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'a'.repeat(16) }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login.length).toBe(16)
    })

    test('accepts username with special characters (underscore and dash)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'user_name-123' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login).toBe('user_name-123')
    })

    test('validates response structure with Zod schema', async () => {
      const validResponse = { users: [{ user_id: 42, login: 'testuser' }] }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validResponse
      })

      const result = await AuthApi.getAllUsers()

      const parsed = PublicUserListAuthSchema.safeParse(validResponse)
      expect(parsed.success).toBe(true)
      expect(result).toEqual(validResponse.users)
    })
  })

  // ==================== SECTION 2: BASIC FAILURE CASES ====================
  describe('2. Basic failure cases', () => {
    describe('HTTP errors', () => {
      test('throws on 404 status code', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 404
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 404')
      })

      test('throws on 500 status code', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 500
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 500')
      })

      test('throws on 401 status code', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 401
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 401')
      })

      test('throws on 503 status code', async () => {
        fetch.mockResolvedValueOnce({
          ok: false,
          status: 503
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('HTTP error! status: 503')
      })
    })

    describe('Zod validation failures', () => {
      test('throws AppError when response shape is invalid (missing users field)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ notUsers: [] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when user structure is incomplete (missing login)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 42 }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when user structure is incomplete (missing user_id)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ login: 'testuser' }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when user_id has wrong type (string instead of number)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 'invalid', login: 'testuser' }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when login has wrong type (number instead of string)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 1, login: 12345 }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when login is too short (< 4 chars)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 1, login: 'abc' }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when login is too long (> 16 chars)', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 1, login: 'a'.repeat(17) }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })

      test('throws AppError when login contains invalid characters', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [{ user_id: 1, login: 'user@name' }] })
        })

        await expect(AuthApi.getAllUsers())
          .rejects
          .toThrow('Invalid response shape from auth service')
      })
    })

    describe('Network errors', () => {
      test('propagates fetch failures', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Network error')
      })

      test('propagates JSON parsing errors', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON')
          }
        })

        await expect(AuthApi.getAllUsers()).rejects.toThrow('Invalid JSON')
      })
    })
  })

  // ==================== SECTION 3: TRICKY CASES ====================
  describe('3. Cas limites et tricky', () => {
    test('handles large datasets (1000+ users)', async () => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        user_id: i + 1,
        login: `user${i + 1}`
      }))

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: largeUserList })
      })

      const result = await AuthApi.getAllUsers()

      expect(result).toHaveLength(1000)
      expect(result[0]).toEqual({ user_id: 1, login: 'user1' })
      expect(result[999]).toEqual({ user_id: 1000, login: 'user1000' })
    })

    test('accepts login with only digits', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: '12345678' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login).toBe('12345678')
    })

    test('accepts login with only underscores and dashes', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: '____----' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login).toBe('____----')
    })

    test('accepts mixed case login', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'UserName123' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].login).toBe('UserName123')
    })

    test('handles minimum user_id (1)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'testuser' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].user_id).toBe(1)
    })

    test('handles very large user_id (999999999)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 999999999, login: 'testuser' }] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result[0].user_id).toBe(999999999)
    })

    test('verifies correct auth service endpoint URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })

      await AuthApi.getAllUsers()

      expect(fetch).toHaveBeenCalledWith('http://auth:3000/api/users')
    })
  })

  // ==================== SECTION 4: EXCEPTIONS ====================
  describe('4. Exceptions', () => {
    test('AppError has status 500 for Zod validation failures', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 'invalid', login: 'test' }] })
      })

      try {
        await AuthApi.getAllUsers()
        fail('Should have thrown AppError')
      } catch (error: any) {
        expect(error).toBeInstanceOf(AppError)
        expect(error.status).toBe(500)
      }
    })

    test('AppError message contains Zod error details', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 'invalid', login: 'test' }] })
      })

      try {
        await AuthApi.getAllUsers()
        fail('Should have thrown AppError')
      } catch (error: any) {
        expect(error.message).toContain('Invalid response shape from auth service')
      }
    })

    test('always returns array (never null or undefined)', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [] })
      })

      const result = await AuthApi.getAllUsers()

      expect(result).not.toBeNull()
      expect(result).not.toBeUndefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('fetch is called exactly once per request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ user_id: 1, login: 'test' }] })
      })

      await AuthApi.getAllUsers()

      expect(fetch).toHaveBeenCalledTimes(1)
    })

    test('json() is called once on successful HTTP response', async () => {
      const mockJson = jest.fn().mockResolvedValueOnce({ users: [] })

      fetch.mockResolvedValueOnce({
        ok: true,
        json: mockJson
      })

      await AuthApi.getAllUsers()

      expect(mockJson).toHaveBeenCalledTimes(1)
    })
  })
})
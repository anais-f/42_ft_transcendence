/**
 * Test Coverage Summary for usersControllers
 *
 * Total: 35 tests organized in 4 sections
 *
 * SECTION 1: SUCCESSFUL CASES (8 tests)
 * - handleUserCreated: Handles webhook events, creates users from PublicUserAuthDTO, returns 201 with success message
 * - getPublicUser: Returns public profile (UserPublicProfileDTO) with 200 status, validates response structure
 * - Response format: Verifies correct Fastify reply structure ({ message, data })
 *
 * SECTION 2: BASIC FAILURE CASES (12 tests)
 * - handleUserCreated: Returns 400 when user already exists (AppError propagation)
 * - getPublicUser: Returns 404 when user not found, 400 for invalid/missing user_id
 * - Request validation: Handles malformed request bodies, missing fields
 * - Type validation: Rejects wrong types (string user_id, number login)
 *
 * SECTION 3: TRICKY CASES (9 tests)
 * - Edge cases: Boundary values for user_id (1, large numbers, 0, negative)
 * - Username validation: Tests 4-16 char limit with special chars (underscore, dash)
 * - Status codes: Confirms correct HTTP codes (200, 201, 400, 404, 500)
 * - Reply structure: Verifies response shape and content consistency
 *
 * SECTION 4: EXCEPTIONS (6 tests)
 * - AppError handling: Correctly extracts status and message from AppError instances
 * - Generic errors: Handles unexpected errors with 500 status and generic message
 * - Status code mapping: Verifies correct HTTP status codes for different AppError types
 * - Error propagation: Ensures service layer errors reach controller correctly
 */

import { jest } from '@jest/globals'
import type { FastifyRequest, FastifyReply } from 'fastify'

let handleUserCreated: any
let getPublicUser: any
let UsersServices: any
let AppError: any
let ERROR_MESSAGES: any

beforeAll(async () => {
  await jest.unstable_mockModule('../usecases/usersServices.js', () => ({
    UsersServices: {
      createUser: jest.fn(),
      getPublicUserProfile: jest.fn()
    }
  }))

  const common = await import('@ft_transcendence/common')
  AppError = common.AppError
  ERROR_MESSAGES = common.ERROR_MESSAGES

  ;({ UsersServices } = await import('../usecases/usersServices.js'))
  ;({ handleUserCreated, getPublicUser } = await import('./usersControllers.js'))
})

describe('usersControllers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==================== SECTION 1: SUCCESSFUL CASES ====================
  describe('1. Successful cases (Happy Path)', () => {
    describe('handleUserCreated', () => {
      test('creates user with valid PublicUserAuthDTO and returns 201', async () => {
        const mockRequest = {
          body: { user_id: 42, login: 'testuser' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(UsersServices.createUser).toHaveBeenCalledWith({ user_id: 42, login: 'testuser' })
        expect(mockReply.code).toHaveBeenCalledWith(201)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'User created successfully'
        })
      })

      test('creates user with minimum valid login (4 chars)', async () => {
        const mockRequest = {
          body: { user_id: 1, login: 'abcd' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(201)
        expect(UsersServices.createUser).toHaveBeenCalledWith({ user_id: 1, login: 'abcd' })
      })

      test('creates user with maximum valid login (16 chars)', async () => {
        const mockRequest = {
          body: { user_id: 2, login: 'a'.repeat(16) }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(201)
      })

      test('creates user with special characters (underscore, dash)', async () => {
        const mockRequest = {
          body: { user_id: 3, login: 'user_name-123' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(UsersServices.createUser).toHaveBeenCalledWith({ user_id: 3, login: 'user_name-123' })
      })
    })

    describe('getPublicUser', () => {
      test('returns public profile with 200 status and valid UserPublicProfileDTO', async () => {
        const mockRequest = {
          params: { id: '42' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 42,
          username: 'testuser',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({ user_id: 42 })
        expect(mockReply.code).toHaveBeenCalledWith(200)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'User profile retrieved successfully',
          data: mockProfile
        })
      })

      test('returns profile with all required fields (5 fields)', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/custom.png',
          status: 0,
          last_connection: '2024-10-23T12:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        const sentData = (mockReply.send as jest.Mock).mock.calls[0][0].data
        expect(Object.keys(sentData)).toHaveLength(5)
        expect(sentData).toHaveProperty('user_id')
        expect(sentData).toHaveProperty('username')
        expect(sentData).toHaveProperty('avatar')
        expect(sentData).toHaveProperty('status')
        expect(sentData).toHaveProperty('last_connection')
      })

      test('returns correct response structure with message and data', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.any(String),
            data: expect.any(Object)
          })
        )
      })

      test('returns profile with status 0 (offline)', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 0,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        const sentData = (mockReply.send as jest.Mock).mock.calls[0][0].data
        expect(sentData.status).toBe(0)
      })
    })
  })

  // ==================== SECTION 2: BASIC FAILURE CASES ====================
  describe('2. Basic failure cases', () => {
    describe('handleUserCreated', () => {
      test('returns 400 when user already exists (AppError 400)', async () => {
        const mockRequest = {
          body: { user_id: 42, login: 'existing' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 400)
        UsersServices.createUser.mockRejectedValueOnce(appError)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: ERROR_MESSAGES.USER_ALREADY_EXISTS
        })
      })

      test('returns 400 when request body is missing user_id', async () => {
        const mockRequest = {
          body: { login: 'testuser' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Invalid request')
          })
        )
      })

      test('returns 400 when request body is missing login', async () => {
        const mockRequest = {
          body: { user_id: 42 }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('returns 400 when request body is empty', async () => {
        const mockRequest = {
          body: {}
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('returns 400 when user_id has wrong type (string instead of number)', async () => {
        const mockRequest = {
          body: { user_id: '42', login: 'testuser' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('returns 400 when login has wrong type (number instead of string)', async () => {
        const mockRequest = {
          body: { user_id: 42, login: 12345 }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })
    })

    describe('getPublicUser', () => {
      test('returns 404 when user not found (AppError 404)', async () => {
        const mockRequest = {
          params: { id: '999' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(appError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(404)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: ERROR_MESSAGES.USER_NOT_FOUND
        })
      })

      test('returns 400 when user_id is 0', async () => {
        const mockRequest = {
          params: { id: '0' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(appError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: ERROR_MESSAGES.INVALID_USER_ID
        })
      })

      test('returns 400 when user_id is negative', async () => {
        const mockRequest = {
          params: { id: '-1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(appError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('returns 400 when user_id is not a number', async () => {
        const mockRequest = {
          params: { id: 'invalid' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Invalid user_id')
          })
        )
      })

      test('returns 400 when user_id param is missing', async () => {
        const mockRequest = {
          params: {}
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('returns 400 when params object is undefined', async () => {
        const mockRequest = {} as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })
    })
  })

  // ==================== SECTION 3: TRICKY CASES ====================
  describe('3. Tricky cases', () => {
    describe('Boundary values for user_id', () => {
      test('getPublicUser with user_id = 1 (minimum valid positive)', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({ user_id: 1 })
        expect(mockReply.code).toHaveBeenCalledWith(200)
      })

      test('getPublicUser with very large user_id', async () => {
        const largeId = 999999999
        const mockRequest = {
          params: { id: String(largeId) }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: largeId,
          username: 'user',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({ user_id: largeId })
      })
    })

    describe('Boundary values for login (Zod: /^[\w-]{4,16}$/)', () => {
      test('handleUserCreated with only digits', async () => {
        const mockRequest = {
          body: { user_id: 1, login: '12345678' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(UsersServices.createUser).toHaveBeenCalledWith({ user_id: 1, login: '12345678' })
        expect(mockReply.code).toHaveBeenCalledWith(201)
      })

      test('handleUserCreated with only underscores and dashes', async () => {
        const mockRequest = {
          body: { user_id: 1, login: '____----' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(UsersServices.createUser).toHaveBeenCalledWith({ user_id: 1, login: '____----' })
      })
    })

    describe('Response structure verification', () => {
      test('getPublicUser response contains message field', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        const sentResponse = (mockReply.send as jest.Mock).mock.calls[0][0]
        expect(sentResponse).toHaveProperty('message')
        expect(typeof sentResponse.message).toBe('string')
      })

      test('handleUserCreated response contains only message field', async () => {
        const mockRequest = {
          body: { user_id: 1, login: 'test' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        const sentResponse = (mockReply.send as jest.Mock).mock.calls[0][0]
        expect(Object.keys(sentResponse)).toEqual(['message'])
      })
    })

    describe('HTTP status code verification', () => {
      test('handleUserCreated uses exactly 201 for successful creation', async () => {
        const mockRequest = {
          body: { user_id: 1, login: 'test' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(201)
        expect(mockReply.code).toHaveBeenCalledTimes(1)
      })

      test('getPublicUser uses exactly 200 for successful retrieval', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(200)
        expect(mockReply.code).toHaveBeenCalledTimes(1)
      })
    })

    describe('Fastify reply chaining', () => {
      test('handleUserCreated chains code() and send() correctly', async () => {
        const mockRequest = {
          body: { user_id: 1, login: 'test' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.createUser.mockResolvedValueOnce(undefined)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledBefore(mockReply.send as jest.Mock)
      })

      test('getPublicUser chains code() and send() correctly', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const mockProfile = {
          user_id: 1,
          username: 'user1',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledBefore(mockReply.send as jest.Mock)
      })
    })
  })

  // ==================== SECTION 4: EXCEPTIONS ====================
  describe('4. Exceptions', () => {
    describe('AppError handling', () => {
      test('correctly extracts status and message from AppError', async () => {
        const mockRequest = {
          params: { id: '999' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const customError = new AppError('Custom error message', 404)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(customError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(404)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Custom error message'
        })
      })

      test('handles AppError with status 400 correctly', async () => {
        const mockRequest = {
          body: { user_id: 42, login: 'test' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError('Bad request error', 400)
        UsersServices.createUser.mockRejectedValueOnce(appError)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Bad request error'
        })
      })
    })

    describe('Generic error handling', () => {
      test('handles unexpected errors with 500 status', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const genericError = new Error('Unexpected database error')
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(genericError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(500)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: 'Internal server error'
        })
      })

      test('does not expose internal error details in response', async () => {
        const mockRequest = {
          body: { user_id: 1, login: 'test' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const internalError = new Error('Database connection string: postgresql://...')
        UsersServices.createUser.mockRejectedValueOnce(internalError)

        await handleUserCreated(mockRequest, mockReply)

        const sentResponse = (mockReply.send as jest.Mock).mock.calls[0][0]
        expect(sentResponse.message).not.toContain('postgresql://')
        expect(sentResponse.message).toBe('Internal server error')
      })
    })

    describe('Status code mapping verification', () => {
      test('AppError 400 maps to HTTP 400', async () => {
        const mockRequest = {
          params: { id: '0' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.INVALID_USER_ID, 400)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(appError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
      })

      test('AppError 404 maps to HTTP 404', async () => {
        const mockRequest = {
          params: { id: '999' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const appError = new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
        UsersServices.getPublicUserProfile.mockRejectedValueOnce(appError)

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(404)
      })

      test('generic Error maps to HTTP 500', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.getPublicUserProfile.mockRejectedValueOnce(new Error('Boom'))

        await getPublicUser(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(500)
      })
    })

    describe('Error propagation verification', () => {
      test('service layer AppError propagates to controller', async () => {
        const mockRequest = {
          body: { user_id: 42, login: 'existing' }
        } as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        const serviceError = new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 400)
        UsersServices.createUser.mockRejectedValueOnce(serviceError)

        await handleUserCreated(mockRequest, mockReply)

        expect(mockReply.code).toHaveBeenCalledWith(400)
        expect(mockReply.send).toHaveBeenCalledWith({
          message: ERROR_MESSAGES.USER_ALREADY_EXISTS
        })
      })

      test('service layer throws and controller catches correctly', async () => {
        const mockRequest = {
          params: { id: '1' }
        } as unknown as FastifyRequest

        const mockReply = {
          code: jest.fn().mockReturnThis(),
          send: jest.fn()
        } as unknown as FastifyReply

        UsersServices.getPublicUserProfile.mockRejectedValueOnce(
          new Error('Service crashed')
        )

        await expect(async () => {
          await getPublicUser(mockRequest, mockReply)
        }).not.toThrow()

        expect(mockReply.code).toHaveBeenCalledWith(500)
      })
    })
  })
})
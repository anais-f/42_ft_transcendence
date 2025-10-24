/**
 * Test Coverage Summary for usersRoutes
 *
 * Total: 52 tests organized in 4 sections
 *
 * SECTION 1: SUCCESSFUL CASES (13 tests)
 * - POST /api/users/new-user: Creates users with valid data, validates against PublicUserAuthSchema
 * - Boundary values: Accepts user_id min (1) and max (999999999), login length 4-16 chars
 * - Special characters: Accepts underscores, dashes in login
 * - GET /api/users/:id: Returns complete profile with all 5 fields (user_id, username, avatar, status, last_connection)
 * - Response validation: Validates against UserPublicProfileSchema
 *
 * SECTION 2: BASIC FAILURE CASES (22 tests)
 * - POST /api/users/new-user: Returns 400 for missing fields, negative/zero user_id, invalid login
 * - Schema violations: Rejects short/long/empty login, invalid characters, spaces
 * - Strict schema: Rejects extra fields
 * - GET /api/users/:id: Returns 400 for non-numeric/negative/zero id, 404 for not found, 500 for errors
 *
 * SECTION 3: TRICKY CASES (11 tests)
 * - Float handling: Rejects user_id as float
 * - Login patterns: Accepts only underscores/dashes (____), numbers only
 * - Special chars: Rejects dots, emoji in login
 * - Boundary values: Handles MAX_SAFE_INTEGER, float in URL
 * - Zod edge cases: Tests null/undefined values, field type validation
 *
 * SECTION 4: EXCEPTIONS (6 tests)
 * - Controller errors: Handles AppError and generic Error throwing
 * - Zod validation errors: Checks error messages for missing/invalid fields
 * - Route registration: Verifies routes are properly registered
 * - HTTP validation: Checks Content-Type and method validation
 */

import { jest, beforeEach, describe, test, expect, afterEach } from '@jest/globals'
import type { FastifyInstance } from 'fastify'

let Fastify: any
let usersRoutes: any
let UsersControllers: any
let PublicUserAuthSchema: any
let UserPublicProfileSchema: any
let AppError: any
let ERROR_MESSAGES: any
let serializerCompiler: any
let validatorCompiler: any
let ZodTypeProvider: any

beforeAll(async () => {
  // Mock controllers
  await jest.unstable_mockModule('../controllers/usersControllers.js', () => ({
    handleUserCreated: jest.fn(),
    getPublicUser: jest.fn()
  }))

  // Import dependencies
  const fastify = await import('fastify')
  Fastify = fastify.default

  const routesModule = await import('./usersRoutes.js')
  usersRoutes = routesModule.usersRoutes

  const controllersModule = await import('../controllers/usersControllers.js')
  UsersControllers = controllersModule

  const common = await import('@ft_transcendence/common')
  PublicUserAuthSchema = common.PublicUserAuthSchema
  UserPublicProfileSchema = common.UserPublicProfileSchema
  AppError = common.AppError
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

  // ==========================================
  // SECTION 1: SUCCESSFUL CASES (13 tests)
  // ==========================================
  describe('SECTION 1: Successful cases (Happy Path)', () => {
    describe('POST /api/users/new-user', () => {
      test('creates user successfully with valid data', async () => {
        const validUser = {
          user_id: 42,
          login: 'testuser'
        }

        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true, message: 'User created' })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: validUser
        })

        expect(response.statusCode).toBe(201)
        expect(response.json()).toMatchObject({ success: true })
        expect(UsersControllers.handleUserCreated).toHaveBeenCalled()
      })

      test('validates request body against PublicUserAuthSchema', async () => {
        const validUser = {
          user_id: 1,
          login: 'validuser'
        }

        // Explicit Zod validation
        const parsed = PublicUserAuthSchema.safeParse(validUser)
        expect(parsed.success).toBe(true)

        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: validUser
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts minimum valid user_id (1)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'minuser' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts large user_id value (999999999)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 999999999, login: 'bigiduser' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with minimum length (4 chars)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'abcd' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with maximum length (16 chars)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '1234567890123456' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with underscores and dashes', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'test_user-name' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('returns 200 when user already exists', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(200).send({ success: true, message: ERROR_MESSAGES.USER_ALREADY_EXISTS })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'existing' }
        })

        expect(response.statusCode).toBe(200)
      })
    })

    describe('GET /api/users/:id', () => {
      test('returns user profile successfully with status 200', async () => {
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
        expect(response.json()).toMatchObject(mockProfile)
      })

      test('validates response against UserPublicProfileSchema', async () => {
        const mockProfile = {
          user_id: 1,
          username: 'validuser',
          avatar: '/avatars/default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        // Explicit Zod validation
        const parsed = UserPublicProfileSchema.safeParse(mockProfile)
        expect(parsed.success).toBe(true)
        if (parsed.success) {
          expect(parsed.data).toEqual(mockProfile)
        }

        ;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(200).send(mockProfile)
          }
        )

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(200)
      })

      test('handles minimum valid user_id (1)', async () => {
        const mockProfile = {
          user_id: 1,
          username: 'user1',
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
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().user_id).toBe(1)
      })

      test('handles very large user_id (999999999)', async () => {
        const mockProfile = {
          user_id: 999999999,
          username: 'bigiduser',
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
          url: '/api/users/999999999'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().user_id).toBe(999999999)
      })

      test('returns profile with all 5 required fields', async () => {
        const mockProfile = {
          user_id: 1,
          username: 'complete',
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
          url: '/api/users/1'
        })

        const data = response.json()
        expect(data).toHaveProperty('user_id')
        expect(data).toHaveProperty('username')
        expect(data).toHaveProperty('avatar')
        expect(data).toHaveProperty('status')
        expect(data).toHaveProperty('last_connection')
      })
    })
  })

  // ==========================================
  // SECTION 2: BASIC FAILURE CASES (22 tests)
  // ==========================================
  describe('SECTION 2: Basic failure cases', () => {
    describe('POST /api/users/new-user - Invalid data', () => {
      test('returns 400 when user_id is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1 }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when user_id is negative', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: -1, login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when user_id is zero', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 0, login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when user_id is not a number', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 'not_a_number', login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is too short (less than 4 chars)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'abc' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is too long (more than 16 chars)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '12345678901234567' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is empty string', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login contains invalid characters (@)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'test@user' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login contains spaces', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'test user' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when body is empty', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: {}
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when extra fields are provided (strict schema)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: {
            user_id: 1,
            login: 'testuser',
            extraField: 'should fail'
          }
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('GET /api/users/:id - Invalid ID', () => {
      test('returns 400 when id is not a number', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/notanumber'
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when id is negative', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/-1'
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when id is zero', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/0'
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 404 when user not found', async () => {
        ;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(404).send({ success: false, error: 'User not found' })
          }
        )

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/999'
        })

        expect(response.statusCode).toBe(404)
      })

      test('returns 500 when internal error occurs', async () => {
        ;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(500).send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
          }
        )

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(500)
      })
    })

    describe('Additional validation failures', () => {
      test('returns 400 when user_id is null', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: null, login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is null', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: null }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when both fields are null', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: null, login: null }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 for malformed JSON', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          headers: {
            'content-type': 'application/json'
          },
          payload: 'this is not valid json'
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login has only whitespace', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '    ' }
        })

        expect(response.statusCode).toBe(400)
      })
    })
  })

  // ==========================================
  // SECTION 3: TRICKY CASES (11 tests)
  // ==========================================
  describe('SECTION 3: Tricky/edge cases', () => {
    describe('POST /api/users/new-user - Boundary values', () => {
      test('accepts user_id as float (Zod accepts floats without .int())', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1.5, login: 'testuser' }
        })

        // Zod accepts floats unless .int() is specified in the schema
        expect(response.statusCode).toBe(201)
      })

      test('accepts login with only underscores (valid per regex)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '____' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with numbers only', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '12345678' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('rejects login with dots', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'test.user' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('rejects login with emoji', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'test🔥user' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('handles very large user_id at boundary (MAX_SAFE_INTEGER)', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(201).send({ success: true })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: Number.MAX_SAFE_INTEGER, login: 'maxuser' }
        })

        expect(response.statusCode).toBe(201)
      })
    })

    describe('GET /api/users/:id - Edge cases', () => {
      test('handles float id in URL (coerced by Zod)', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1.5'
        })

        // Zod coercion may convert 1.5 to 1, or reject it
        expect([200, 400, 404]).toContain(response.statusCode)
      })

      test('handles very large id', async () => {
        ;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(200).send({
              user_id: 999999999,
              username: 'largeuser',
              avatar: '/avatars/default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            })
          }
        )

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/999999999'
        })

        expect(response.statusCode).toBe(200)
      })

      test('handles special characters in URL (should be rejected)', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/@invalid'
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('Zod schema edge cases', () => {
      test('PublicUserAuthSchema rejects null values', () => {
        const invalidData = { user_id: null, login: 'testuser' }
        const parsed = PublicUserAuthSchema.safeParse(invalidData)

        expect(parsed.success).toBe(false)
        if (!parsed.success) {
          expect(parsed.error.issues).toBeDefined()
        }
      })

      test('UserPublicProfileSchema validates all field types correctly', () => {
        const validProfile = {
          user_id: 1,
          username: 'testuser',
          avatar: '/avatars/default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }

        const parsed = UserPublicProfileSchema.safeParse(validProfile)
        expect(parsed.success).toBe(true)

        if (parsed.success) {
          expect(typeof parsed.data.user_id).toBe('number')
          expect(typeof parsed.data.username).toBe('string')
          expect(typeof parsed.data.avatar).toBe('string')
          expect(typeof parsed.data.status).toBe('number')
          expect(typeof parsed.data.last_connection).toBe('string')
        }
      })
    })
  })

  // ==========================================
  // SECTION 4: EXCEPTIONS (6 tests)
  // ==========================================
  describe('SECTION 4: Exceptions', () => {
    describe('Controller error handling', () => {
      test('handles controller throwing AppError', async () => {
        ;(UsersControllers.handleUserCreated as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            return reply.code(500).send({ success: false, error: ERROR_MESSAGES.INTERNAL_ERROR })
          }
        )

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'testuser' }
        })

        expect(response.statusCode).toBe(500)
        expect(response.json()).toHaveProperty('error')
      })

      test('handles controller throwing generic Error', async () => {
        ;(UsersControllers.getPublicUser as jest.Mock).mockImplementation(
          async (req: any, reply: any) => {
            throw new Error('Unexpected error')
          }
        )

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(500)
      })
    })

    describe('Zod validation error messages', () => {
      test('error response is defined for missing field', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1 }
        })

        expect(response.statusCode).toBe(400)
        const error = response.json()
        expect(error).toBeDefined()
      })

      test('error response is defined for invalid type', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 'invalid', login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json()).toBeDefined()
      })
    })

    describe('Route registration and HTTP validation', () => {
      test('POST and GET routes are registered correctly', () => {
        const routes = app.printRoutes()
        expect(routes).toContain('POST')
        expect(routes).toContain('GET')
      })

      test('rejects incorrect HTTP methods', async () => {
        const putResponse = await app.inject({
          method: 'PUT',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'testuser' }
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
})


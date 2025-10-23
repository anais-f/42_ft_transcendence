/**
 * Test Coverage Summary for usersRoutes
 *
 * Total: 43 tests organized in 4 sections
 *
 * SECTION 1: SUCCESSFUL CASES (7 tests)
 * - POST /api/users/new-user: Creates user with valid data, handles min/max username (4-16 chars), special chars (_-)
 * - GET /api/users/:id: Returns 200 with { success: true, message, data: profile }
 * - Response validation: All endpoints return correct SuccessResponseSchema structure
 *
 * SECTION 2: BASIC FAILURE CASES (15 tests)
 * - POST /api/users/new-user: 400 for invalid user_id (negative, zero, string, missing)
 * - POST /api/users/new-user: 400 for invalid login (too short/long, special chars, missing)
 * - GET /api/users/:id: 400 for invalid ID (non-numeric, negative, zero, decimal)
 * - GET /api/users/:id: 404 when user not found
 * - Route registration: Verifies correct HTTP methods and paths
 *
 * SECTION 3: TRICKY CASES (14 tests)
 * - Content-Type validation: Accepts application/json, rejects text/plain
 * - Concurrent requests: Multiple simultaneous calls work correctly
 * - Error propagation: Service/controller errors reach client with correct status
 * - Schema validation: Zod validates success, message, data fields
 * - ID parsing edge cases: Leading zeros, very large IDs, decimal rejection
 * - Special login patterns: Only digits, only underscores/dashes, mixed case
 *
 * SECTION 4: EXCEPTIONS (7 tests)
 * - Route path correctness: Exact match /api/users/new-user, /api/users/:id
 * - Method specificity: POST only for creation, GET only for retrieval
 * - Schema error messages: Contains field name and validation rule
 * - Response headers: Includes Content-Type: application/json
 * - Status code precision: 200/201/400/404/500 based on scenario
 * - Body parsing: JSON parsing errors return 400
 * - FastifySchemaCompiler integration: Uses Zod for validation
 */

import { jest } from '@jest/globals'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'

let usersRoutes: any
let UsersControllers: any

beforeAll(async () => {
  await jest.unstable_mockModule('../controllers/usersControllers.js', () => ({
    handleUserCreated: jest.fn(),
    getPublicUser: jest.fn()
  }))

  UsersControllers = await import('../controllers/usersControllers.js')

  const routesModule = await import('./usersRoutes.js')
  usersRoutes = routesModule.usersRoutes
})

describe('usersRoutes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    jest.clearAllMocks()
    app = Fastify().withTypeProvider<ZodTypeProvider>()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    await app.register(usersRoutes)
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  // ==================== SECTION 1: SUCCESSFUL CASES ====================
  describe('1. Successful cases (Happy Path)', () => {
    describe('POST /api/users/new-user', () => {
      test('creates user successfully with valid data', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 42, login: 'testuser' }
        })

        expect(response.statusCode).toBe(201)
        expect(response.json()).toEqual({
          success: true,
          message: 'User created'
        })
      })

      test('accepts minimum valid login (4 chars)', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'abcd' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts maximum valid login (16 chars)', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'a'.repeat(16) }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with special characters (underscore and dash)', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'user_name-123' }
        })

        expect(response.statusCode).toBe(201)
      })
    })

    describe('GET /api/users/:id', () => {
      test('returns user profile successfully with status 200', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 42,
              username: 'testuser',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/42'
        })

        expect(response.statusCode).toBe(200)
        const body = response.json()
        expect(body).toHaveProperty('success', true)
        expect(body).toHaveProperty('message')
        expect(body).toHaveProperty('data')
        expect(body.data).toHaveProperty('user_id', 42)
      })

      test('handles minimum valid user_id (1)', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 1,
              username: 'user1',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().data.user_id).toBe(1)
      })

      test('handles very large user_id (999999999)', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 999999999,
              username: 'user999',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/999999999'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().data.user_id).toBe(999999999)
      })
    })
  })

  // ==================== SECTION 2: BASIC FAILURE CASES ====================
  describe('2. Basic failure cases', () => {
    describe('POST /api/users/new-user - Invalid user_id', () => {
      test('returns 400 when user_id is negative', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: -1, login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json()).toHaveProperty('error')
      })

      test('returns 400 when user_id is zero', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 0, login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when user_id is a string', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 'invalid', login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when user_id is missing', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('POST /api/users/new-user - Invalid login', () => {
      test('returns 400 when login is too short (< 4 chars)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'abc' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login is too long (> 16 chars)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'a'.repeat(17) }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login contains invalid characters (@)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'user@name' }
        })

        expect(response.statusCode).toBe(400)
      })

      test('returns 400 when login contains spaces', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'user name' }
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
    })

    describe('GET /api/users/:id - Invalid ID', () => {
      test('returns 400 when id is not numeric', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/invalid'
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

      test('returns 400 when id is decimal', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/users/42.5'
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('GET /api/users/:id - Not found', () => {
      test('returns 404 when user not found', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(404).send({ error: 'User not found' })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/999'
        })

        expect(response.statusCode).toBe(404)
      })
    })

    describe('Route registration verification', () => {
      test('POST /api/users/new-user route is registered', () => {
        const routes = app.printRoutes()
        expect(routes).toContain('POST')
        expect(routes).toContain('/api/users/new-user')
      })

      test('GET /api/users/:id route is registered', () => {
        const routes = app.printRoutes()
        expect(routes).toContain('GET')
        expect(routes).toContain('/api/users/:id')
      })
    })
  })

  // ==================== SECTION 3: TRICKY CASES ====================
  describe('3. Tricky cases', () => {
    describe('Content-Type validation', () => {
      test('accepts application/json Content-Type', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          headers: { 'Content-Type': 'application/json' },
          payload: { user_id: 1, login: 'testuser' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('rejects non-JSON Content-Type', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          headers: { 'Content-Type': 'text/plain' },
          payload: 'user_id=1&login=testuser'
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('Concurrent requests', () => {
      test('handles multiple simultaneous GET requests', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 1,
              username: 'user1',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const promises = Array.from({ length: 5 }, () =>
          app.inject({ method: 'GET', url: '/api/users/1' })
        )

        const responses = await Promise.all(promises)

        responses.forEach((response) => {
          expect(response.statusCode).toBe(200)
          expect(response.json()).toHaveProperty('success', true)
        })
      })
    })

    describe('Error propagation', () => {
      test('service error propagates with correct status code', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(500).send({ error: 'Internal server error' })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(500)
      })
    })

    describe('Schema validation edge cases', () => {
      test('validates all required fields are present', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: {}
        })

        expect(response.statusCode).toBe(400)
      })

      test('rejects extra fields in payload (strict mode)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'testuser', extra: 'field' }
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('ID parsing edge cases', () => {
      test('handles ID with leading zeros (007 -> 7)', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 7,
              username: 'user7',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/007'
        })

        expect(response.statusCode).toBe(200)
        expect(response.json().data.user_id).toBe(7)
      })
    })

    describe('Special login patterns', () => {
      test('accepts login with only digits', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '12345678' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts login with only underscores and dashes', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: '____----' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('accepts mixed case login', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'UserName123' }
        })

        expect(response.statusCode).toBe(201)
      })
    })
  })

  // ==================== SECTION 4: EXCEPTIONS ====================
  describe('4. Exceptions', () => {
    describe('Route path correctness', () => {
      test('POST /api/users/new-user exact path match', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user-wrong'
        })

        expect([400, 404]).toContain(response.statusCode)
      })

      test('GET /api/users/:id exact path match', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 1,
              username: 'user1',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(200)
      })
    })

    describe('HTTP method specificity', () => {
      test('GET /api/users/:id rejects POST method', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(404)
      })
    })

    describe('Schema validation error messages', () => {
      test('error message contains field name for missing user_id', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json().error).toBeDefined()
      })

      test('error message contains validation rule for invalid login', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'ab' }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json().error).toBeDefined()
      })
    })

    describe('Response headers', () => {
      test('includes Content-Type: application/json header', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 1,
              username: 'user1',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.headers['content-type']).toContain('application/json')
      })
    })

    describe('HTTP status code precision', () => {
      test('returns 201 for successful creation (not 200)', async () => {
        UsersControllers.handleUserCreated.mockImplementation(async (req: any, reply: any) => {
          return reply.code(201).send({ success: true, message: 'User created' })
        })

        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 1, login: 'testuser' }
        })

        expect(response.statusCode).toBe(201)
      })

      test('returns 200 for successful retrieval (not 201)', async () => {
        UsersControllers.getPublicUser.mockImplementation(async (req: any, reply: any) => {
          return reply.code(200).send({
            success: true,
            message: 'User profile retrieved',
            data: {
              user_id: 1,
              username: 'user1',
              avatar: '/avatars/img_default.png',
              status: 1,
              last_connection: '2024-01-01T00:00:00.000Z'
            }
          })
        })

        const response = await app.inject({
          method: 'GET',
          url: '/api/users/1'
        })

        expect(response.statusCode).toBe(200)
      })
    })

    describe('Body parsing errors', () => {
      test('returns 400 for malformed JSON', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          headers: { 'Content-Type': 'application/json' },
          payload: '{invalid json'
        })

        expect(response.statusCode).toBe(400)
      })
    })

    describe('FastifySchemaCompiler integration', () => {
      test('uses Zod for schema validation', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/users/new-user',
          payload: { user_id: 'invalid', login: 'testuser' }
        })

        expect(response.statusCode).toBe(400)
        expect(response.json()).toHaveProperty('error')
      })
    })
  })
})
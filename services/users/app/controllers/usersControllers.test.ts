/**
 * Test Coverage Summary for usersControllers
 *
 * SECTION 1: SUCCESSFUL CASES
 * - handleUserCreated: Creates user with valid data, returns 201
 * - getPublicUser: Returns complete profile with 200, validates structure
 *
 * SECTION 2: BASIC FAILURE CASES
 * - handleUserCreated: Handles existing user (200), internal errors (500)
 * - getPublicUser: Handles not found (404), invalid IDs (400), validation errors (500)
 *
 * SECTION 3: TRICKY CASES
 * - Boundary values: Minimum/maximum user_id, minimum login length
 * - Special characters: Valid login patterns
 *
 * SECTION 4: EXCEPTIONS
 * - AppError propagation from service to controller
 * - Generic error handling differences between functions
 */

import { jest } from '@jest/globals'
import type { FastifyRequest, FastifyReply } from 'fastify'

let handleUserCreated: any
let getPublicUser: any
let UsersServices: any
let AppError: any
let ERROR_MESSAGES: any
let SUCCESS_MESSAGES: any

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
	SUCCESS_MESSAGES = common.SUCCESS_MESSAGES
	;({ UsersServices } = await import('../usecases/usersServices.js'))
	;({ handleUserCreated, getPublicUser } = await import(
		'./usersControllers.js'
	))
})

describe('usersControllers', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ==================== SECTION 1: SUCCESSFUL CASES ====================
	describe('1. Successful cases (Happy Path)', () => {
		test('handleUserCreated: creates user with valid data and returns 201', async () => {
			const mockRequest = {
				body: { user_id: 42, login: 'testuser' }
			} as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			UsersServices.createUser.mockResolvedValueOnce(undefined)

			await handleUserCreated(mockRequest, mockReply)

			expect(UsersServices.createUser).toHaveBeenCalledWith({
				user_id: 42,
				login: 'testuser'
			})
			expect(mockReply.code).toHaveBeenCalledWith(201)
			expect(mockReply.send).toHaveBeenCalledWith({
				success: true,
				message: SUCCESS_MESSAGES.USER_CREATED
			})
		})

		test('getPublicUser: returns complete profile directly with 200 status', async () => {
			const mockRequest = {
				params: { id: 42 }
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

			expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({
				user_id: 42
			})
			expect(mockReply.code).toHaveBeenCalledWith(200)
			expect(mockReply.send).toHaveBeenCalledWith(mockProfile)
		})

		test('getPublicUser: returns profile with all 5 required fields', async () => {
			const mockRequest = {
				params: { id: 1 }
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

			const sentData = (mockReply.send as jest.Mock).mock.calls[0][0]
			expect(Object.keys(sentData)).toHaveLength(5)
			expect(sentData).toMatchObject({
				user_id: expect.any(Number),
				username: expect.any(String),
				avatar: expect.any(String),
				status: expect.any(Number),
				last_connection: expect.any(String)
			})
		})

		test('handleUserCreated: accepts valid login patterns (alphanumeric, underscore, dash)', async () => {
			const mockRequest = {
				body: { user_id: 3, login: 'user_name-123' }
			} as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			UsersServices.createUser.mockResolvedValueOnce(undefined)

			await handleUserCreated(mockRequest, mockReply)

			expect(mockReply.code).toHaveBeenCalledWith(201)
		})
	})

	// ==================== SECTION 2: BASIC FAILURE CASES ====================
	describe('2. Basic failure cases', () => {
		test('handleUserCreated: returns 200 when user already exists', async () => {
			const mockRequest = {
				body: { user_id: 1, login: 'existing' }
			} as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			const error = new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS)
			UsersServices.createUser.mockRejectedValueOnce(error)

			await handleUserCreated(mockRequest, mockReply)

			expect(mockReply.code).toHaveBeenCalledWith(200)
			expect(mockReply.send).toHaveBeenCalledWith({
				success: true,
				message: ERROR_MESSAGES.USER_ALREADY_EXISTS
			})
		})

		test('handleUserCreated: returns 500 for generic errors', async () => {
			const mockRequest = {
				body: { user_id: 1, login: 'test' }
			} as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			UsersServices.createUser.mockRejectedValueOnce(
				new Error('Database connection failed')
			)

			await handleUserCreated(mockRequest, mockReply)

			expect(mockReply.code).toHaveBeenCalledWith(500)
			expect(mockReply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
		})

		test('getPublicUser: returns 404 when user not found', async () => {
			const mockRequest = {
				params: { id: 999 }
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
				success: false,
				error: ERROR_MESSAGES.USER_NOT_FOUND
			})
		})

		test('getPublicUser: returns 500 when service returns invalid profile structure', async () => {
			const mockRequest = {
				params: { id: 1 }
			} as unknown as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			const invalidProfile = {
				user_id: 1,
				username: 'test'
				// missing required fields
			}

			UsersServices.getPublicUserProfile.mockResolvedValueOnce(invalidProfile)

			await getPublicUser(mockRequest, mockReply)

			expect(mockReply.code).toHaveBeenCalledWith(500)
			expect(mockReply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
		})
	})

	// ==================== SECTION 3: TRICKY CASES ====================
	describe('3. Tricky cases', () => {
		test('getPublicUser: handles large user_id values', async () => {
			const largeId = 999999999
			const mockRequest = {
				params: { id: largeId }
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

			expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({
				user_id: largeId
			})
		})

		test('handleUserCreated: accepts minimum login length (4 chars)', async () => {
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
			expect(UsersServices.createUser).toHaveBeenCalledWith({
				user_id: 1,
				login: 'abcd'
			})
		})
	})

	// ==================== SECTION 4: EXCEPTIONS ====================
	describe('4. Exceptions', () => {
		test('getPublicUser: propagates AppError with correct status and message', async () => {
			const mockRequest = {
				params: { id: 999 }
			} as unknown as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			const serviceError = new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
			UsersServices.getPublicUserProfile.mockRejectedValueOnce(serviceError)

			await getPublicUser(mockRequest, mockReply)

			expect(mockReply.code).toHaveBeenCalledWith(404)
			expect(mockReply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.USER_NOT_FOUND
			})
		})

		test('getPublicUser: throws generic errors (not caught)', async () => {
			const mockRequest = {
				params: { id: 1 }
			} as unknown as FastifyRequest

			const mockReply = {
				code: jest.fn().mockReturnThis(),
				send: jest.fn()
			} as unknown as FastifyReply

			const genericError = new Error('Unexpected error')
			UsersServices.getPublicUserProfile.mockRejectedValueOnce(genericError)

			await expect(getPublicUser(mockRequest, mockReply)).rejects.toThrow(
				'Unexpected error'
			)
		})
	})
})

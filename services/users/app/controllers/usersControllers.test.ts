/**
 * @file usersControllers.test.ts
 * @description Tests for Users Controllers
 *
 * Test Suite Summary:
 * 1. handleUserCreated - Create new user (API Key protected)
 * 2. getPublicUser - Get public user profile (JWT protected)
 * 3. getPrivateUser - Get private user profile (JWT protected - own profile)
 */

import { jest } from '@jest/globals'
import type { FastifyRequest, FastifyReply } from 'fastify'

let handleUserCreated: any
let getPublicUser: any
let getPrivateUser: any
let UsersServices: any
let ERROR_MESSAGES: any
let SUCCESS_MESSAGES: any

beforeAll(async () => {
	await jest.unstable_mockModule('../usecases/usersServices.js', () => ({
		UsersServices: {
			createUser: jest.fn(),
			getPublicUserProfile: jest.fn(),
			getPrivateUserProfile: jest.fn()
		}
	}))

	const common = await import('@ft_transcendence/common')
	ERROR_MESSAGES = common.ERROR_MESSAGES
	SUCCESS_MESSAGES = common.SUCCESS_MESSAGES
	;({ UsersServices } = await import('../usecases/usersServices.js'))
	;({ handleUserCreated, getPublicUser, getPrivateUser } = await import(
		'./usersControllers.js'
	))
})

const createMockRequest = (
	body?: any,
	params?: any,
	user?: any
): FastifyRequest =>
	({
		body,
		params,
		user,
		headers: {}
	}) as any

const createMockReply = (): FastifyReply => {
	const reply: any = {
		code: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis()
	}
	return reply
}

describe('Users Controllers', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ===========================================
	// 1. HANDLE USER CREATED - SUCCESS
	// ===========================================
	describe('handleUserCreated - Success', () => {
		it('should create new user and return 201', async () => {
			const mockUser = { user_id: 1, login: 'testuser' }
			const req = createMockRequest(mockUser)
			const reply = createMockReply()

			UsersServices.createUser.mockResolvedValueOnce(undefined)

			await handleUserCreated(req, reply)

			expect(UsersServices.createUser).toHaveBeenCalledWith(mockUser)
			expect(reply.code).toHaveBeenCalledWith(201)
			expect(reply.send).toHaveBeenCalledWith({
				success: true,
				message: SUCCESS_MESSAGES.USER_CREATED
			})
		})

		it('should return 200 if user already exists', async () => {
			const mockUser = { user_id: 1, login: 'existinguser' }
			const req = createMockRequest(mockUser)
			const reply = createMockReply()

			UsersServices.createUser.mockRejectedValueOnce(
				new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS)
			)

			await handleUserCreated(req, reply)

			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith({
				success: true,
				message: ERROR_MESSAGES.USER_ALREADY_EXISTS
			})
		})
	})

	// ===========================================
	// 1. HANDLE USER CREATED - ERRORS
	// ===========================================
	describe('handleUserCreated - Errors', () => {
		it('should return 500 for unexpected errors', async () => {
			const mockUser = { user_id: 1, login: 'testuser' }
			const req = createMockRequest(mockUser)
			const reply = createMockReply()

			UsersServices.createUser.mockRejectedValueOnce(
				new Error('Database connection failed')
			)

			await handleUserCreated(req, reply)

			expect(reply.code).toHaveBeenCalledWith(500)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
		})
	})

	// ===========================================
	// 2. GET PUBLIC USER - SUCCESS
	// ===========================================
	describe('getPublicUser - Success', () => {
		it('should return public user profile with valid params', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			const req = createMockRequest(null, { id: 1 })
			const reply = createMockReply()

			UsersServices.getPublicUserProfile.mockResolvedValueOnce(mockProfile)

			await getPublicUser(req, reply)

			expect(UsersServices.getPublicUserProfile).toHaveBeenCalledWith({
				user_id: 1
			})
			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith(mockProfile)
		})
	})

	// ===========================================
	// 2. GET PUBLIC USER - ERRORS
	// ===========================================
	describe('getPublicUser - Errors', () => {
		it('should return 404 for non-existent user', async () => {
			const req = createMockRequest(null, { id: 999 })
			const reply = createMockReply()

			const AppError = (await import('@ft_transcendence/common')).AppError
			UsersServices.getPublicUserProfile.mockRejectedValueOnce(
				new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
			)

			await getPublicUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(404)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.USER_NOT_FOUND
			})
		})

		it('should return 500 for validation errors', async () => {
			const req = createMockRequest(null, { id: 1 })
			const reply = createMockReply()

			UsersServices.getPublicUserProfile.mockResolvedValueOnce({
				invalid: 'data'
			})

			await getPublicUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(500)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INTERNAL_ERROR
			})
		})
	})

	// ===========================================
	// 3. GET PRIVATE USER - SUCCESS
	// ===========================================
	describe('getPrivateUser - Success', () => {
		it('should return private profile for authenticated user', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			const req = createMockRequest(null, null, { user_id: 1 })
			const reply = createMockReply()

			UsersServices.getPrivateUserProfile.mockResolvedValueOnce(mockProfile)

			await getPrivateUser(req, reply)

			expect(UsersServices.getPrivateUserProfile).toHaveBeenCalledWith({
				user_id: 1
			})
			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith(mockProfile)
		})
	})

	// ===========================================
	// 3. GET PRIVATE USER - ERRORS
	// ===========================================
	describe('getPrivateUser - Errors', () => {
		it('should return 400 for invalid user_id (0)', async () => {
			const req = createMockRequest(null, null, { user_id: 0 })
			const reply = createMockReply()

			await getPrivateUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
			expect(reply.send).toHaveBeenCalledWith({
				success: false,
				error: ERROR_MESSAGES.INVALID_USER_ID
			})
		})

		it('should return 400 for missing user_id', async () => {
			const req = createMockRequest(null, null, {})
			const reply = createMockReply()

			await getPrivateUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
		})

		it('should return 404 when user not found', async () => {
			const req = createMockRequest(null, null, { user_id: 999 })
			const reply = createMockReply()

			const AppError = (await import('@ft_transcendence/common')).AppError
			UsersServices.getPrivateUserProfile.mockRejectedValueOnce(
				new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404)
			)

			await getPrivateUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(404)
		})
	})
})

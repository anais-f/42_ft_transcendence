/**
 * @file usersControllers.test.ts
 * @description Tests for Users Controllers
 *
 * Test Suite Summary:
 * 1. handleUserCreated - Create new user
 * 2. getPublicUser - Get public user profile (JWT protected)
 * 3. getPrivateUser - Get private user profile (JWT protected - own profile)
 * 4. searchUserByUsernameController - Search user by username (JWT protected)
 */

import { jest } from '@jest/globals'
import type { FastifyRequest, FastifyReply } from 'fastify'

let handleUserCreated: any
let getPublicUser: any
let getPrivateUser: any
let searchUserByUsernameController: any
let UsersServices: any
let ERROR_MESSAGES: any
let SUCCESS_MESSAGES: any

beforeAll(async () => {
	await jest.unstable_mockModule('../usecases/usersServices.js', () => ({
		UsersServices: {
			createUser: jest.fn(),
			getPublicUserProfile: jest.fn(),
			getPrivateUserProfile: jest.fn(),
			searchUserByExactUsername: jest.fn()
		}
	}))

	const common = await import('@ft_transcendence/common')
	ERROR_MESSAGES = common.ERROR_MESSAGES
	SUCCESS_MESSAGES = common.SUCCESS_MESSAGES
	;({ UsersServices } = await import('../usecases/usersServices.js'))
	;({
		handleUserCreated,
		getPublicUser,
		getPrivateUser,
		searchUserByUsernameController
	} = await import('./usersControllers.js'))
})

const createMockRequest = (
	body?: any,
	params?: any,
	user?: any,
	query?: any
): FastifyRequest =>
	({
		body,
		params,
		user,
		query,
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
	// 1. HANDLE USER CREATED
	// ===========================================
	describe('handleUserCreated', () => {
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
		})

		it('should return 500 for unexpected errors', async () => {
			const mockUser = { user_id: 1, login: 'testuser' }
			const req = createMockRequest(mockUser)
			const reply = createMockReply()

			UsersServices.createUser.mockRejectedValueOnce(
				new Error('Database connection failed')
			)

			await handleUserCreated(req, reply)

			expect(reply.code).toHaveBeenCalledWith(500)
		})
	})

	// ===========================================
	// 2. GET PUBLIC USER
	// ===========================================
	describe('getPublicUser', () => {
		it('should return public user profile with valid params', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				status: 1,
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			const req = createMockRequest(null, { user_id: 1 })
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
	// 3. GET PRIVATE USER
	// ===========================================
	describe('getPrivateUser', () => {
		it('should return private profile for authenticated user', async () => {
			const mockProfile = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				status: 1,
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

		it('should return 400 for invalid user_id', async () => {
			const req = createMockRequest(null, null, { user_id: 0 })
			const reply = createMockReply()

			await getPrivateUser(req, reply)

			expect(reply.code).toHaveBeenCalledWith(400)
		})
	})

	// ===========================================
	// 4. SEARCH USER BY USERNAME
	// ===========================================
	describe('searchUserByUsernameController', () => {
		it('should return search result', async () => {
			const mockResult = {
				success: true,
				users: [
					{
						user_id: 1,
						username: 'testuser',
						avatar: '/avatars/img_default.png',
						status: 1,
						last_connection: '2025-01-01T00:00:00.000Z'
					}
				]
			}
			const req = createMockRequest(
				null,
				null,
				{ user_id: 1 },
				{ username: 'testuser' }
			)
			const reply = createMockReply()

			UsersServices.searchUserByExactUsername.mockResolvedValueOnce(mockResult)

			await searchUserByUsernameController(req, reply)

			expect(UsersServices.searchUserByExactUsername).toHaveBeenCalledWith(
				'testuser'
			)
			expect(reply.code).toHaveBeenCalledWith(200)
			expect(reply.send).toHaveBeenCalledWith(mockResult)
		})
	})
})

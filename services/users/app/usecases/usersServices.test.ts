/**
 * @file usersServices.test.ts
 * @description Tests for Users Services
 *
 * Test Suite Summary:
 * 1. createUser - Create new user
 * 2. getPublicUserProfile - Get public user profile
 * 3. getPrivateUserProfile - Get private user profile
 * 4. syncAllUsersFromAuth - Sync users from Auth service
 */

import { jest } from '@jest/globals'
import type { PublicUserAuthDTO } from '@ft_transcendence/common'

let UsersServices: any
let UsersRepository: any
let AuthApi: any
let AppError: any
let ERROR_MESSAGES: any

beforeAll(async () => {
	await jest.unstable_mockModule('../repositories/usersRepository.js', () => ({
		UsersRepository: {
			existsById: jest.fn(),
			insertUser: jest.fn(),
			getUserById: jest.fn()
		}
	}))

	await jest.unstable_mockModule('./AuthApi.js', () => ({
		AuthApi: {
			getAllUsers: jest.fn()
		}
	}))

	const common = await import('@ft_transcendence/common')
	AppError = common.AppError
	ERROR_MESSAGES = common.ERROR_MESSAGES
	;({ UsersRepository } = await import('../repositories/usersRepository.js'))
	;({ AuthApi } = await import('./AuthApi.js'))
	;({ UsersServices } = await import('./usersServices.js'))
})

describe('UsersServices', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ===========================================
	// 1. CREATE USER - SUCCESS
	// ===========================================
	describe('createUser - Success', () => {
		it('should create user successfully when user does not exist', async () => {
			UsersRepository.existsById.mockReturnValueOnce(false)
			UsersRepository.insertUser.mockResolvedValueOnce(undefined)

			const newUser: PublicUserAuthDTO = { user_id: 42, login: 'testuser' }
			await UsersServices.createUser(newUser)

			expect(UsersRepository.existsById).toHaveBeenCalledWith({ user_id: 42 })
			expect(UsersRepository.insertUser).toHaveBeenCalledWith({
				user_id: 42,
				login: 'testuser'
			})
		})
	})

	// ===========================================
	// 1. CREATE USER - ERRORS
	// ===========================================
	describe('createUser - Errors', () => {
		it('should throw 400 error when user already exists', async () => {
			UsersRepository.existsById.mockReturnValueOnce(true)

			const existingUser = { user_id: 42, login: 'existing' }

			// Call createUser once and capture the error
			await expect(UsersServices.createUser(existingUser)).rejects.toThrow(
				ERROR_MESSAGES.USER_ALREADY_EXISTS
			)

			expect(UsersRepository.insertUser).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// 2. GET PUBLIC USER PROFILE - SUCCESS
	// ===========================================
	describe('getPublicUserProfile - Success', () => {
		it('should return complete user profile', async () => {
			const mockProfile = {
				user_id: 42,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				last_connection: '2024-01-01T00:00:00.000Z'
			}
			UsersRepository.getUserById.mockReturnValueOnce(mockProfile)

			const result = await UsersServices.getPublicUserProfile({ user_id: 42 })

			expect(result).toHaveProperty('user_id', 42)
			expect(result).toHaveProperty('username', 'testuser')
			expect(result).toHaveProperty('avatar')
			expect(result).toHaveProperty('last_connection')
			expect(result).toHaveProperty('status')
		})
	})

	// ===========================================
	// 2. GET PUBLIC USER PROFILE - ERRORS
	// ===========================================
	describe('getPublicUserProfile - Errors', () => {
		it('should throw 404 when user not found', async () => {
			UsersRepository.getUserById.mockReturnValueOnce(undefined)

			await expect(
				UsersServices.getPublicUserProfile({ user_id: 999 })
			).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
		})

		it('should throw 400 for invalid user_id (0)', async () => {
			await expect(
				UsersServices.getPublicUserProfile({ user_id: 0 })
			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
		})

		it('should throw 400 for invalid user_id (negative)', async () => {
			await expect(
				UsersServices.getPublicUserProfile({ user_id: -1 })
			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
		})

		it('should throw 400 for undefined user_id', async () => {
			await expect(
				UsersServices.getPublicUserProfile({ user_id: undefined })
			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
		})
	})

	// ===========================================
	// 3. GET PRIVATE USER PROFILE - SUCCESS
	// ===========================================
	describe('getPrivateUserProfile - Success', () => {
		it('should return private profile with all fields', async () => {
			const mockProfile = {
				user_id: 42,
				username: 'testuser',
				avatar: '/avatars/img_default.png',
				last_connection: '2024-01-01T00:00:00.000Z'
			}
			UsersRepository.getUserById.mockReturnValueOnce(mockProfile)

			const result = await UsersServices.getPrivateUserProfile({ user_id: 42 })

			expect(result).toHaveProperty('user_id', 42)
			expect(result).toHaveProperty('username', 'testuser')
			expect(result).toHaveProperty('avatar')
			expect(result).toHaveProperty('last_connection')
		})
	})

	// ===========================================
	// 3. GET PRIVATE USER PROFILE - ERRORS
	// ===========================================
	describe('getPrivateUserProfile - Errors', () => {
		it('should throw 404 when user not found', async () => {
			UsersRepository.getUserById.mockReturnValueOnce(undefined)

			await expect(
				UsersServices.getPrivateUserProfile({ user_id: 999 })
			).rejects.toThrow(ERROR_MESSAGES.USER_NOT_FOUND)
		})

		it('should throw 400 for invalid user_id', async () => {
			await expect(
				UsersServices.getPrivateUserProfile({ user_id: 0 })
			).rejects.toThrow(ERROR_MESSAGES.INVALID_USER_ID)
		})
	})

	// ===========================================
	// 4. SYNC ALL USERS FROM AUTH - SUCCESS
	// ===========================================
	describe('syncAllUsersFromAuth - Success', () => {
		it('should sync all new users from auth service', async () => {
			const authUsers = [
				{ user_id: 1, login: 'user1' },
				{ user_id: 2, login: 'user2' },
				{ user_id: 3, login: 'user3' }
			]
			AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
			UsersRepository.existsById.mockReturnValue(false)
			UsersRepository.insertUser.mockResolvedValue(undefined)

			await UsersServices.syncAllUsersFromAuth()

			expect(AuthApi.getAllUsers).toHaveBeenCalledTimes(1)
			expect(UsersRepository.insertUser).toHaveBeenCalledTimes(3)
		})

		it('should skip existing users and sync only new ones', async () => {
			const authUsers = [
				{ user_id: 1, login: 'existing1' },
				{ user_id: 2, login: 'new1' },
				{ user_id: 3, login: 'existing2' },
				{ user_id: 4, login: 'new2' }
			]
			AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
			UsersRepository.existsById
				.mockReturnValueOnce(true) // user 1 exists
				.mockReturnValueOnce(false) // user 2 new
				.mockReturnValueOnce(true) // user 3 exists
				.mockReturnValueOnce(false) // user 4 new
			UsersRepository.insertUser.mockResolvedValue(undefined)

			await UsersServices.syncAllUsersFromAuth()

			expect(UsersRepository.insertUser).toHaveBeenCalledTimes(2)
			expect(UsersRepository.insertUser).toHaveBeenCalledWith({
				user_id: 2,
				login: 'new1'
			})
			expect(UsersRepository.insertUser).toHaveBeenCalledWith({
				user_id: 4,
				login: 'new2'
			})
		})

		it('should do nothing when all users already exist', async () => {
			const authUsers = [
				{ user_id: 1, login: 'user1' },
				{ user_id: 2, login: 'user2' }
			]
			AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
			UsersRepository.existsById.mockReturnValue(true)

			await UsersServices.syncAllUsersFromAuth()

			expect(UsersRepository.insertUser).not.toHaveBeenCalled()
		})

		it('should handle empty auth users list', async () => {
			AuthApi.getAllUsers.mockResolvedValueOnce([])

			await UsersServices.syncAllUsersFromAuth()

			expect(UsersRepository.insertUser).not.toHaveBeenCalled()
		})
	})

	// ===========================================
	// 4. SYNC ALL USERS FROM AUTH - ERRORS
	// ===========================================
	describe('syncAllUsersFromAuth - Errors', () => {
		it('should propagate error when auth service fails', async () => {
			AuthApi.getAllUsers.mockRejectedValueOnce(
				new Error('Auth service unavailable')
			)

			await expect(UsersServices.syncAllUsersFromAuth()).rejects.toThrow(
				'Auth service unavailable'
			)

			expect(UsersRepository.insertUser).not.toHaveBeenCalled()
		})

		it('should propagate error when repository insert fails', async () => {
			const authUsers = [{ user_id: 1, login: 'user1' }]
			AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
			UsersRepository.existsById.mockReturnValueOnce(false)
			UsersRepository.insertUser.mockRejectedValueOnce(
				new Error('Database error')
			)

			await expect(UsersServices.syncAllUsersFromAuth()).rejects.toThrow(
				'Database error'
			)
		})
	})
})

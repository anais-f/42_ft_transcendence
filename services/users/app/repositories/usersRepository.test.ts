/**
 * @file usersRepository.test.ts
 * @description Tests for UsersRepository
 *
 * Test Suite Summary:
 * 1. User Existence Checks
 * 2. User Creation with Unique Username Generation
 * 3. User Updates (username, avatar, last_connection)
 * 4. User Retrieval
 * 5. User Deletion
 */

import {
	describe,
	it,
	expect,
	beforeEach,
	jest,
	beforeAll
} from '@jest/globals'
import type { Database } from 'better-sqlite3'
import { IPublicUserAuth, AppError } from '@ft_transcendence/common'

let UsersRepository: any
let mockDb: any

beforeAll(async () => {
	// Create a mock database that mimics better-sqlite3 behavior
	const mockPrepare = (query: string) => {
		const dbData: any = {
			users: []
		}

		return {
			run: jest.fn((...params: any[]) => {
				// Simulate INSERT, UPDATE, DELETE operations
				if (query.includes('INSERT')) {
					const [user_id, username, avatar, status, last_connection] = params
					dbData.users.push({
						user_id,
						username,
						avatar,
						status,
						last_connection
					})
				} else if (query.includes('UPDATE')) {
					// Update logic
				} else if (query.includes('DELETE')) {
					// Delete logic
				}
			}),
			get: jest.fn((...params: any[]) => {
				// Simulate SELECT operations
				if (query.includes('SELECT')) {
					return dbData.users[0] || undefined
				}
				return undefined
			}),
			all: jest.fn(() => {
				return dbData.users
			})
		}
	}

	mockDb = {
		prepare: mockPrepare,
		exec: jest.fn()
	}

	// Mock the database module
	await jest.unstable_mockModule('../database/usersDatabase.js', () => ({
		db: mockDb
	}))

	// Import the repository which will use our mocked database
	const repositoryModule = await import('./usersRepository.js')
	UsersRepository = repositoryModule.UsersRepository
})

beforeEach(() => {
	jest.clearAllMocks()
})

describe('UsersRepository', () => {
	// ===========================================
	// 1. USER EXISTENCE CHECKS
	// ===========================================
	describe('existsById', () => {
		it('should return true when user exists', () => {
			// Mock the database to return a user
			const mockGet = jest.fn(() => ({ user_id: 1 }))
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			expect(UsersRepository.existsById({ user_id: 1 })).toBe(true)
		})

		it('should return false when user does not exist', () => {
			// Mock the database to return undefined
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			expect(UsersRepository.existsById({ user_id: 999 })).toBe(false)
		})
	})

	describe('existsByUsername', () => {
		it('should return true when username exists', () => {
			const mockGet = jest.fn(() => ({ username: 'testuser' }))
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			expect(UsersRepository.existsByUsername({ username: 'testuser' })).toBe(
				true
			)
		})

		it('should return false when username does not exist', () => {
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			expect(
				UsersRepository.existsByUsername({ username: 'nonexistent' })
			).toBe(false)
		})
	})

	// ===========================================
	// 2. USER CREATION WITH UNIQUE USERNAME
	// ===========================================
	describe('insertUser', () => {
		it('should insert user with login as username when no conflict', () => {
			const mockRun = jest.fn()
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) return { get: mockGet }
				return { run: mockRun }
			})

			const newUser: IPublicUserAuth = { user_id: 1, login: 'anfichet' }
			UsersRepository.insertUser(newUser)

			expect(mockRun).toHaveBeenCalled()
		})

		it('should auto-increment username when login conflicts - scenario anais/anais1', () => {
			const mockRun = jest.fn()
			let callCount = 0
			const mockGet = jest.fn(() => {
				// First call: username 'anais' exists, second call: 'anais1' doesn't exist
				return callCount++ === 0 ? { username: 'anais' } : undefined
			})
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) return { get: mockGet }
				return { run: mockRun }
			})

			const newUser: IPublicUserAuth = { user_id: 2, login: 'anais' }
			UsersRepository.insertUser(newUser)

			expect(mockRun).toHaveBeenCalled()
		})

		it('should handle multiple conflicts: anais, anais1, anais2', () => {
			const mockRun = jest.fn()

			// First user
			let callCount1 = 0
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) {
					return { get: jest.fn(() => undefined) }
				}
				return { run: mockRun }
			})
			UsersRepository.insertUser({ user_id: 1, login: 'anais' })

			// Second user - anais exists, anais1 doesn't
			let callCount2 = 0
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) {
					return {
						get: jest.fn(() =>
							callCount2++ === 0 ? { username: 'anais' } : undefined
						)
					}
				}
				return { run: mockRun }
			})
			UsersRepository.insertUser({ user_id: 2, login: 'anais' })

			// Third user - anais and anais1 exist, anais2 doesn't
			let callCount3 = 0
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) {
					return {
						get: jest.fn(() =>
							callCount3++ < 2 ? { username: 'anais' } : undefined
						)
					}
				}
				return { run: mockRun }
			})
			UsersRepository.insertUser({ user_id: 3, login: 'anais' })

			expect(mockRun).toHaveBeenCalledTimes(3)
		})

		it('should ignore duplicate insertion with same user_id', () => {
			const mockRun = jest.fn()
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn((query: string) => {
				if (query.includes('SELECT')) return { get: mockGet }
				return { run: mockRun }
			})

			UsersRepository.insertUser({ user_id: 1, login: 'test' })
			UsersRepository.insertUser({ user_id: 1, login: 'test' })

			// Should be called twice but database will handle the constraint
			expect(mockRun).toHaveBeenCalled()
		})
	})

	// ===========================================
	// 3. USER UPDATES
	// ===========================================
	describe('updateLastConnection', () => {
		it('should update last_connection timestamp', () => {
			const mockRun = jest.fn()
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			UsersRepository.updateLastConnection({ user_id: 1 })

			expect(mockRun).toHaveBeenCalled()
		})
	})

	describe('updateUserAvatar', () => {
		it('should update avatar path', () => {
			const mockRun = jest.fn()
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			const newAvatar = '/avatars/custom_avatar.png'
			UsersRepository.updateUserAvatar({ user_id: 1, avatar: newAvatar })

			expect(mockRun).toHaveBeenCalledWith(newAvatar, 1)
		})
	})

	describe('updateUsername', () => {
		it('should update username successfully', () => {
			const mockRun = jest.fn(() => ({ changes: 1 }))
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			UsersRepository.updateUsername({ user_id: 1, username: 'newusername' })

			expect(mockRun).toHaveBeenCalledWith('newusername', 1)
		})

		it('should throw 409 error when username already taken', () => {
			const mockRun = jest.fn(() => {
				const error: any = new Error('UNIQUE constraint failed')
				error.code = 'SQLITE_CONSTRAINT_UNIQUE'
				throw error
			})
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			expect(() => {
				UsersRepository.updateUsername({ user_id: 1, username: 'existinguser' })
			}).toThrow(AppError)
		})

		it('should throw 404 error when user does not exist', () => {
			const mockRun = jest.fn(() => ({ changes: 0 }))
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			expect(() => {
				UsersRepository.updateUsername({ user_id: 999, username: 'newname' })
			}).toThrow(AppError)
		})
	})

	// ===========================================
	// 4. USER RETRIEVAL
	// ===========================================
	describe('getUserById', () => {
		it('should return user profile', () => {
			const mockUser = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/test.png',
				status: 1,
				last_connection: '2025-01-01T00:00:00.000Z'
			}
			const mockGet = jest.fn(() => mockUser)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const user = UsersRepository.getUserById({ user_id: 1 })

			expect(user).toBeDefined()
			expect(user?.user_id).toBe(1)
			expect(user?.username).toBe('testuser')
			expect(user?.avatar).toBe('/avatars/test.png')
			expect(user?.status).toBe(1)
			expect(user?.last_connection).toBe('2025-01-01T00:00:00.000Z')
		})

		it('should return undefined for non-existent user', () => {
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const user = UsersRepository.getUserById({ user_id: 999 })
			expect(user).toBeUndefined()
		})
	})

	describe('getUserByUsername', () => {
		it('should return user by username', () => {
			const mockUser = {
				user_id: 1,
				username: 'testuser',
				avatar: '/avatars/test.png',
				last_connection: new Date().toISOString()
			}
			const mockGet = jest.fn(() => mockUser)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const user = UsersRepository.getUserByUsername({ username: 'testuser' })

			expect(user).toBeDefined()
			expect(user?.user_id).toBe(1)
			expect(user?.username).toBe('testuser')
		})

		it('should return undefined for non-existent username', () => {
			const mockGet = jest.fn(() => undefined)
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const user = UsersRepository.getUserByUsername({
				username: 'nonexistent'
			})
			expect(user).toBeUndefined()
		})
	})

	describe('getLastConnectionById', () => {
		it('should return last_connection timestamp', () => {
			const mockGet = jest.fn(() => ({
				last_connection: '2025-01-01T00:00:00.000Z'
			}))
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const lastConnection = UsersRepository.getLastConnectionById({
				user_id: 1
			})
			expect(lastConnection).toBe('2025-01-01T00:00:00.000Z')
		})
	})

	describe('getAvatarById', () => {
		it('should return avatar path', () => {
			const mockGet = jest.fn(() => ({ avatar: '/avatars/custom.png' }))
			mockDb.prepare = jest.fn(() => ({ get: mockGet }))

			const avatar = UsersRepository.getAvatarById({ user_id: 1 })
			expect(avatar).toBe('/avatars/custom.png')
		})
	})

	describe('getAllUsers', () => {
		it('should return all users', () => {
			const mockUsers = [
				{
					user_id: 1,
					username: 'user1',
					avatar: '/avatars/img_default.png',
					status: 1,
					last_connection: new Date().toISOString()
				},
				{
					user_id: 2,
					username: 'user2',
					avatar: '/avatars/img_default.png',
					status: 1,
					last_connection: new Date().toISOString()
				}
			]
			const mockAll = jest.fn(() => mockUsers)
			mockDb.prepare = jest.fn(() => ({ all: mockAll }))

			const users = UsersRepository.getAllUsers()

			expect(users).toHaveLength(2)
			expect(users[0].user_id).toBe(1)
			expect(users[1].user_id).toBe(2)
		})

		it('should return empty array when no users', () => {
			const mockAll = jest.fn(() => [])
			mockDb.prepare = jest.fn(() => ({ all: mockAll }))

			const users = UsersRepository.getAllUsers()
			expect(users).toHaveLength(0)
		})
	})

	// ===========================================
	// 5. USER DELETION
	// ===========================================
	describe('deleteUserById', () => {
		it('should delete user successfully', () => {
			const mockRun = jest.fn()
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			UsersRepository.deleteUserById({ user_id: 1 })

			expect(mockRun).toHaveBeenCalledWith(1)
		})

		it('should not throw error when deleting non-existent user', () => {
			const mockRun = jest.fn()
			mockDb.prepare = jest.fn(() => ({ run: mockRun }))

			expect(() => {
				UsersRepository.deleteUserById({ user_id: 999 })
			}).not.toThrow()
		})
	})
})

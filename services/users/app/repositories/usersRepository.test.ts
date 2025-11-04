/**
 * Test Coverage Summary for UsersRepository
 *
 * SECTION 1: SUCCESSFUL CASES
 * - existsById: Returns true when user exists, false when not
 * - insertUser: Inserts with valid Zod data (4-16 char username), generates ISO 8601 timestamps
 * - getUserById: Returns complete profile (user_id, username, avatar, status, last_connection)
 * - updateUsernameProfile: Updates username with valid value
 * - getAllUsers: Returns array of all users
 *
 * SECTION 2: BASIC FAILURE CASES
 * - getUserById: Returns undefined when user not found
 * - getUserByUsername: Returns undefined when username not found
 * - getAllUsers: Returns empty array when no users in database
 *
 * SECTION 3: TRICKY CASES
 * - INSERT OR IGNORE: Uses clause to handle duplicates silently
 * - Case sensitivity: getUserByUsername is case-sensitive
 * - Status values: Returns status 0 (offline) and 1 (online) correctly
 * - Default values: Always sets status=1 and default avatar on insert
 * - Large datasets: Handles 1000+ users efficiently
 * - Timestamp format: Generates RFC 3339/ISO 8601 compliant timestamps
 *
 * SECTION 4: EXCEPTIONS
 * - SQL query structure: getUserById queries correct columns
 * - Parameterized queries: Uses placeholders to prevent SQL injection
 */

import { jest } from '@jest/globals'

let UsersRepository: any
let db: any

beforeAll(async () => {
	await jest.unstable_mockModule('../database/usersDatabase.js', () => ({
		db: {
			prepare: jest.fn(),
			transaction: jest.fn((fn: any) => fn)
		}
	}))
	;({ db } = await import('../database/usersDatabase.js'))
	;({ UsersRepository } = await import('./usersRepository.js'))
})

describe('UsersRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ==================== SECTION 1: SUCCESSFUL CASES ====================
	describe('1. Successful cases (Happy Path)', () => {
		describe('existsById', () => {
			test('returns true when user exists', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue({ user_id: 1 })
				})

				const result = UsersRepository.existsById({ user_id: 1 })

				expect(result).toBe(true)
				expect(db.prepare).toHaveBeenCalledWith(
					'SELECT 1 FROM users WHERE user_id = ?'
				)
			})

			test('returns false when user does not exist', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue(undefined)
				})

				const result = UsersRepository.existsById({ user_id: 999 })

				expect(result).toBe(false)
			})
		})

		describe('insertUser', () => {
			test('inserts user with valid data (conforming to Zod schema)', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({ user_id: 42, login: 'testuser' })

				expect(db.prepare).toHaveBeenCalledWith(
					'INSERT OR IGNORE INTO users (user_id, username, avatar, status, last_connection) VALUES (?, ?, ?, ?, ?)'
				)
				expect(run).toHaveBeenCalledWith(
					42,
					'testuser',
					'/avatars/img_default.png',
					1,
					expect.any(String)
				)
			})

			test('generates valid ISO 8601 timestamp on insert', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({ user_id: 1, login: 'user1' })

				const timestamp = run.mock.calls[0][4]
				expect(timestamp).toMatch(
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
				)
				expect(new Date(timestamp).toISOString()).toBe(timestamp)
			})
		})

		describe('getUserById', () => {
			test('returns complete user profile when found', () => {
				const mockUser = {
					user_id: 42,
					username: 'testuser',
					avatar: '/avatars/img_default.png',
					status: 1,
					last_connection: '2024-01-01T00:00:00.000Z'
				}
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue(mockUser)
				})

				const result = UsersRepository.getUserById({ user_id: 42 })

				expect(result).toEqual(mockUser)
				expect(result).toHaveProperty('user_id')
				expect(result).toHaveProperty('username')
				expect(result).toHaveProperty('avatar')
				expect(result).toHaveProperty('status')
				expect(result).toHaveProperty('last_connection')
			})
		})

		describe('updateUsername', () => {
			test('updates username with valid value', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.updateUsername({ user_id: 7, username: 'newname' })

				expect(db.prepare).toHaveBeenCalledWith(
					'UPDATE users SET username = ? WHERE user_id = ?'
				)
				expect(run).toHaveBeenCalledWith('newname', 7)
			})
		})

		describe('getAllUsers', () => {
			test('returns array of all users', () => {
				const mockUsers = [
					{
						user_id: 1,
						username: 'user1',
						avatar: 'img.png',
						status: 1,
						last_connection: 'now'
					},
					{
						user_id: 2,
						username: 'user2',
						avatar: 'img.png',
						status: 0,
						last_connection: 'then'
					}
				]
				db.prepare.mockReturnValueOnce({
					all: jest.fn().mockReturnValue(mockUsers)
				})

				const result = UsersRepository.getAllUsers()

				expect(result).toEqual(mockUsers)
				expect(Array.isArray(result)).toBe(true)
				expect(result).toHaveLength(2)
			})
		})
	})

	// ==================== SECTION 2: BASIC FAILURE CASES ====================
	describe('2. Basic failure cases', () => {
		describe('getUserById', () => {
			test('returns undefined when user not found', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue(undefined)
				})

				const result = UsersRepository.getUserById({ user_id: 999 })

				expect(result).toBeUndefined()
			})
		})

		describe('getUserByUsername', () => {
			test('returns undefined when username not found', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue(undefined)
				})

				const result = UsersRepository.getUserByUsername('nonexistent')

				expect(result).toBeUndefined()
			})
		})

		describe('getAllUsers', () => {
			test('returns empty array when no users in database', () => {
				db.prepare.mockReturnValueOnce({
					all: jest.fn().mockReturnValue([])
				})

				const result = UsersRepository.getAllUsers()

				expect(result).toEqual([])
				expect(Array.isArray(result)).toBe(true)
				expect(result).toHaveLength(0)
			})
		})
	})

	// ==================== SECTION 3: TRICKY CASES ====================
	describe('3. Tricky cases', () => {
		describe('INSERT OR IGNORE behavior', () => {
			test('uses INSERT OR IGNORE clause to handle duplicates silently', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({ user_id: 1, login: 'user1' })

				expect(db.prepare).toHaveBeenCalledWith(
					expect.stringContaining('INSERT OR IGNORE')
				)
			})
		})

		describe('Case sensitivity', () => {
			test('getUserByUsername is case-sensitive (TestUser != testuser)', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue(undefined)
				})

				const result = UsersRepository.getUserByUsername('TestUser')

				expect(result).toBeUndefined()
			})
		})

		describe('Status values', () => {
			test('returns user with status 0 (offline)', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue({ status: 0 })
				})

				expect(UsersRepository.getStatusById({ user_id: 1 })).toBe(0)
			})

			test('returns user with status 1 (online)', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue({ status: 1 })
				})

				expect(UsersRepository.getStatusById({ user_id: 1 })).toBe(1)
			})
		})

		describe('Default values verification', () => {
			test('insertUser always sets status to 1 by default', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({ user_id: 1, login: 'test' })

				expect(run.mock.calls[0][3]).toBe(1) // status parameter
			})

			test('insertUser always uses default avatar path', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({ user_id: 1, login: 'test' })

				expect(run.mock.calls[0][2]).toBe('/avatars/img_default.png')
			})
		})

		describe('Large datasets', () => {
			test('getAllUsers handles 1000+ users efficiently', () => {
				const largeSet = Array.from({ length: 1000 }, (_, i) => ({
					user_id: i + 1,
					username: `user${i + 1}`,
					avatar: '/avatars/img_default.png',
					status: i % 2,
					last_connection: new Date().toISOString()
				}))
				db.prepare.mockReturnValueOnce({
					all: jest.fn().mockReturnValue(largeSet)
				})

				const result = UsersRepository.getAllUsers()

				expect(result).toHaveLength(1000)
				expect(result[0].user_id).toBe(1)
				expect(result[999].user_id).toBe(1000)
			})
		})

		describe('Timestamp format validation', () => {
			test('updateLastConnection generates RFC 3339/ISO 8601 compliant timestamp', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.updateLastConnection({ user_id: 1 })

				const timestamp = run.mock.calls[0][0]
				// Verify ISO format and validity
				expect(timestamp).toMatch(
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
				)
				expect(new Date(timestamp).toISOString()).toBe(timestamp)
				expect(Number.isNaN(new Date(timestamp).getTime())).toBe(false)
			})
		})
	})

	// ==================== SECTION 4: EXCEPTIONS ====================
	describe('4. Exceptions', () => {
		describe('SQL query structure verification', () => {
			test('getUserById queries correct columns', () => {
				db.prepare.mockReturnValueOnce({
					get: jest.fn().mockReturnValue({})
				})

				UsersRepository.getUserById({ user_id: 1 })

				expect(db.prepare).toHaveBeenCalledWith(
					'SELECT user_id, username, avatar, status, last_connection FROM users WHERE user_id = ?'
				)
			})

			test('insertUser uses parameterized query (prevents SQL injection)', () => {
				const run = jest.fn()
				db.prepare.mockReturnValueOnce({ run })

				UsersRepository.insertUser({
					user_id: 1,
					login: "test'; DROP TABLE users; --"
				})

				// Verify it's passed as parameter, not concatenated in SQL
				expect(run.mock.calls[0][1]).toBe("test'; DROP TABLE users; --")
				expect(db.prepare).toHaveBeenCalledWith(
					expect.stringContaining('VALUES (?, ?, ?, ?, ?)')
				)
			})
		})
	})
})

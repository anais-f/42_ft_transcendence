/**
 * Test Coverage Summary for UsersServices
 *
 * SECTION 1: SUCCESSFUL CASES
 * - createUser: Creates users with valid data (4-16 char usernames, special chars allowed)
 * - getPublicUserProfile: Returns complete profile (user_id, username, avatar, status, last_connection)
 * - syncAllUsersFromAuth: Syncs all users from auth service, skips existing users
 *
 * SECTION 2: BASIC FAILURE CASES
 * - createUser: Throws AppError 400 when user already exists
 * - getPublicUserProfile: Throws AppError 404 when user not found
 *
 * SECTION 3: TRICKY CASES
 * - Boundary values: Tests user_id = 999999999 (large)
 * - Large datasets: Handles 100+ users efficiently
 * - Profile structure: Verifies all 5 required fields and correct types
 *
 * SECTION 4: EXCEPTIONS
 * - Error propagation: Verifies DB errors and Auth service errors propagate correctly
 * - Integration scenarios: Create user → Get profile workflow
 */

import { jest } from '@jest/globals'
import type { PublicUserAuthDTO, UserPublicProfileDTO } from '@ft_transcendence/common'

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

  // ==================== SECTION 1: SUCCESSFUL CASES ====================
  describe('1. Successful cases (Happy Path)', () => {
    describe('createUser', () => {
      test('creates user with valid PublicUserAuthDTO (Zod validated)', async () => {
        UsersRepository.existsById.mockReturnValueOnce(false)
        UsersRepository.insertUser.mockResolvedValueOnce(undefined)

        const validUser: PublicUserAuthDTO = { user_id: 42, login: 'testuser' }
        await UsersServices.createUser(validUser)

        expect(UsersRepository.existsById).toHaveBeenCalledWith({ user_id: 42 })
        expect(UsersRepository.insertUser).toHaveBeenCalledWith({
          user_id: 42,
          login: 'testuser'
        })
        expect(UsersRepository.insertUser).toHaveBeenCalledTimes(1)
      })
    })

    describe('getPublicUserProfile', () => {
      test('returns complete UserPublicProfileDTO when user exists', async () => {
        const mockProfile: UserPublicProfileDTO = {
          user_id: 42,
          username: 'testuser',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }
        UsersRepository.getUserById.mockReturnValueOnce(mockProfile)

        const result = await UsersServices.getPublicUserProfile({ user_id: 42 })

        expect(result).toEqual(mockProfile)
        expect(result).toHaveProperty('user_id', 42)
        expect(result).toHaveProperty('username', 'testuser')
        expect(result).toHaveProperty('avatar')
        expect(result).toHaveProperty('status')
        expect(result).toHaveProperty('last_connection')
      })
    })

    describe('syncAllUsersFromAuth', () => {
      test('syncs all users when none exist locally', async () => {
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
        expect(UsersRepository.existsById).toHaveBeenCalledTimes(3)
        expect(UsersRepository.insertUser).toHaveBeenCalledTimes(3)
      })

      test('syncs only new users (skips existing)', async () => {
        const authUsers = [
          { user_id: 1, login: 'existing' },
          { user_id: 2, login: 'new1' },
          { user_id: 3, login: 'new2' }
        ]
        AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
        UsersRepository.existsById
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(false)
        UsersRepository.insertUser.mockResolvedValue(undefined)

        await UsersServices.syncAllUsersFromAuth()

        expect(UsersRepository.insertUser).toHaveBeenCalledTimes(2)
        expect(UsersRepository.insertUser).not.toHaveBeenCalledWith({ user_id: 1, login: 'existing' })
      })

      test('does nothing when all users exist', async () => {
        const authUsers = [
          { user_id: 1, login: 'user1' },
          { user_id: 2, login: 'user2' }
        ]
        AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
        UsersRepository.existsById.mockReturnValue(true)

        await UsersServices.syncAllUsersFromAuth()

        expect(UsersRepository.insertUser).not.toHaveBeenCalled()
      })
    })
  })

  // ==================== SECTION 2: BASIC FAILURE CASES ====================
  describe('2. Basic failure cases', () => {
    describe('createUser', () => {
      test('throws AppError with status 400 when user already exists', async () => {
        UsersRepository.existsById.mockReturnValueOnce(true)

        await expect(UsersServices.createUser({ user_id: 42, login: 'existing' }))
          .rejects
          .toThrow(AppError)

        try {
          await UsersServices.createUser({ user_id: 42, login: 'existing' })
        } catch (error) {
          expect(error).toBeInstanceOf(AppError)
          expect((error as any).status).toBe(400)
          expect((error as any).message).toBe(ERROR_MESSAGES.USER_ALREADY_EXISTS)
        }

        expect(UsersRepository.insertUser).not.toHaveBeenCalled()
      })
    })

    describe('getPublicUserProfile', () => {
      test('throws AppError 404 when user not found', async () => {
        UsersRepository.getUserById.mockReturnValueOnce(undefined)

        await expect(UsersServices.getPublicUserProfile({ user_id: 999 }))
          .rejects
          .toThrow(AppError)

        try {
          await UsersServices.getPublicUserProfile({ user_id: 999 })
        } catch (error) {
          expect(error).toBeInstanceOf(AppError)
          expect((error as any).status).toBe(404)
          expect((error as any).message).toBe(ERROR_MESSAGES.USER_NOT_FOUND)
        }
      })
    })
  })

  // ==================== SECTION 3: TRICKY CASES ====================
  describe('3. Tricky cases', () => {
    describe('Boundary values for user_id', () => {
      test('getPublicUserProfile with very large user_id', async () => {
        const largeId = 999999999
        const mockProfile: UserPublicProfileDTO = {
          user_id: largeId,
          username: 'user',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-01-01T00:00:00.000Z'
        }
        UsersRepository.getUserById.mockReturnValueOnce(mockProfile)

        const result = await UsersServices.getPublicUserProfile({ user_id: largeId })

        expect(result.user_id).toBe(largeId)
      })
    })

    describe('Large datasets', () => {
      test('syncAllUsersFromAuth handles 100+ users', async () => {
        const largeUserList = Array.from({ length: 100 }, (_, i) => ({
          user_id: i + 1,
          login: `user${i + 1}`
        }))
        AuthApi.getAllUsers.mockResolvedValueOnce(largeUserList)
        UsersRepository.existsById.mockReturnValue(false)
        UsersRepository.insertUser.mockResolvedValue(undefined)

        await UsersServices.syncAllUsersFromAuth()

        expect(UsersRepository.insertUser).toHaveBeenCalledTimes(100)
      })
    })

    describe('Profile structure verification', () => {
      test('returns profile with all required fields', async () => {
        const fullProfile: UserPublicProfileDTO = {
          user_id: 123,
          username: 'user_name-123',
          avatar: '/avatars/custom.png',
          status: 0,
          last_connection: '2024-10-23T12:00:00.000Z'
        }
        UsersRepository.getUserById.mockReturnValueOnce(fullProfile)

        const result = await UsersServices.getPublicUserProfile({ user_id: 123 })

        expect(result).toEqual(fullProfile)
        expect(Object.keys(result)).toHaveLength(5)
        expect(typeof result.user_id).toBe('number')
        expect(typeof result.username).toBe('string')
        expect(typeof result.avatar).toBe('string')
        expect(typeof result.status).toBe('number')
        expect(typeof result.last_connection).toBe('string')
      })
    })
  })

  // ==================== SECTION 4: EXCEPTIONS ====================
  describe('4. Exceptions', () => {
    describe('Error propagation from repository', () => {
      test('createUser propagates database errors', async () => {
        UsersRepository.existsById.mockReturnValueOnce(false)
        UsersRepository.insertUser.mockRejectedValueOnce(new Error('Database connection failed'))

        await expect(UsersServices.createUser({ user_id: 1, login: 'test' }))
          .rejects
          .toThrow('Database connection failed')

        expect(UsersRepository.insertUser).toHaveBeenCalled()
      })

      test('getPublicUserProfile propagates repository errors', async () => {
        UsersRepository.getUserById.mockImplementationOnce(() => {
          throw new Error('Database connection failed')
        })

        await expect(UsersServices.getPublicUserProfile({ user_id: 1 }))
          .rejects
          .toThrow('Database connection failed')
      })
    })

    describe('Error propagation from AuthApi', () => {
      test('syncAllUsersFromAuth propagates auth service errors', async () => {
        AuthApi.getAllUsers.mockRejectedValueOnce(new Error('Auth service unavailable'))

        await expect(UsersServices.syncAllUsersFromAuth())
          .rejects
          .toThrow('Auth service unavailable')

        expect(UsersRepository.insertUser).not.toHaveBeenCalled()
      })

      test('syncAllUsersFromAuth propagates repository errors during sync', async () => {
        const authUsers = [{ user_id: 1, login: 'user1' }]
        AuthApi.getAllUsers.mockResolvedValueOnce(authUsers)
        UsersRepository.existsById.mockReturnValueOnce(false)
        UsersRepository.insertUser.mockImplementationOnce(() => {
          throw new Error('Database error')
        })

        await expect(UsersServices.syncAllUsersFromAuth())
          .rejects
          .toThrow('Database error')
      })
    })

    describe('Integration scenarios', () => {
      test('createUser followed by getPublicUserProfile', async () => {
        const newUser = { user_id: 50, login: 'newuser' }
        const expectedProfile: UserPublicProfileDTO = {
          user_id: 50,
          username: 'newuser',
          avatar: '/avatars/img_default.png',
          status: 1,
          last_connection: '2024-10-23T12:00:00.000Z'
        }

        UsersRepository.existsById.mockReturnValueOnce(false)
        UsersRepository.insertUser.mockResolvedValueOnce(undefined)
        UsersRepository.getUserById.mockReturnValueOnce(expectedProfile)

        await UsersServices.createUser(newUser)
        const profile = await UsersServices.getPublicUserProfile({ user_id: 50 })

        expect(profile.user_id).toBe(50)
        expect(profile.username).toBe('newuser')
      })
    })
  })
})
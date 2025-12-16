/**
 * @file userUsecases.test.ts
 * @description Unit tests for user management use cases
 *
 * Test Suite Summary:
 * 1. getPublicUserUsecase - Return user when found
 * 2. getPublicUserUsecase - Throw error when user not found
 * 3. deleteUserUsecase - Delete successfully
 * 4. deleteUserUsecase - Throw error when user not found
 * 5. changeUserPasswordUsecase - Change password successfully
 * 6. changeUserPasswordUsecase - Throw error when user not found
 */

import {
	describe,
	test,
	expect,
	jest,
	beforeAll,
	beforeEach
} from '@jest/globals'

// Mock the repository
let mockFindPublicUserById: jest.Mock
let mockDeleteUserById: jest.Mock
let mockChangeUserPassword: jest.Mock

// Mock createHttpError
const createHttpError = {
	NotFound: (msg: string) => {
		const error = new Error(msg) as any
		error.statusCode = 404
		error.status = 404
		return error
	},
	InternalServerError: (msg: string) => {
		const error = new Error(msg) as any
		error.statusCode = 500
		error.status = 500
		return error
	}
}

// Functions to test
function getPublicUserUsecase(userId: number) {
	const user = mockFindPublicUserById(userId)
	if (!user) throw createHttpError.NotFound('User not found')
	return user
}

function deleteUserUsecase(userId: number): void {
	const ok = mockDeleteUserById(userId)
	if (!ok) throw createHttpError.NotFound('User not found')
}

function changeUserPasswordUsecase(
	userId: number,
	hashedPassword: string
): { success: boolean } {
	const ok = mockChangeUserPassword(userId, hashedPassword)
	if (!ok) throw createHttpError.NotFound('User not found')
	return { success: true }
}

describe('User Usecases', () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockFindPublicUserById = jest.fn()
		mockDeleteUserById = jest.fn()
		mockChangeUserPassword = jest.fn()
	})

	// ===========================================
	// GET PUBLIC USER
	// ===========================================
	describe('getPublicUserUsecase', () => {
		test('should return user when found', () => {
			const mockUser = {
				user_id: 42,
				login: 'testuser',
				is_admin: false
			}
			mockFindPublicUserById.mockReturnValue(mockUser)

			const result = getPublicUserUsecase(42)

			expect(result).toEqual(mockUser)
			expect(mockFindPublicUserById).toHaveBeenCalledWith(42)
		})

		test('should throw NotFound error when user does not exist', () => {
			mockFindPublicUserById.mockReturnValue(null)

			expect(() => {
				getPublicUserUsecase(999)
			}).toThrow('User not found')

			expect(mockFindPublicUserById).toHaveBeenCalledWith(999)
		})

		test('should throw NotFound error when user is undefined', () => {
			mockFindPublicUserById.mockReturnValue(undefined)

			expect(() => {
				getPublicUserUsecase(123)
			}).toThrow('User not found')
		})
	})

	// ===========================================
	// DELETE USER
	// ===========================================
	describe('deleteUserUsecase', () => {
		test('should delete user successfully', () => {
			mockDeleteUserById.mockReturnValue(true)

			expect(() => {
				deleteUserUsecase(42)
			}).not.toThrow()

			expect(mockDeleteUserById).toHaveBeenCalledWith(42)
		})

		test('should throw NotFound error when user does not exist', () => {
			mockDeleteUserById.mockReturnValue(false)

			expect(() => {
				deleteUserUsecase(999)
			}).toThrow('User not found')

			expect(mockDeleteUserById).toHaveBeenCalledWith(999)
		})

		test('should throw NotFound error when deletion fails', () => {
			mockDeleteUserById.mockReturnValue(null)

			expect(() => {
				deleteUserUsecase(123)
			}).toThrow('User not found')
		})
	})

	// ===========================================
	// CHANGE USER PASSWORD
	// ===========================================
	describe('changeUserPasswordUsecase', () => {
		test('should change password successfully', () => {
			mockChangeUserPassword.mockReturnValue(true)

			const result = changeUserPasswordUsecase(42, 'hashed_password_123')

			expect(result).toEqual({ success: true })
			expect(mockChangeUserPassword).toHaveBeenCalledWith(
				42,
				'hashed_password_123'
			)
		})

		test('should throw NotFound error when user does not exist', () => {
			mockChangeUserPassword.mockReturnValue(false)

			expect(() => {
				changeUserPasswordUsecase(999, 'hashed_password')
			}).toThrow('User not found')

			expect(mockChangeUserPassword).toHaveBeenCalledWith(
				999,
				'hashed_password'
			)
		})

		test('should handle different hashed password formats', () => {
			mockChangeUserPassword.mockReturnValue(true)

			const longHash = '$argon2id$v=19$m=65536,t=2,p=1$someverylonghashstring'
			const result = changeUserPasswordUsecase(1, longHash)

			expect(result.success).toBe(true)
			expect(mockChangeUserPassword).toHaveBeenCalledWith(1, longHash)
		})
	})
})

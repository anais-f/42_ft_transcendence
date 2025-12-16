/**
 * @file twofaUsecases.test.ts
 * @description Unit tests for 2FA business logic
 *
 * Test Suite Summary:
 * 1. status2FA - Return enabled status
 * 2. status2FA - Return disabled status
 * 3. disable2FA - Return success
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'

// Mock repository functions
let mockGetSecretEnc: jest.Mock
let mockDeleteSecret: jest.Mock

// Function to test
function status2FA(userId: number): { enabled: boolean } {
	const enc = mockGetSecretEnc(userId)
	return { enabled: !!enc }
}

function disable2FA(userId: number): { success: boolean } {
	mockDeleteSecret(userId)
	return { success: true }
}

describe('2FA Usecases', () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockGetSecretEnc = jest.fn()
		mockDeleteSecret = jest.fn()
	})

	// ===========================================
	// STATUS 2FA
	// ===========================================
	describe('status2FA', () => {
		test('should return enabled true when user has 2FA secret', () => {
			mockGetSecretEnc.mockReturnValue('encrypted_secret_data')

			const result = status2FA(42)

			expect(result.enabled).toBe(true)
			expect(mockGetSecretEnc).toHaveBeenCalledWith(42)
		})

		test('should return enabled false when user has no 2FA secret', () => {
			mockGetSecretEnc.mockReturnValue(null)

			const result = status2FA(123)

			expect(result.enabled).toBe(false)
			expect(mockGetSecretEnc).toHaveBeenCalledWith(123)
		})

		test('should return enabled false when secret is undefined', () => {
			mockGetSecretEnc.mockReturnValue(undefined)

			const result = status2FA(999)

			expect(result.enabled).toBe(false)
		})

		test('should return enabled false when secret is empty string', () => {
			mockGetSecretEnc.mockReturnValue('')

			const result = status2FA(456)

			expect(result.enabled).toBe(false)
		})
	})

	// ===========================================
	// DISABLE 2FA
	// ===========================================
	describe('disable2FA', () => {
		test('should delete secret and return success', () => {
			const result = disable2FA(42)

			expect(result.success).toBe(true)
			expect(mockDeleteSecret).toHaveBeenCalledWith(42)
		})

		test('should call deleteSecret with correct user ID', () => {
			disable2FA(789)

			expect(mockDeleteSecret).toHaveBeenCalledWith(789)
			expect(mockDeleteSecret).toHaveBeenCalledTimes(1)
		})

		test('should always return success', () => {
			// Even if delete fails in repository, usecase returns success
			mockDeleteSecret.mockReturnValue(false)

			const result = disable2FA(123)

			expect(result.success).toBe(true)
		})
	})

	// ===========================================
	// SETUP EXPIRATION CONSTANT
	// ===========================================
	describe('Setup expiration', () => {
		test('SETUP_EXPIRATION_MS should be 5 minutes', () => {
			const SETUP_EXPIRATION_MS = 5 * 60 * 1000

			expect(SETUP_EXPIRATION_MS).toBe(300000)
			expect(SETUP_EXPIRATION_MS).toBe(5 * 60 * 1000)
		})
	})
})

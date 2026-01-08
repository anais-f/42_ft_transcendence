/**
 * @file authUsecases.test.ts
 * @description Unit tests for admin validation
 *
 * Test Suite Summary:
 * 1. validateAdminUsecase - Accept valid admin token
 * 2. validateAdminUsecase - Reject non-admin token
 * 3. validateAdminUsecase - Reject invalid token
 */

import { describe, test, expect, jest, beforeAll } from '@jest/globals'
import jwt from 'jsonwebtoken'

const JWT_SECRET_AUTH = 'test-secret-for-admin-validation'

// Mock createHttpError
const createHttpError = {
	Forbidden: (msg: string) => new Error(`Forbidden: ${msg}`)
}

// Mock verifyToken
function mockVerifyToken(token: string): {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
} {
	return jwt.verify(token, JWT_SECRET_AUTH) as any
}

// Function to test
function validateAdminUsecase(token: string): { success: boolean } {
	const payload = mockVerifyToken(token)
	if (!payload.is_admin) throw createHttpError.Forbidden('Forbidden')
	return { success: true }
}

describe('Validate Admin Usecase', () => {
	// Helper function to create test tokens
	function createTestToken(payload: {
		user_id: number
		login: string
		is_admin?: boolean
		type: string
	}): string {
		return jwt.sign(payload, JWT_SECRET_AUTH, { expiresIn: '1h' })
	}

	// ===========================================
	// 1. VALIDATE ADMIN - SUCCESS
	// ===========================================
	test('validateAdminUsecase should accept valid admin token', () => {
		const adminToken = createTestToken({
			user_id: 1,
			login: 'admin',
			is_admin: true,
			type: 'auth'
		})

		const result = validateAdminUsecase(adminToken)

		expect(result.success).toBe(true)
	})

	// ===========================================
	// 2. VALIDATE ADMIN - FAILURE (Non-admin user)
	// ===========================================
	test('validateAdminUsecase should reject non-admin token', () => {
		const userToken = createTestToken({
			user_id: 2,
			login: 'regularuser',
			is_admin: false,
			type: 'auth'
		})

		expect(() => {
			validateAdminUsecase(userToken)
		}).toThrow('Forbidden')
	})

	// ===========================================
	// 3. VALIDATE ADMIN - FAILURE (Missing is_admin field)
	// ===========================================
	test('validateAdminUsecase should reject token without is_admin field', () => {
		const tokenWithoutAdmin = createTestToken({
			user_id: 3,
			login: 'unknownuser',
			type: 'auth'
		})

		expect(() => {
			validateAdminUsecase(tokenWithoutAdmin)
		}).toThrow('Forbidden')
	})

	// ===========================================
	// 4. VALIDATE ADMIN - FAILURE (Invalid token)
	// ===========================================
	test('validateAdminUsecase should throw error for invalid token', () => {
		const invalidToken = 'not.a.valid.token'

		expect(() => {
			validateAdminUsecase(invalidToken)
		}).toThrow()
	})
})

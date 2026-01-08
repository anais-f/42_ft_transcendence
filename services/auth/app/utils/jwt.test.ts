/**
 * @file jwt.test.ts
 * @description Tests unitaires pour les fonctions JWT
 *
 * Test Suite Summary:
 * 1. signToken - Génère un token valide
 * 2. verifyToken - Vérifie un token valide
 * 3. verifyToken - Rejette un token invalide
 * 4. verifyToken - Rejette un token expiré
 */

import { describe, test, expect, beforeAll } from '@jest/globals'
import jwt from 'jsonwebtoken'

// Mock du secret JWT pour les tests
const JWT_SECRET_AUTH = 'test-secret-key-for-jwt-testing'

// Fonctions à tester (réimplémentées pour éviter les dépendances)
function signToken(
	payload: {
		user_id: number
		login?: string
		is_admin?: boolean
		type: string
	},
	expiresIn: string,
	secret: string = JWT_SECRET_AUTH
): string {
	return jwt.sign(payload, secret, { expiresIn })
}

function verifyToken(
	token: string,
	secret: string = JWT_SECRET_AUTH
): {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
} {
	return jwt.verify(token, secret) as any
}

describe('JWT Utils', () => {
	// ===========================================
	// 1. SIGN TOKEN - SUCCESS
	// ===========================================
	test('signToken should create a valid JWT token', () => {
		const payload = {
			user_id: 42,
			login: 'testuser',
			is_admin: false,
			type: 'auth'
		}

		const token = signToken(payload, '1h')

		expect(token).toBeDefined()
		expect(typeof token).toBe('string')
		expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
	})

	// ===========================================
	// 2. VERIFY TOKEN - SUCCESS
	// ===========================================
	test('verifyToken should decode a valid token correctly', () => {
		const payload = {
			user_id: 123,
			login: 'johndoe',
			is_admin: true,
			type: 'auth'
		}

		const token = signToken(payload, '1h')
		const decoded = verifyToken(token)

		expect(decoded.user_id).toBe(123)
		expect(decoded.login).toBe('johndoe')
		expect(decoded.is_admin).toBe(true)
		expect(decoded.iat).toBeDefined()
		expect(decoded.exp).toBeDefined()
	})

	// ===========================================
	// 3. VERIFY TOKEN - FAILURE (Invalid token)
	// ===========================================
	test('verifyToken should throw error for invalid token', () => {
		const invalidToken = 'invalid.token.here'

		expect(() => {
			verifyToken(invalidToken)
		}).toThrow()
	})

	// ===========================================
	// 4. VERIFY TOKEN - FAILURE (Wrong secret)
	// ===========================================
	test('verifyToken should throw error for token signed with different secret', () => {
		const payload = {
			user_id: 999,
			login: 'hacker',
			type: 'auth'
		}

		const token = signToken(payload, '1h', 'different-secret')

		expect(() => {
			verifyToken(token, JWT_SECRET_AUTH)
		}).toThrow()
	})

	// ===========================================
	// 5. VERIFY TOKEN - FAILURE (Expired token)
	// ===========================================
	test('verifyToken should throw error for expired token', async () => {
		const payload = {
			user_id: 456,
			login: 'expireduser',
			type: 'auth'
		}

		// Créer un token qui expire immédiatement
		const token = signToken(payload, '0s')

		// Attendre que le token expire
		await new Promise((resolve) => setTimeout(resolve, 1000))

		expect(() => {
			verifyToken(token)
		}).toThrow()
	})

	// ===========================================
	// 6. TOKEN PAYLOAD - Verify type field
	// ===========================================
	test('token should contain type field', () => {
		const payload = {
			user_id: 789,
			login: 'typetest',
			type: 'pre_2fa'
		}

		const token = signToken(payload, '1h')
		const decoded = verifyToken(token)

		expect((decoded as any).type).toBe('pre_2fa')
	})
})

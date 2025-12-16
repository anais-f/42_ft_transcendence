/**
 * @file password.test.ts
 * @description Tests unitaires pour les fonctions de gestion des mots de passe
 *
 * Test Suite Summary:
 * 1. hashPassword - Crée un hash valide
 * 2. verifyPassword - Vérifie un mot de passe correct
 * 3. verifyPassword - Rejette un mot de passe incorrect
 */

import { describe, test, expect } from '@jest/globals'
import { hashPassword, verifyPassword } from './password.js'

describe('Password Utils', () => {
	// ===========================================
	// 1. HASH PASSWORD - SUCCESS
	// ===========================================
	test('hashPassword should create a valid argon2 hash', async () => {
		const password = 'SecurePassword123!'
		const hash = await hashPassword(password)

		// Vérifier que le hash est créé
		expect(hash).toBeDefined()
		expect(typeof hash).toBe('string')
		expect(hash.length).toBeGreaterThan(50)

		// Vérifier que le hash commence par $argon2id$
		expect(hash).toMatch(/^\$argon2id\$/)
	})

	// ===========================================
	// 2. VERIFY PASSWORD - SUCCESS
	// ===========================================
	test('verifyPassword should validate correct password', async () => {
		const password = 'MyTestPassword456!'
		const hash = await hashPassword(password)

		const isValid = await verifyPassword(hash, password)
		expect(isValid).toBe(true)
	})

	// ===========================================
	// 3. VERIFY PASSWORD - FAILURE (Wrong password)
	// ===========================================
	test('verifyPassword should reject incorrect password', async () => {
		const password = 'CorrectPassword'
		const wrongPassword = 'WrongPassword'
		const hash = await hashPassword(password)

		const isValid = await verifyPassword(hash, wrongPassword)
		expect(isValid).toBe(false)
	})

	// ===========================================
	// 4. VERIFY PASSWORD - FAILURE (Invalid hash)
	// ===========================================
	test('verifyPassword should return false for invalid hash', async () => {
		const isValid = await verifyPassword('invalid-hash-format', 'password123')
		expect(isValid).toBe(false)
	})
})

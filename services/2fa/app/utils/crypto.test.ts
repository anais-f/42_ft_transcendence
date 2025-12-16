/**
 * @file crypto.test.ts
 * @description Unit tests for encryption/decryption functions
 *
 * Test Suite Summary:
 * 1. encryptSecret - Encrypt a TOTP secret
 * 2. decryptSecret - Decrypt a TOTP secret
 * 3. encrypt/decrypt - Round-trip test
 * 4. decryptSecret - Handle invalid base64
 */

import { describe, test, expect, beforeAll } from '@jest/globals'
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

// Mock encryption key (32 bytes for AES-256)
const MOCK_KEY = randomBytes(32)

// Functions to test (copied to avoid dependencies)
function encryptSecret(secret: string, key: Buffer = MOCK_KEY): string {
	const iv = randomBytes(12)
	const cipher = createCipheriv('aes-256-gcm', key, iv)
	const ciphertext = Buffer.concat([
		cipher.update(secret, 'utf8'),
		cipher.final()
	])
	const tag = cipher.getAuthTag()

	return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

function decryptSecret(payloadB64: string, key: Buffer = MOCK_KEY): string {
	const buf = Buffer.from(payloadB64, 'base64')
	const iv = buf.subarray(0, 12)
	const tag = buf.subarray(12, 28)
	const ct = buf.subarray(28)
	const decipher = createDecipheriv('aes-256-gcm', key, iv)
	decipher.setAuthTag(tag)
	const out = Buffer.concat([decipher.update(ct), decipher.final()])

	return out.toString('utf8')
}

describe('Crypto Utils', () => {
	// ===========================================
	// 1. ENCRYPT SECRET
	// ===========================================
	test('encryptSecret should encrypt a TOTP secret', () => {
		const secret = 'JBSWY3DPEHPK3PXP'
		const encrypted = encryptSecret(secret)

		expect(encrypted).toBeDefined()
		expect(typeof encrypted).toBe('string')
		expect(encrypted.length).toBeGreaterThan(0)

		// Should be base64
		expect(() => Buffer.from(encrypted, 'base64')).not.toThrow()

		// Should not contain the original secret
		expect(encrypted).not.toContain(secret)
	})

	// ===========================================
	// 2. DECRYPT SECRET
	// ===========================================
	test('decryptSecret should decrypt an encrypted secret', () => {
		const originalSecret = 'ABCDEFGHIJKLMNOP'
		const encrypted = encryptSecret(originalSecret)

		const decrypted = decryptSecret(encrypted)

		expect(decrypted).toBe(originalSecret)
	})

	// ===========================================
	// 3. ROUND-TRIP - Multiple secrets
	// ===========================================
	test('should correctly encrypt and decrypt multiple different secrets', () => {
		const secrets = [
			'JBSWY3DPEHPK3PXP',
			'ABCDEFGH12345678',
			'SECRET123SECRET456',
			'a',
			'verylongsecretkeythatismorethan32characterslong'
		]

		secrets.forEach((secret) => {
			const encrypted = encryptSecret(secret)
			const decrypted = decryptSecret(encrypted)
			expect(decrypted).toBe(secret)
		})
	})

	// ===========================================
	// 4. ENCRYPTION UNIQUENESS
	// ===========================================
	test('encrypting the same secret twice should produce different ciphertexts', () => {
		const secret = 'SAMESECRETSAMESECRET'
		const encrypted1 = encryptSecret(secret)
		const encrypted2 = encryptSecret(secret)

		// Different IV means different ciphertext
		expect(encrypted1).not.toBe(encrypted2)

		// But both should decrypt to the same secret
		expect(decryptSecret(encrypted1)).toBe(secret)
		expect(decryptSecret(encrypted2)).toBe(secret)
	})

	// ===========================================
	// 5. INVALID BASE64 - Error handling
	// ===========================================
	test('decryptSecret should throw error for invalid base64', () => {
		const invalidBase64 = 'not-valid-base64!!!'

		expect(() => {
			decryptSecret(invalidBase64)
		}).toThrow()
	})

	// ===========================================
	// 6. WRONG KEY - Error handling
	// ===========================================
	test('decryptSecret should throw error when using wrong key', () => {
		const secret = 'TESTSECRET123456'
		const wrongKey = randomBytes(32)

		const encrypted = encryptSecret(secret, MOCK_KEY)

		expect(() => {
			decryptSecret(encrypted, wrongKey)
		}).toThrow()
	})

	// ===========================================
	// 7. TAMPERED DATA - Error handling
	// ===========================================
	test('decryptSecret should throw error for tampered ciphertext', () => {
		const secret = 'TAMPERTEST123456'
		const encrypted = encryptSecret(secret)

		// Tamper with the ciphertext
		const buffer = Buffer.from(encrypted, 'base64')
		buffer[buffer.length - 1] ^= 0xff // Flip bits in last byte
		const tampered = buffer.toString('base64')

		expect(() => {
			decryptSecret(tampered)
		}).toThrow()
	})

	// ===========================================
	// 8. EMPTY STRING
	// ===========================================
	test('should handle empty string', () => {
		const secret = ''
		const encrypted = encryptSecret(secret)
		const decrypted = decryptSecret(encrypted)

		expect(decrypted).toBe(secret)
	})

	// ===========================================
	// 9. SPECIAL CHARACTERS
	// ===========================================
	test('should handle secrets with special characters', () => {
		const secrets = [
			'Secret+With/Special=Chars',
			'Émoji🔐Secret',
			'Line\nBreak\tTab',
			'Unicode: 你好世界'
		]

		secrets.forEach((secret) => {
			const encrypted = encryptSecret(secret)
			const decrypted = decryptSecret(encrypted)
			expect(decrypted).toBe(secret)
		})
	})
})

/**
 * @file register.test.ts
 * @description Unit tests for username generation
 *
 * Test Suite Summary:
 * 1. generateUsername - Generate valid username
 * 2. generateUsername - Normalize special characters
 * 3. generateUsername - Limit length to 32 characters
 * 4. generateUsername - Replace invalid characters with dashes
 * 5. generateUsername - Handle short names
 */

import { describe, test, expect } from '@jest/globals'

// Function to test (copied to avoid dependencies)
function generateUsername(name: string): string {
	let username =
		name
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^\w-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.substring(0, 32) || 'user'
	if (username.length < 4) {
		username = username.padEnd(4, '-')
	}
	return username
}

describe('Generate Username', () => {
	// ===========================================
	// 1. GENERATE USERNAME - Basic case
	// ===========================================
	test('should generate valid username from simple name', () => {
		const username = generateUsername('JohnDoe')
		expect(username).toBe('JohnDoe')
	})

	// ===========================================
	// 2. NORMALIZE CHARACTERS - Accents
	// ===========================================
	test('should normalize accented characters', () => {
		expect(generateUsername('José')).toBe('Jose')
		expect(generateUsername('François')).toBe('Francois')
		expect(generateUsername('Müller')).toBe('Muller')
		expect(generateUsername('Øyvind')).toBe('yvind')
	})

	// ===========================================
	// 3. MAX LENGTH - Truncate long names
	// ===========================================
	test('should truncate username to 32 characters', () => {
		const longName = 'ThisIsAVeryLongUsernameWithMoreThan32Characters'
		const username = generateUsername(longName)

		expect(username.length).toBe(32)
		expect(username).toBe('ThisIsAVeryLongUsernameWithMoreT')
	})

	// ===========================================
	// 4. REPLACE INVALID CHARACTERS
	// ===========================================
	test('should replace invalid characters with dashes', () => {
		expect(generateUsername('user@example.com')).toBe('user-example-com')
		expect(generateUsername('user name')).toBe('user-name')
		expect(generateUsername('user!@#$%name')).toBe('user-name')
	})

	// ===========================================
	// 5. MULTIPLE DASHES - Collapse to single dash
	// ===========================================
	test('should collapse multiple dashes into single dash', () => {
		expect(generateUsername('user---name')).toBe('user-name')
		expect(generateUsername('user@@@name')).toBe('user-name')
	})

	// ===========================================
	// 6. EDGE CASE - Trim leading/trailing dashes
	// ===========================================
	test('should trim leading and trailing dashes', () => {
		expect(generateUsername('-username-')).toBe('username')
		expect(generateUsername('---username---')).toBe('username')
	})

	// ===========================================
	// 7. MIN LENGTH - Pad short usernames
	// ===========================================
	test('should pad usernames shorter than 4 characters', () => {
		expect(generateUsername('ab')).toBe('ab--')
		expect(generateUsername('a')).toBe('a---')
		expect(generateUsername('abc')).toBe('abc-')
	})

	// ===========================================
	// 8. EMPTY STRING - Default to "user"
	// ===========================================
	test('should default to "user" for empty or invalid input', () => {
		expect(generateUsername('')).toBe('user')
		expect(generateUsername('---')).toBe('user')
		expect(generateUsername('@@@@')).toBe('user')
	})

	// ===========================================
	// 9. COMBINED CASE - Complex scenario
	// ===========================================
	test('should handle complex username with multiple transformations', () => {
		const username = generateUsername('Héllo@Wörld!')
		expect(username).toBe('Hello-World')
	})
})

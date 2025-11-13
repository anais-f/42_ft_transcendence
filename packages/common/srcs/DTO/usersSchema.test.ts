import { describe, test, expect } from '@jest/globals'
import {
	RegisterLoginSchema,
	UserIdSchema,
	PublicUserAuthSchema,
	UserPublicProfileSchema
} from './usersSchema.js'

describe('usersSchema', () => {
	test('RegisterLoginSchema validates good payload and rejects forbidden login prefix', () => {
		const good = RegisterLoginSchema.safeParse({ login: 'regularUser' })
		expect(good.success).toBe(true)
		const bad = RegisterLoginSchema.safeParse({ login: 'adminUser' })
		expect(bad.success).toBe(false)
	})

	test('UserIdSchema validates correct length and rejects wrong size', () => {
		const ok = UserIdSchema.safeParse({
			id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
		})
		expect(ok.success).toBe(true)
		const bad = UserIdSchema.safeParse({ id: 'too-short-id' })
		expect(bad.success).toBe(false)
	})

	test('PublicUserAuthSchema allows undefined optional fields and rejects too short login', () => {
		expect(
			PublicUserAuthSchema.safeParse({ login: 'publicUser' }).success
		).toBe(true)
		expect(PublicUserAuthSchema.safeParse({ login: 'ab' }).success).toBe(false)
	})

	test('UserPublicProfileSchema accepts minimal profile and rejects short login', () => {
		expect(
			UserPublicProfileSchema.safeParse({ login: 'publicUser' }).success
		).toBe(true)
		expect(UserPublicProfileSchema.safeParse({ login: 'pw' }).success).toBe(
			false
		)
	})
})

import { describe, test, expect } from '@jest/globals'
import {
	RegisterSchema,
	LoginActionSchema,
	RegisterGoogleSchema
} from './authSchema.js'

describe('authSchema', () => {
	test('RegisterSchema validates good payload and rejects short password', () => {
		const ok = RegisterSchema.safeParse({
			login: 'validLogin',
			password: 'password1'
		})
		expect(ok.success).toBe(true)
		const bad = RegisterSchema.safeParse({
			login: 'validLogin',
			password: 'short'
		})
		expect(bad.success).toBe(false)
	})

	test('LoginActionSchema enforces min length', () => {
		const ok = LoginActionSchema.safeParse({
			login: 'john_doe',
			password: 'superpass'
		})
		expect(ok.success).toBe(true)
		const bad = LoginActionSchema.safeParse({
			login: 'jd',
			password: 'superpass'
		})
		expect(bad.success).toBe(false)
	})

	test('RegisterGoogleSchema requires non-empty google_id', () => {
		expect(
			RegisterGoogleSchema.safeParse({ google_id: 'gid-123' }).success
		).toBe(true)
		expect(RegisterGoogleSchema.safeParse({ google_id: '' }).success).toBe(
			false
		)
	})
})

import { jest } from '@jest/globals'

// We mock argon2 to avoid heavy hashing cost and to control outputs
const hashMock: jest.MockedFunction<
	(password: string, opts: any) => Promise<string>
> = jest.fn()
const verifyMock: jest.MockedFunction<
	(hash: string, password: string) => Promise<boolean>
> = jest.fn()

await jest.unstable_mockModule('argon2', () => ({
	__esModule: true,
	default: { hash: hashMock, verify: verifyMock },
	hash: hashMock,
	verify: verifyMock,
	argon2id: 2
}))

const { hashPassword, verifyPassword } = await import('./password.js')

describe('password utils', () => {
	beforeEach(() => {
		jest.resetAllMocks()
	})

	test('hashPassword passes argon2id and returns hash', async () => {
		hashMock.mockResolvedValue('hashed-value')
		const result = await hashPassword('supersecret')
		expect(result).toBe('hashed-value')
		expect(hashMock).toHaveBeenCalledWith(
			'supersecret',
			expect.objectContaining({ type: 2 })
		)
	})

	test('verifyPassword returns true when argon2.verify succeeds', async () => {
		verifyMock.mockResolvedValue(true)
		const ok = await verifyPassword('hashed-value', 'supersecret')
		expect(ok).toBe(true)
		expect(verifyMock).toHaveBeenCalledWith('hashed-value', 'supersecret')
	})

	test('verifyPassword returns false for mismatch', async () => {
		verifyMock.mockResolvedValue(false)
		const ok = await verifyPassword('hashed-value', 'wrong')
		expect(ok).toBe(false)
	})
})

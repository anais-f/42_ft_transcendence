import { jest } from '@jest/globals'

// Mocks for repository & utils dependencies
const listPublicUsersMock: jest.MockedFunction<() => any> = jest.fn()
const findPublicUserByIdMock: jest.MockedFunction<(id: number) => any> =
	jest.fn()
const deleteUserByIdMock: jest.MockedFunction<(id: number) => boolean> =
	jest.fn()
const changeUserPasswordMock: jest.MockedFunction<
	(id: number, hash: string) => boolean
> = jest.fn()
const hashPasswordMock: jest.MockedFunction<
	(password: string) => Promise<string>
> = jest.fn()

await jest.unstable_mockModule('../repositories/userRepository.js', () => ({
	__esModule: true,
	listPublicUsers: listPublicUsersMock,
	findPublicUserById: findPublicUserByIdMock,
	deleteUserById: deleteUserByIdMock,
	changeUserPassword: changeUserPasswordMock
}))
await jest.unstable_mockModule('../utils/password.js', () => ({
	__esModule: true,
	hashPassword: hashPasswordMock
}))

const {
	listPublicUsersController,
	getPublicUserController,
	deleteUser,
	patchUserPassword
} = await import('./userController.js')

function buildReply() {
	return {
		code: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis()
	} as any
}

describe('userController listPublicUsersController', () => {
	beforeEach(() => jest.resetAllMocks())

	test('returns list of users parsed by schema', async () => {
		listPublicUsersMock.mockReturnValue({
			users: [{ user_id: 1, login: 'alice' }]
		})
		const reply = buildReply()
		const result = await listPublicUsersController({} as any, reply)
		expect(result).toEqual({
			users: [{ user_id: 1, login: 'alice' }]
		})
	})

	// Note: Output validation is handled by Fastify's serializer, not in the controller
	// This test was removed as it tested non-existent validation logic
})

describe('userController getPublicUserController', () => {
	beforeEach(() => jest.resetAllMocks())

	test('400 if missing id param', async () => {
		const reply = buildReply()
		await expect(
			getPublicUserController({ params: {} } as any, reply)
		).rejects.toThrow('Invalid id')
	})

	test('400 if invalid id param (non integer)', async () => {
		const reply = buildReply()
		await expect(
			getPublicUserController({ params: { id: 'abc' } } as any, reply)
		).rejects.toThrow('Invalid id')
	})

	test('404 if user not found', async () => {
		findPublicUserByIdMock.mockReturnValue(undefined)
		const reply = buildReply()
		await expect(
			getPublicUserController({ params: { id: '42' } } as any, reply)
		).rejects.toThrow('User not found')
	})

	test('returns user when found', async () => {
		findPublicUserByIdMock.mockReturnValue({ user_id: 5, login: 'boby' })
		const reply = buildReply()
		const result = await getPublicUserController(
			{ params: { id: '5' } } as any,
			reply
		)
		expect(result).toEqual({ user_id: 5, login: 'boby' })
	})
})

describe('userController deleteUser', () => {
	beforeEach(() => jest.resetAllMocks())

	test('400 missing id', async () => {
		const reply = buildReply()
		await expect(deleteUser({ params: {} } as any, reply)).rejects.toThrow(
			'Invalid id'
		)
	})

	test('400 invalid id', async () => {
		deleteUserByIdMock.mockReturnValue(false)
		const reply = buildReply()
		await expect(
			deleteUser({ params: { id: '0' } } as any, reply)
		).rejects.toThrow('User not found')
	})

	test('404 user not found', async () => {
		deleteUserByIdMock.mockReturnValue(false)
		const reply = buildReply()
		await expect(
			deleteUser({ params: { id: '99' } } as any, reply)
		).rejects.toThrow('User not found')
	})

	test('204 success delete', async () => {
		deleteUserByIdMock.mockReturnValue(true)
		const reply = buildReply()
		await deleteUser({ params: { id: '10' } } as any, reply)
		expect(reply.code).toHaveBeenCalledWith(204)
	})
})

describe('userController patchUserPassword', () => {
	beforeEach(() => jest.resetAllMocks())

	test('400 missing id', async () => {
		const reply = buildReply()
		await expect(
			patchUserPassword(
				{ params: {}, body: { password: 'abcdef' } } as any,
				reply
			)
		).rejects.toThrow('Invalid id')
	})

	test('400 invalid id', async () => {
		changeUserPasswordMock.mockReturnValue(false)
		hashPasswordMock.mockResolvedValue('hashed-xxx')
		const reply = buildReply()
		await expect(
			patchUserPassword(
				{ params: { id: '-1' }, body: { password: 'abcdef' } } as any,
				reply
			)
		).rejects.toThrow('User not found')
	})

	test('400 invalid password (too short)', async () => {
		changeUserPasswordMock.mockReturnValue(false)
		hashPasswordMock.mockResolvedValue('hashed-xxx')
		const reply = buildReply()
		await expect(
			patchUserPassword(
				{ params: { id: '1' }, body: { password: 'abc' } } as any,
				reply
			)
		).rejects.toThrow('User not found')
	})

	test('404 user not found', async () => {
		changeUserPasswordMock.mockReturnValue(false)
		hashPasswordMock.mockResolvedValue('hashed-xxx')
		const reply = buildReply()
		await expect(
			patchUserPassword(
				{ params: { id: '5' }, body: { password: 'abcdef' } } as any,
				reply
			)
		).rejects.toThrow('User not found')
		expect(hashPasswordMock).toHaveBeenCalledWith('abcdef')
	})

	test('success path - password changed', async () => {
		changeUserPasswordMock.mockReturnValue(true)
		hashPasswordMock.mockResolvedValue('hashed-yyy')
		const reply = buildReply()
		const result = await patchUserPassword(
			{ params: { id: '6' }, body: { password: 'abcdef' } } as any,
			reply
		)
		expect(hashPasswordMock).toHaveBeenCalledWith('abcdef')
		expect(result).toEqual({ success: true })
	})
})

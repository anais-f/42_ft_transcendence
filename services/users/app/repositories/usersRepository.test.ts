import { jest } from '@jest/globals'

let UsersRepository: any
let db: any

beforeAll(async () => {
	await jest.unstable_mockModule('../database/usersDatabase.js', () => ({
		db: {
			prepare: jest.fn(),
			transaction: jest.fn((fn: any) => fn)
		}
	}))
	;({ db } = await import('../database/usersDatabase.js'))
	;({ UsersRepository } = await import('./usersRepository.js'))
})

describe('UsersRepository', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	test('existsById returns true if user exists', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue({ id_user: 'u1' })
		})
		expect(UsersRepository.existsById({ id_user: 'u1' })).toBe(true)
	})

	test('existsById returns false if user does not exist', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue(undefined)
		})
		expect(UsersRepository.existsById({ id_user: 'nope' })).toBe(false)
	})

	test('insertUser inserts one user with default values', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		UsersRepository.insertUser({ id_user: 42 })
		expect(db.prepare).toHaveBeenCalledWith(
			'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
		)
		expect(run).toHaveBeenCalledWith(42, '/avatars/img_default.png', 1, expect.any(String))
	})

	test('insertManyUsers inserts multiple users in a transaction', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		db.transaction.mockImplementationOnce((fn: any) => fn)

		UsersRepository.insertManyUsers([{ id_user: 1 }, { id_user: 2 }])

		expect(db.prepare).toHaveBeenCalledWith(
			'INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)'
		)
		expect(db.transaction).toHaveBeenCalled()
		expect(run).toHaveBeenCalledTimes(2)
		expect(run).toHaveBeenNthCalledWith(
			1,
			1,
			'/avatars/img_default.png',
			1,
			expect.any(String)
		)
		expect(run).toHaveBeenNthCalledWith(
			2,
			2,
			'/avatars/img_default.png',
			1,
			expect.any(String)
		)
	})

	test('updateUserStatus updates status by id', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		UsersRepository.updateUserStatus({ id_user: 7, status: 0 })
		expect(db.prepare).toHaveBeenCalledWith(
			'UPDATE users SET status = ? WHERE id_user = ?'
		)
		expect(run).toHaveBeenCalledWith(0, 7)
	})

	test('updateLastConnection updates last_connection by id', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		UsersRepository.updateLastConnection({ id_user: 7 })
		expect(db.prepare).toHaveBeenCalledWith(
			'UPDATE users SET last_connection = ? WHERE id_user = ?'
		)
		expect(run).toHaveBeenCalledWith(expect.any(String), 7)
	})

	test('updateUserAvatar updates avatar by id', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		UsersRepository.updateUserAvatar({ id_user: 7, avatar: 'a.png' })
		expect(db.prepare).toHaveBeenCalledWith(
			'UPDATE users SET avatar = ? WHERE id_user = ?'
		)
		expect(run).toHaveBeenCalledWith('a.png', 7)
	})

	test('getUserById returns user when found', () => {
		const fake = {
			id_user: 1,
			avatar: 'img_default.png',
			status: 1,
			last_connection: 'now'
		}
		db.prepare.mockReturnValueOnce({ get: jest.fn().mockReturnValue(fake) })
		const res = UsersRepository.getUserById({ id_user: 1 })
		expect(db.prepare).toHaveBeenCalledWith(
			'SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?'
		)
		expect(res).toEqual(fake)
	})

	test('getUserById returns undefined when not found', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue(undefined)
		})
		const res = UsersRepository.getUserById({ id_user: 999 })
		expect(res).toBeUndefined()
	})

	test('getStatusById returns status', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue({ status: 1 })
		})
		expect(UsersRepository.getStatusById({ id_user: 1 })).toBe(1)
	})

	test('getLastConnectionById returns last_connection', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue({ last_connection: 'now' })
		})
		expect(UsersRepository.getLastConnectionById({ id_user: 1 })).toBe('now')
	})

	test('getAvatarById returns avatar', () => {
		db.prepare.mockReturnValueOnce({
			get: jest.fn().mockReturnValue({ avatar: 'img.png' })
		})
		expect(UsersRepository.getAvatarById({ id_user: 1 })).toBe('img.png')
	})

	test('getAllUsers returns list of users', () => {
		const rows = [{ id_user: 1 }, { id_user: 2 }]
		db.prepare.mockReturnValueOnce({ all: jest.fn().mockReturnValue(rows) })
		expect(UsersRepository.getAllUsers()).toEqual(rows)
	})

	test('getOnlineUsers returns list of online users', () => {
		const rows = [{ id_user: 1 }]
		db.prepare.mockReturnValueOnce({ all: jest.fn().mockReturnValue(rows) })
		expect(UsersRepository.getOnlineUsers()).toEqual(rows)
	})

	test('deleteUserById deletes by id', () => {
		const run = jest.fn()
		db.prepare.mockReturnValueOnce({ run })
		UsersRepository.deleteUserById({ id_user: 3 })
		expect(db.prepare).toHaveBeenCalledWith(
			'DELETE FROM users WHERE id_user = ?'
		)
		expect(run).toHaveBeenCalledWith(3)
	})
})

jest.mock('../database/usersDatabase', () => ({
  db: {
    prepare: jest.fn(),
    transaction: jest.fn((fn: any) => fn),
  },
}))

import { UsersRepository } from './usersRepository'
import { db } from '../database/usersDatabase'

describe('UsersRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('existsById returns true if user exists', () => {
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id_user: 'some-id' }) })
    const user = { id_user: 'some-id' }
    expect(UsersRepository.existsById(user)).toBe(true)
  })

  test('existsById returns false if user does not exist', () => {
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue(undefined) })
    const user = { id_user: 'not-found' }
    expect(UsersRepository.existsById(user)).toBe(false)
  })

  test('insertUser calls prepare and run with correct params', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    const user = { id_user: 42 }
    UsersRepository.insertUser(user)
    expect(db.prepare).toHaveBeenCalledWith('INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)')
    expect(mockRun).toHaveBeenCalledWith(42, '../img.png', 1, expect.any(String))
  })

  test('insertManyUsers calls transaction and run for each user', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    const mockTransaction = jest.fn((fn) => fn)
    ;(db.transaction as jest.Mock).mockImplementationOnce(mockTransaction)
    const users = [{ id_user: 1 }, { id_user: 2 }]
    UsersRepository.insertManyUsers(users)
    expect(db.prepare).toHaveBeenCalledWith('INSERT OR IGNORE INTO users (id_user, avatar, status, last_connection) VALUES (?, ?, ?, ?)')
    expect(mockRun).toHaveBeenCalledTimes(2)
    expect(mockRun).toHaveBeenCalledWith(1, '../img.png', 1, expect.any(String))
    expect(mockRun).toHaveBeenCalledWith(2, '../img.png', 1, expect.any(String))
  })

  test('updateUserStatus calls prepare and run with correct params', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    UsersRepository.updateUserStatus({ id_user: 1, status: 0 })
    expect(db.prepare).toHaveBeenCalledWith('UPDATE users SET status = ? WHERE id_user = ?')
    expect(mockRun).toHaveBeenCalledWith(0, 1)
  })

  test('updateLastConnection calls prepare and run with correct params', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    UsersRepository.updateLastConnection({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('UPDATE users SET last_connection = ? WHERE id_user = ?')
    expect(mockRun).toHaveBeenCalledWith(expect.any(String), 1)
  })

  test('updateUserAvatar calls prepare and run with correct params', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    UsersRepository.updateUserAvatar({ id_user: 1, avatar: 'img.png' })
    expect(db.prepare).toHaveBeenCalledWith('UPDATE users SET avatar = ? WHERE id_user = ?')
    expect(mockRun).toHaveBeenCalledWith('img.png', 1)
  })

  test('getUserById returns user', () => {
    const fakeUser = { id_user: 1, avatar: 'img.png', status: 1, last_connection: 'now' }
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue(fakeUser) })
    const res = UsersRepository.getUserById({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('SELECT id_user, avatar, status, last_connection FROM users WHERE id_user = ?')
    expect(res).toEqual(fakeUser)
  })

  test('getStatusById returns status', () => {
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue({ status: 1 }) })
    const res = UsersRepository.getStatusById({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('SELECT status FROM users WHERE id_user = ?')
    expect(res).toBe(1)
  })

  test('getLastConnectionById returns last_connection', () => {
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue({ last_connection: 'now' }) })
    const res = UsersRepository.getLastConnectionById({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('SELECT last_connection FROM users WHERE id_user = ?')
    expect(res).toBe('now')
  })

  test('getAvatarById returns avatar', () => {
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue({ avatar: 'img.png' }) })
    const res = UsersRepository.getAvatarById({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('SELECT avatar FROM users WHERE id_user = ?')
    expect(res).toBe('img.png')
  })

  test('getAllUsers returns all users', () => {
    const fakeUsers = [{ id_user: 1 }, { id_user: 2 }]
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ all: jest.fn().mockReturnValue(fakeUsers) })
    const res = UsersRepository.getAllUsers()
    expect(db.prepare).toHaveBeenCalledWith('SELECT id_user, avatar, status, last_connection FROM users')
    expect(res).toEqual(fakeUsers)
  })

  test('getOnlineUsers returns online users', () => {
    const fakeUsers = [{ id_user: 1 }]
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ all: jest.fn().mockReturnValue(fakeUsers) })
    const res = UsersRepository.getOnlineUsers()
    expect(db.prepare).toHaveBeenCalledWith('SELECT id_user, avatar, status, last_connection FROM users WHERE status = 1')
    expect(res).toEqual(fakeUsers)
  })

  test('deleteUserById calls prepare and run with correct param', () => {
    const mockRun = jest.fn()
    ;(db.prepare as jest.Mock).mockReturnValueOnce({ run: mockRun })
    UsersRepository.deleteUserById({ id_user: 1 })
    expect(db.prepare).toHaveBeenCalledWith('DELETE FROM users WHERE id_user = ?')
    expect(mockRun).toHaveBeenCalledWith(1)
  })
})
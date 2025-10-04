import { UsersRepository } from './usersRepository'
import { db } from '../database/usersDatabase'

// Mock la base SQLite
jest.mock('../database/usersDatabase', () => ({
  db: {
    prepare: jest.fn(() => ({
      get: jest.fn(),
      run: jest.fn(),
      all: jest.fn(),
    })),
    transaction: jest.fn(fn => fn),
  }
}))

describe('UsersRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('existsById returns true if user exists', () => {
    (db.prepare).mockReturnValue({
      get: jest.fn().mockReturnValue({}),
    })
    const result = UsersRepository.existsById({ id_user: 1 })
    expect(result).toBe(true)
  })

  test('existsById returns false if user does not exist', () => {
    (db.prepare).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    })
    const result = UsersRepository.existsById({ id_user: 42 })
    expect(result).toBe(false)
  })

  test('insertUser calls run with correct params', () => {
    const runMock = jest.fn()
    (db.prepare).mockReturnValue({ run: runMock })
    UsersRepository.insertUser({ id_user: 2 })
    expect(runMock).toHaveBeenCalled()
  })

  test('getUserById returns user object', () => {
    const user = { id_user: 1, avatar: 'img.png', status: 1, last_connection: 'now' }
    (db.prepare).mockReturnValue({
      get: jest.fn().mockReturnValue(user),
    })
    const result = UsersRepository.getUserById({ id_user: 1 })
    expect(result).toEqual(user)
  })

  test('deleteUserById calls run', () => {
    const runMock = jest.fn()
    (db.prepare).mockReturnValue({ run: runMock })
    UsersRepository.deleteUserById({ id_user: 1 })
    expect(runMock).toHaveBeenCalledWith(1)
  })
})
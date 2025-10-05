jest.mock('../database/usersDatabase', () => ({
  db: {
    prepare: jest.fn().mockReturnValue({ get: jest.fn().mockReturnValue({ id_user: 'some-id' }) }),
    transaction: jest.fn((fn: any) => fn),
  },
}))

import { UsersRepository } from './usersRepository'
import { db } from '../database/usersDatabase'

test('existsById returns true if user exists', () => {
  const user = { id_user: 'some-id' }
  ;(db.prepare as jest.Mock).mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id_user: 'some-id' }) })
  expect(UsersRepository.existsById(user)).toBe(true)
})
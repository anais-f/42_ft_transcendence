import { jest, describe, beforeAll, beforeEach, afterAll, test, expect } from '@jest/globals'
import BetterSqlite3 from 'better-sqlite3'
import type { Database } from 'better-sqlite3'

let db: Database

// Mock the connection module to return our in-memory DB
await (jest as any).unstable_mockModule('../database/connection.js', () => ({
  __esModule: true,
  getDb: () => db,
  runMigrations: () => {}
}))

const repo = await import('./userRepository.js')

beforeAll(() => {
  db = new BetterSqlite3(':memory:')
  // same schema as runMigrations in connection.ts
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT,
      google_id TEXT UNIQUE,
      is_admin BOOLEAN DEFAULT FALSE
    );
  `)
})

beforeEach(() => {
  db.exec('DELETE FROM users')
})

afterAll(() => {
  db.close()
})

describe('userRepository (integration with in-memory DB)', () => {
  test('createUser and findUserByLogin', () => {
    repo.createUser('alice', 'hash123')
    const user = repo.findUserByLogin('alice')
    expect(user?.login).toBe('alice')
    expect(user?.password).toBe('hash123')
    // better-sqlite3 returns 0/1 for booleans; accept either false or 0 here
    expect([0, false]).toContain((user as any)?.is_admin)
  })

  test('createAdminUser sets is_admin=1', () => {
    repo.createAdminUser('root', 'hash999')
    const user = repo.findUserByLogin('root') as any
    expect(user?.is_admin).toBe(1)
  })

  test('findPublicUserByLogin returns partial projection', () => {
    repo.createUser('bob', 'x')
    const pub = repo.findPublicUserByLogin('bob')
    expect(pub).toMatchObject({ login: 'bob' })
    // should not expose password
    expect((pub as any).password).toBeUndefined()
  })

  test('listPublicUsers returns array', () => {
    repo.createUser('u1', 'x')
    repo.createUser('u2', 'x')
    const list = repo.listPublicUsers()
    expect(list?.users.map(u => u.login)).toEqual(expect.arrayContaining(['u1','u2']))
  })

  test('deleteUserById removes a row', () => {
    repo.createUser('to-del', 'x')
    const { user_id } = db.prepare('SELECT user_id FROM users WHERE login=?').get('to-del') as { user_id: number }
    const ok = repo.deleteUserById(user_id)
    expect(ok).toBe(true)
    const after = repo.findPublicUserById(user_id)
    expect(after).toBeUndefined()
  })

  test('createGoogleUser and findUserByGoogleId', () => {
    repo.createGoogleUser('gid-123')
    const u = repo.findUserByGoogleId('gid-123')
    expect(u?.login).toBe('google-gid-123')
  })

  test('changeUserPassword updates row', () => {
    repo.createUser('eve', 'old')
    const { user_id } = db.prepare('SELECT user_id FROM users WHERE login=?').get('eve') as { user_id: number }
    const ok = repo.changeUserPassword(user_id, 'new')
    expect(ok).toBe(true)
    const row = db.prepare('SELECT password FROM users WHERE user_id=?').get(user_id) as { password: string }
    expect(row.password).toBe('new')
  })
})
